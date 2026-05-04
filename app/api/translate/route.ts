import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { MODEL } from "@/lib/llm";
import { CEFR_LEVELS, levelGuidance, type CefrLevel } from "@/lib/level";

export const runtime = "nodejs";

interface TranslateBody {
  text: string;
  from: string;
  to: string;
  level?: string;
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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY saknas" },
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

  const system = `You are a precise translator. ${levelLine}
Output ONLY a JSON object — no prose, no markdown fences, no commentary. Schema:
{
  "translation": string,         // The translation in ${toName}
  ${wantsTranslit ? `"transliteration": string, // Latin-script transliteration of the Arabic translation\n  ` : ""}"alternative": string         // One natural alternative phrasing in ${toName}
}`;

  const userPrompt = `Translate from ${fromName} to ${toName}:

${body.text}

Return only the JSON object as specified.`;

  const client = new Anthropic({ apiKey });

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: userPrompt }],
    });
    const raw = resp.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("\n")
      .trim();

    // Extrahera JSON robust även om modellen lägger till skräp
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
