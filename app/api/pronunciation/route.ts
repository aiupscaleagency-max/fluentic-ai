import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getLanguage, isValidLangCode } from "@/lib/languages";
import { MODEL } from "@/lib/llm";
import { CEFR_LEVELS, type CefrLevel } from "@/lib/level";
import { TRACKS, type TrackId, tracksFocusLine } from "@/lib/track-data";
import { similarityScore } from "@/lib/similarity";
import { getGoogleApiKey } from "@/lib/env";
import {
  explainGuidance,
  isExplainLang,
  type ExplainLang,
} from "@/lib/explain-lang-server";

export const runtime = "nodejs";

interface PronBody {
  target: string;
  recognized: string;
  language: string;
  level?: string;
  // String (legacy) eller string[] (multi-track)
  track?: string | string[];
  // Vilket språk tips & commonMistakes ska skrivas på
  explainLang?: ExplainLang;
}

function trackFocusLine(track?: string | string[]): string {
  if (!track) return "";
  const arr = Array.isArray(track) ? track : [track];
  const valid = arr.filter((t): t is TrackId => TRACKS.some((tt) => tt.id === t));
  if (valid.length === 0) return "";
  return tracksFocusLine(valid);
}

export async function POST(req: Request) {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google API-nyckel saknas (sätt GOOGLE_AI_API_KEY)" },
      { status: 500 },
    );
  }

  let body: PronBody;
  try {
    body = (await req.json()) as PronBody;
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  if (!body?.target?.trim() || !body?.recognized?.trim()) {
    return NextResponse.json({ error: "target och recognized krävs" }, { status: 400 });
  }
  if (!isValidLangCode(body.language)) {
    return NextResponse.json({ error: "Ogiltigt språk" }, { status: 400 });
  }
  const lang = getLanguage(body.language)!;
  const level: CefrLevel = (CEFR_LEVELS as string[]).includes(body.level ?? "")
    ? (body.level as CefrLevel)
    : "A2";

  // Förberäkna similarity som baseline för modellen
  const baseScore = similarityScore(body.target, body.recognized);

  const trackLine = trackFocusLine(body.track);

  // Default sv om klienten inte skickar
  const explainLang: ExplainLang = isExplainLang(body.explainLang)
    ? body.explainLang
    : "sv";
  const ex = explainGuidance(explainLang);

  const system = `You are a strict but encouraging pronunciation coach for a user learning ${lang.native} at CEFR ${level}.
${trackLine}
You ONLY ever reply in ${ex.englishName}. Output a JSON object with this schema:
{
  "score": number,            // 0-100 — how close the recognized text is to the target, accounting for typical TTS-recognizer noise
  "tips": string[],           // 1-4 concrete pronunciation tips in ${ex.englishName} (focus on sounds, stress, intonation)
  "commonMistakes": string    // 1-2 sentences in ${ex.englishName} about what likely went wrong
}`;

  const userPrompt = `Target phrase (${lang.native}): ${body.target}
What the recognizer heard: ${body.recognized}
Levenshtein similarity baseline (reference): ${baseScore}/100

Assess the pronunciation and give the tips in ${ex.englishName}. Be concrete about which sounds or syllables need practice.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: system,
      generationConfig: {
        // Native JSON-läge — undviker att Gemini lägger till markdown-fences
        responseMimeType: "application/json",
        maxOutputTokens: 500,
        temperature: 0.4,
        // 2.5 Flash reasoning av — sparar tokens + svar trunkeras inte
        thinkingConfig: { thinkingBudget: 0 },
      } as Record<string, unknown>,
    });

    const resp = await model.generateContent(userPrompt);
    const raw = (resp.response.text() ?? "").trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Ogiltigt svar från modellen" }, { status: 500 });
    }
    let parsed: { score?: number; tips?: string[]; commonMistakes?: string };
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "Kunde inte tolka uttalssvar" }, { status: 500 });
    }
    return NextResponse.json({
      score: typeof parsed.score === "number" ? Math.round(parsed.score) : baseScore,
      tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 4) : [],
      commonMistakes: parsed.commonMistakes ?? "",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
