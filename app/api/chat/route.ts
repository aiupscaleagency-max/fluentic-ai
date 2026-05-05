import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getLanguage, isValidLangCode } from "@/lib/languages";
import { MODEL } from "@/lib/llm";
import { CEFR_LEVELS, levelGuidance, type CefrLevel } from "@/lib/level";
import { TRACKS, type TrackId } from "@/lib/track";
import { getGoogleApiKey } from "@/lib/env";
import {
  explainGuidance,
  isExplainLang,
  type ExplainLang,
} from "@/lib/explain-lang-server";

export const runtime = "nodejs";

interface ChatBody {
  messages: { role: "user" | "assistant"; content: string }[];
  language: string;
  level?: string;
  // Voice-läge: hoppa över översättningsrad och håll det extra kort
  voice?: boolean;
  // Roll-spel: överstyr default-systemprompt helt (vi lägger fortfarande på regler)
  systemOverride?: string;
  // Track styr vokabulär-fokus (general/business/travel/academic/casual)
  track?: string;
  // Förklaringsspråk: vilket språk AI:n ska skriva förklaringar/översättningar PÅ
  explainLang?: ExplainLang;
}

// Säker fallback om klienten skickar nåt vi inte känner igen
function trackFocusLine(track?: string): string {
  const t = TRACKS.find((tt) => tt.id === (track as TrackId));
  if (!t || t.id === "general") return "";
  return `Focus vocabulary and examples on ${t.focus} contexts.`;
}

export async function POST(req: Request) {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google API-nyckel saknas (sätt GOOGLE_AI_API_KEY)" },
      { status: 500 },
    );
  }

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  if (!body?.language || !isValidLangCode(body.language)) {
    return NextResponse.json({ error: "Ogiltigt språk" }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages krävs" }, { status: 400 });
  }

  const lang = getLanguage(body.language)!;
  const level: CefrLevel = (CEFR_LEVELS as string[]).includes(body.level ?? "")
    ? (body.level as CefrLevel)
    : "A2";

  const trackLine = trackFocusLine(body.track);

  // Default sv om klienten missar att skicka explainLang (bakåtkompat)
  const explainLang: ExplainLang = isExplainLang(body.explainLang)
    ? body.explainLang
    : "sv";
  const ex = explainGuidance(explainLang);

  let system: string;
  if (body.systemOverride && body.systemOverride.trim()) {
    // Roll-spel: persona + obligatoriska regler nedan. Persona kan kräva "JSON only" osv,
    // så vi instruerar bara metaspråket — inte att lägga till översättningsrad.
    system = `${body.systemOverride.trim()}

Adapt vocabulary, grammar, and sentence length to CEFR ${level}. ${levelGuidance(level)}
${trackLine}
Reply ONLY in ${lang.native}. Do not switch to ${ex.englishName} or any other language.
If you need to write meta-commentary, feedback or coaching to the user, use ${ex.englishName}.
Keep replies to 1-3 short sentences.`;
  } else if (body.voice) {
    // Voice-läge: kort och naturligt, ingen extra översättning
    system = `You are a friendly conversation partner helping a user practice ${lang.native}.
The user's preferred explanation language is ${ex.englishName} — use it if you need to clarify something briefly.
Adapt to CEFR ${level}. ${levelGuidance(level)}
${trackLine}
Reply ONLY in ${lang.native} — no ${ex.englishName} translation, no markdown, no emoji.
Keep replies to 1-2 sentences. Ask a follow-up question to keep the conversation going.`;
  } else {
    // Standard chat-läge med översättning under på användarens valda förklaringsspråk
    const exampleTranslations: Record<ExplainLang, string> = {
      sv: "*Hej, hur mår du idag?*",
      es: "*¡Hola! ¿Cómo estás hoy?*",
      en: "*Hi, how are you today?*",
    };
    system = `You are a friendly and encouraging language teacher for a user learning ${lang.native} (${lang.name}).
The user's preferred explanation language is ${ex.englishName}. ALL meta-commentary, translations and corrections must be in ${ex.englishName} — never in any other meta-language.

Adapt vocabulary, grammar, and sentence length to CEFR ${level}. ${levelGuidance(level)}
${trackLine}

Rules:
- ALWAYS reply in ${lang.native} at the right level.
- Directly after your reply, add a translation in ${ex.englishName} on a NEW line in italic markdown (asterisks). Example label: "${ex.italicLabel}".
- If the user writes in ${ex.englishName} or makes a mistake, ${ex.correctVerb} and explain briefly in ${ex.englishName} on the italic line.
- Keep replies short (max 3 sentences) — you are a conversation partner, not a lecturer.
- Ask a follow-up question to keep the conversation going.
- Use only the proper script for ${lang.native} (no emoji).

Format example:
Hola, ¿cómo estás hoy?
${exampleTranslations[explainLang]}`;
  }

  const maxOutputTokens = body.voice || body.systemOverride ? 250 : 400;

  try {
    // Gemini-SDK: skapa klient + modell. systemInstruction ger samma effekt som Anthropics "system".
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: system,
    });

    // Mappa Anthropic/OpenAI-rollerna till Geminis "user"/"model"
    const contents = body.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const resp = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens,
        temperature: 0.8,
        // 2.5 Flash reasoning av — sparar tokens + svar trunkeras inte
        thinkingConfig: { thinkingBudget: 0 },
      } as Record<string, unknown>,
    });

    const reply = (resp.response.text() ?? "").trim();
    if (!reply) {
      return NextResponse.json({ error: "Tomt svar från modellen" }, { status: 500 });
    }
    return NextResponse.json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
