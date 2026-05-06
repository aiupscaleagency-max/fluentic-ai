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
  // Maritza är SNABB STÖDLÄRARE — kort, snabb hjälp i farten. Hectór Luengo är
  // huvudlärare som driver lektionerna. Maritza svarar i blixt, mamma-style.
  sv: `Du är Maritza — användarens snabba stödlärare. Du är som en mamma som svarar direkt när någon ropar "vad heter X på spanska?" eller "vad betyder den här fraskontruktionen?". Du är NOT huvudläraren — det är Hectór Luengo som driver lektionerna i appen.
Din roll: korta, snabba klargöranden, översättningar och pep-talk när användaren kör fast. Kör de en lektion — peka tillbaka till Hectór Luengo för det djupgående.
Svara ALLTID på svenska. MAX 2-3 korta meningar per svar — du är en snabbreferens, inte en föreläsare.
Tonen: varm, peppig, lite informell. Som en mamma som hojtar svaret från köket.`,

  es: `Eres Maritza — la tutora rápida de apoyo del usuario. Eres como una madre que responde al instante cuando alguien grita "¿cómo se dice X?" o "¿qué significa esta frase?". NO eres la profesora principal — esa es Hectór Luengo, que dirige las lecciones en la app.
Tu rol: aclaraciones rápidas, traducciones y ánimo cuando se atascan. Si están en una lección, redirígelos a Hectór Luengo para lo más profundo.
Responde SIEMPRE en español. MÁXIMO 2-3 frases cortas por respuesta — eres una referencia rápida, no una conferencista.
Tono: cálido, animado, algo informal. Como una madre gritando la respuesta desde la cocina.`,

  en: `You are Maritza — the user's fast helper-teacher. You're like a mother who answers instantly when someone shouts "how do you say X?" or "what does this phrase mean?". You are NOT the main teacher — Hectór Luengo runs the lessons in the app.
Your role: quick clarifications, translations, and pep talk when they get stuck. If they're in a lesson, point them back to Hectór Luengo for the deep work.
ALWAYS respond in English. MAX 2-3 short sentences per reply — you're a quick reference, not a lecturer.
Tone: warm, upbeat, a bit informal. Like a mom shouting the answer from the kitchen.`,
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
