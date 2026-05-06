import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getLanguage, isValidLangCode } from "@/lib/languages";
import { MODEL } from "@/lib/llm";
import { CEFR_LEVELS, levelGuidance, type CefrLevel } from "@/lib/level";
import { TRACKS, type TrackId, tracksFocusLine } from "@/lib/track-data";
import { getGoogleApiKey } from "@/lib/env";
import {
  explainGuidance,
  isExplainLang,
  type ExplainLang,
} from "@/lib/explain-lang-server";
import { isPersonaId, personaStyle, type PersonaId } from "@/lib/personas-server";

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
  // Stödjer både string (legacy) och string[] (multi-select).
  track?: string | string[];
  // Förklaringsspråk: vilket språk AI:n ska skriva förklaringar/översättningar PÅ
  explainLang?: ExplainLang;
  // Persona: tonen på AI-tutorn (Sofia/Marco/Luna/Diego)
  personaId?: PersonaId;
  // Mikro-feedback: be modellen returnera en kort coaching-tipsrad efter sista user-turen
  microFeedback?: boolean;
}

// Säker fallback om klienten skickar nåt vi inte känner igen
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
  const personaLine = isPersonaId(body.personaId) ? personaStyle(body.personaId) : "";

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
${personaLine}
Reply ONLY in ${lang.native}. Do not switch to ${ex.englishName} or any other language.
SPEAK LIKE A REAL PERSON — natural, conversational, modern spoken style. Use contractions, casual phrasing, and how people actually talk today (not textbook formal). Drop formality when the scene allows it.
If you need to write meta-commentary, feedback or coaching to the user, use ${ex.englishName}.
Keep replies to 1-3 short sentences.`;
  } else if (body.voice) {
    // Voice-läge: kort och naturligt, ingen extra översättning
    system = `You are Hectór Luengo — the user's main language teacher in this app. You guide them through lessons and practice ${lang.native} with them.
The user's preferred explanation language is ${ex.englishName} — use it if you need to clarify something briefly.
Adapt to CEFR ${level}. ${levelGuidance(level)}
${trackLine}
${personaLine}
SPEAK LIKE A REAL FRIEND — natural, conversational, modern spoken style. Use contractions, fillers (eh, bueno, well, alors), and how people ACTUALLY talk in 2026 — not textbook grammar. Avoid stiff or overly formal phrasing.
Reply ONLY in ${lang.native} — no ${ex.englishName} translation, no markdown, no emoji.
Keep replies to 1-2 sentences. Ask a follow-up question to keep the conversation going.`;
  } else {
    // Standard chat-läge med översättning under på användarens valda förklaringsspråk
    const exampleTranslations: Record<ExplainLang, string> = {
      sv: "*Hej, hur mår du idag?*",
      es: "*¡Hola! ¿Cómo estás hoy?*",
      en: "*Hi, how are you today?*",
    };
    system = `You are Hectór Luengo — a friendly and encouraging main language teacher for a user learning ${lang.native} (${lang.name}). You're warm but focused — you drive the lesson forward.
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

    // Mikro-feedback: gör ett separat snabbt anrop som kollar senaste user-turen
    // och returnerar en kort coaching-rad ("Du sa X, infödd skulle säga Y").
    // Kostar en extra Gemini-call men håller huvudsvaret rent på målspråket.
    let feedback: string | null = null;
    if (body.microFeedback) {
      try {
        const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
        if (lastUser?.content) {
          const fbModel = genAI.getGenerativeModel({
            model: MODEL,
            systemInstruction: `You are a language coach. The user is learning ${lang.native} at CEFR ${level}.
Their last utterance: """${lastUser.content}"""
If it has a clear grammar/word/phrasing issue, return a SINGLE short coaching line in ${ex.englishName}, format:
"You said: <quote>. Better: <improved>." (max 18 words).
If it's already natural, return exactly the word: SKIP
Never return anything else.`,
          });
          const fbResp = await fbModel.generateContent({
            contents: [{ role: "user", parts: [{ text: "evaluate" }] }],
            generationConfig: {
              maxOutputTokens: 80,
              temperature: 0.2,
              thinkingConfig: { thinkingBudget: 0 },
            } as Record<string, unknown>,
          });
          const fb = (fbResp.response.text() ?? "").trim();
          if (fb && fb.toUpperCase() !== "SKIP" && fb.length < 200) feedback = fb;
        }
      } catch {
        // Mikro-feedback är best-effort — släpp tyst om det misslyckas
      }
    }

    return NextResponse.json({ reply, feedback });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
