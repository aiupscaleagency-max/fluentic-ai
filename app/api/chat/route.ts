import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getLanguage, isValidLangCode } from "@/lib/languages";

export const runtime = "nodejs";

interface ChatBody {
  messages: { role: "user" | "assistant"; content: string }[];
  language: string;
}

const MODEL = "claude-sonnet-4-6";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY saknas" },
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
  const system = `Du är en vänlig och uppmuntrande språklärare för en svensk användare som lär sig ${lang.name.toLowerCase()} (${lang.native}).

Regler:
- Svara ALLTID på ${lang.native} på A1–B1-nivå (enkelt språk, korta meningar).
- Direkt efter ditt svar, lägg till en svensk översättning på en NY rad i kursiv stil med markdown-asterisker, t.ex. *Hej! Hur mår du idag?*
- Om användaren skriver på svenska eller gör ett misstag, rätta vänligt på ${lang.native} och förklara kort på svenska i den kursiva raden.
- Håll svaren korta (max 3 meningar) — du är en samtalspartner, inte en föreläsare.
- Ställ följdfrågor för att hålla samtalet igång.
- Använd bara latinska/arabiska tecken för respektive språk, inga emojis.

Format-exempel:
Hola, ¿cómo estás hoy?
*Hej, hur mår du idag?*`;

  const client = new Anthropic({ apiKey });

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system,
      messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const reply = resp.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("\n")
      .trim();
    return NextResponse.json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
