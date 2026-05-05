import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { MODEL } from "@/lib/llm";
import { CEFR_LEVELS, levelGuidance, type CefrLevel } from "@/lib/level";
import { TRACKS, type TrackId, tracksFocusLine } from "@/lib/track-data";
import { getGoogleApiKey } from "@/lib/env";
import {
  explainGuidance,
  isExplainLang,
  type ExplainLang,
} from "@/lib/explain-lang-server";

export const runtime = "nodejs";

interface TranslateBody {
  text: string;
  from: string;
  to: string;
  level?: string;
  // String (legacy) eller string[] (multi-track)
  track?: string | string[];
  // Vilket språk eventuella nivå-/förklaringsnoter ska skrivas på
  explainLang?: ExplainLang;
}

function trackFocusLine(track?: string | string[]): string {
  if (!track) return "";
  const arr = Array.isArray(track) ? track : [track];
  const valid = arr.filter((t): t is TrackId => TRACKS.some((tt) => tt.id === t));
  if (valid.length === 0) return "";
  return tracksFocusLine(valid);
}

// Vi tillåter "sv" + de fyra MVP-språken som källa/mål för tolken
const ALLOWED = new Set(["sv", "es", "en", "fr", "ar"]);
const LANG_NAMES: Record<string, string> = {
  sv: "Swedish",
  es: "Spanish",
  en: "English",
  fr: "French",
  ar: "Arabic",
};

export async function POST(req: Request) {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google API-nyckel saknas (sätt GOOGLE_AI_API_KEY)" },
      { status: 500 },
    );
  }

  let body: TranslateBody;
  try {
    body = (await req.json()) as TranslateBody;
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  if (!body?.text?.trim()) {
    return NextResponse.json({ error: "text krävs" }, { status: 400 });
  }
  if (!ALLOWED.has(body.from) || !ALLOWED.has(body.to)) {
    return NextResponse.json({ error: "Språkkod stöds inte" }, { status: 400 });
  }
  if (body.from === body.to) {
    return NextResponse.json({
      translation: body.text,
    });
  }

  const fromName = LANG_NAMES[body.from];
  const toName = LANG_NAMES[body.to];
  const wantsTranslit = body.to === "ar";
  const level: CefrLevel | null = (CEFR_LEVELS as string[]).includes(body.level ?? "")
    ? (body.level as CefrLevel)
    : null;
  const levelLine = level
    ? `Adapt vocabulary, grammar, sentence length to CEFR ${level}. ${levelGuidance(level)}`
    : "";

  const trackLine = trackFocusLine(body.track);

  // Default sv om klienten inte skickar — bakåtkompat
  const explainLang: ExplainLang = isExplainLang(body.explainLang)
    ? body.explainLang
    : "sv";
  const ex = explainGuidance(explainLang);

  // Vi använder Geminis native JSON-läge (responseMimeType) för pålitlig output.
  const system = `You are a precise translator. ${levelLine}
${trackLine}
Any meta-comment, level note or explanation in the output must be written in ${ex.englishName}.
Output a JSON object with this schema:
{
  "translation": string,         // The translation in ${toName}
  ${wantsTranslit ? `"transliteration": string, // Latin-script transliteration of the Arabic translation\n  ` : ""}"alternative": string         // One natural alternative phrasing in ${toName}
}`;

  const userPrompt = `Translate from ${fromName} to ${toName}:

${body.text}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: system,
      generationConfig: {
        // Tvinga JSON-output direkt från modellen — slipper post-parsing av prosa
        responseMimeType: "application/json",
        maxOutputTokens: 600,
        temperature: 0.2,
        // 2.5 Flash kör reasoning by default — stäng av så svaret inte trunkeras + sparar tokens
        thinkingConfig: { thinkingBudget: 0 },
      } as Record<string, unknown>,
    });

    const resp = await model.generateContent(userPrompt);
    const raw = (resp.response.text() ?? "").trim();

    // Säkerhetsnät om Gemini ändå skulle slänga in något extra runt JSON:en
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Ogiltigt svar från modellen" }, { status: 500 });
    }
    let parsed: { translation?: string; transliteration?: string; alternative?: string };
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "Kunde inte tolka översättningssvar" }, { status: 500 });
    }
    if (!parsed.translation) {
      return NextResponse.json({ error: "Ingen översättning returnerades" }, { status: 500 });
    }
    return NextResponse.json(parsed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
