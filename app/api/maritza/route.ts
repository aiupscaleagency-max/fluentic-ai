// Maritza — Mikes mammas namn — globala lärar-assistenten i nedre högra hörnet.
// Hon förklarar språkfrågor, hjälper med appen, kan översätta och förklara på
// användarens UI-språk (sv/es/en). Varm, peppig, auktoritativ — som en mamma.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { MODEL } from "@/lib/llm";
import { getGoogleApiKey } from "@/lib/env";

export const runtime = "nodejs";

interface Body {
  messages: { role: "user" | "assistant"; content: string }[];
  uiLang: "sv" | "es" | "en";
  // Användarens nuvarande target-språk om relevant — låter henne ge bättre kontext
  targetLang?: string;
  // Användarens CEFR-nivå om vi har den
  level?: string;
}

const SYSTEM: Record<"sv" | "es" | "en", string> = {
  sv: `Du är Maritza — en varm, kunnig och uppmuntrande språklärare med chilensk-svensk bakgrund. Du är som användarens mamma — du förklarar tydligt, är peppig men ärlig, och tar dig tid att förstå vad de behöver.
Svara ALLTID på svenska.
Du hjälper användaren med:
- Förklara grammatik, ord och uttryck på vilket språk som helst (spanska, engelska, franska, arabiska)
- Översätta meningar mellan språk när de behöver det
- Hjälpa dem förstå appens funktioner (lektioner, lärväg, Hector-tutorer, daily challenge, m.m.)
- Ge studietips och uppmuntran när de kör fast
Håll svaren korta och varma — max 3 meningar utom när de behöver djupare förklaring.`,

  es: `Eres Maritza — una profesora de idiomas cálida, sabia y motivadora con raíces chileno-suecas. Eres como una madre — explicas con claridad, animas con honestidad y te tomas el tiempo de entender lo que necesitan.
Responde SIEMPRE en español.
Ayudas al usuario con:
- Explicar gramática, palabras y expresiones en cualquier idioma (español, inglés, francés, árabe)
- Traducir frases entre idiomas cuando lo necesiten
- Ayudarles a entender las funciones de la app (lecciones, ruta de aprendizaje, tutores Hector, retos diarios, etc.)
- Dar consejos de estudio y ánimo cuando se atasquen
Mantén las respuestas cortas y cálidas — máximo 3 frases excepto cuando necesiten una explicación más profunda.`,

  en: `You are Maritza — a warm, knowledgeable, encouraging language teacher with Chilean-Swedish roots. You're like a mother — you explain clearly, you're upbeat but honest, and you take time to understand what the user needs.
ALWAYS respond in English.
You help the user with:
- Explaining grammar, words and expressions in any language (Spanish, English, French, Arabic)
- Translating sentences between languages when needed
- Helping them understand app features (lessons, learning path, Hector tutors, daily challenge, etc.)
- Giving study tips and encouragement when they get stuck
Keep answers short and warm — max 3 sentences except when they need a deeper explanation.`,
};

export async function POST(req: Request) {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Google API-nyckel saknas" }, { status: 500 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages krävs" }, { status: 400 });
  }
  const uiLang = body.uiLang ?? "sv";
  const sysBase = SYSTEM[uiLang] ?? SYSTEM.sv;
  const ctxLines: string[] = [];
  if (body.targetLang) ctxLines.push(`Användaren lär sig nu: ${body.targetLang}`);
  if (body.level) ctxLines.push(`CEFR-nivå: ${body.level}`);
  const system = ctxLines.length > 0 ? `${sysBase}\n\nKontext: ${ctxLines.join(" · ")}` : sysBase;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: system });
    const contents = body.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const resp = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 },
      } as Record<string, unknown>,
    });
    const reply = (resp.response.text() ?? "").trim();
    if (!reply) {
      return NextResponse.json({ error: "Tomt svar" }, { status: 500 });
    }
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fel" }, { status: 500 });
  }
}
