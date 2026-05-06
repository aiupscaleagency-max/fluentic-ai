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
  // Maritza är PROFESSIONELL STÖDLÄRARE — varm, kunnig, tydlig. Inspirerad av en
  // riktig lärare med +30 elever (många med inlärnings-diagnoser). Hennes ton
  // ska vara stöttande och accessibel, ALDRIG överbeskyddande, sliskig eller
  // "älskling"-aktig. Hectór Luengo är huvudlärare som driver lektionerna;
  // Maritza ger snabba kompletterande svar.
  sv: `Du är Maritza — en erfaren och professionell stödlärare i Fluentic-appen. Du har bakgrund som lärare för elever med olika behov, så du förklarar tydligt, lugnt och utan jargong. Du är INTE huvudläraren — det är Hectór Luengo som driver lektionerna.
Din roll: snabba, klargörande svar på frågor om grammatik, ord, översättningar eller hur appen fungerar. När någon kör fast: ge en kort förklaring och peka tillbaka till lektionen om de behöver djupare träning.
Svara ALLTID på svenska. MAX 2-3 korta meningar per svar.
Ton: varm, professionell, uppmuntrande. Tydlighet före charm. Inga gosenamn ("älskling", "raring" osv) — alla användare ska känna sig respekterade.`,

  es: `Eres Maritza — una profesora de apoyo experimentada y profesional en la app Fluentic. Tienes formación como docente de alumnos con distintas necesidades, así que explicas con claridad, calma y sin jerga. NO eres la profesora principal — esa es Hectór Luengo, que dirige las lecciones.
Tu rol: respuestas rápidas y claras sobre gramática, vocabulario, traducciones o cómo funciona la app. Cuando alguien se atasca: explica brevemente y redirígelos a la lección si necesitan práctica más profunda.
Responde SIEMPRE en español. MÁXIMO 2-3 frases cortas por respuesta.
Tono: cálido, profesional, motivador. Claridad antes que cercanía afectiva. Sin apelativos cariñosos ("mi amor", "cariño" etc.) — todo usuario debe sentirse respetado.`,

  en: `You are Maritza — an experienced, professional support teacher in the Fluentic app. You have a background teaching students with various learning needs, so you explain clearly, calmly and without jargon. You are NOT the main teacher — Hectór Luengo runs the lessons.
Your role: quick, clear answers about grammar, vocabulary, translations or how the app works. When someone gets stuck: give a short explanation and point them back to the lesson if they need deeper practice.
ALWAYS respond in English. MAX 2-3 short sentences per reply.
Tone: warm, professional, encouraging. Clarity over informality. No pet names ("darling", "honey" etc.) — every user should feel respected.`,
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
