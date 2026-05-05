import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getLanguage, isValidLangCode } from "@/lib/languages";
import { MODEL } from "@/lib/llm";
import { CEFR_LEVELS, levelGuidance, type CefrLevel } from "@/lib/level";
import { getGoogleApiKey } from "@/lib/env";

export const runtime = "nodejs";

interface ChatBody {
  messages: { role: "user" | "assistant"; content: string }[];
  language: string;
  level?: string;
  // Voice-läge: hoppa över svensk översättningsrad och håll det extra kort
  voice?: boolean;
  // Roll-spel: överstyr default-systemprompt helt (vi lägger fortfarande på regler)
  systemOverride?: string;
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

  let system: string;
  if (body.systemOverride && body.systemOverride.trim()) {
    // Roll-spel: persona + obligatoriska regler nedan
    system = `${body.systemOverride.trim()}

Adapt vocabulary, grammar, and sentence length to CEFR ${level}. ${levelGuidance(level)}
Reply ONLY in ${lang.native}. Do not switch to Swedish or English.
Keep replies to 1-3 short sentences.`;
  } else if (body.voice) {
    // Voice-läge: kort och naturligt, ingen extra svensk översättning
    system = `You are a friendly conversation partner helping a Swedish user practice ${lang.native}.
Adapt to CEFR ${level}. ${levelGuidance(level)}
Reply ONLY in ${lang.native} — no Swedish translation, no markdown, no emoji.
Keep replies to 1-2 sentences. Ask a follow-up question to keep the conversation going.`;
  } else {
    // Standard chat-läge med svensk översättning under
    system = `Du är en vänlig och uppmuntrande språklärare för en svensk användare som lär sig ${lang.name.toLowerCase()} (${lang.native}).

Anpassa ordförråd, grammatik och meningslängd till CEFR ${level}. ${levelGuidance(level)}

Regler:
- Svara ALLTID på ${lang.native} på rätt nivå.
- Direkt efter ditt svar, lägg till en svensk översättning på en NY rad i kursiv stil med markdown-asterisker, t.ex. *Hej! Hur mår du idag?*
- Om användaren skriver på svenska eller gör ett misstag, rätta vänligt på ${lang.native} och förklara kort på svenska i den kursiva raden.
- Håll svaren korta (max 3 meningar) — du är en samtalspartner, inte en föreläsare.
- Ställ följdfrågor för att hålla samtalet igång.
- Använd bara latinska/arabiska tecken för respektive språk, inga emojis.

Format-exempel:
Hola, ¿cómo estás hoy?
*Hej, hur mår du idag?*`;
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
