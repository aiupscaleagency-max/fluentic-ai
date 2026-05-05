// Praktika-style röstbaserad nivå-detektion. Klienten skickar 1-3 utterances på målspråket
// och vi ber Gemini bedöma CEFR-nivån (A1-C1). Returnerar { level, reasoning }.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getLanguage, isValidLangCode } from "@/lib/languages";
import { MODEL } from "@/lib/llm";
import { getGoogleApiKey } from "@/lib/env";

export const runtime = "nodejs";

interface Body {
  language: string;
  utterances: string[];
}

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;

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

  if (!body?.language || !isValidLangCode(body.language)) {
    return NextResponse.json({ error: "Ogiltigt språk" }, { status: 400 });
  }
  const utterances = (body.utterances ?? []).filter((u) => typeof u === "string" && u.trim());
  if (utterances.length === 0) {
    return NextResponse.json({ error: "utterances krävs" }, { status: 400 });
  }

  const lang = getLanguage(body.language)!;

  const system = `You are a CEFR language-level assessor for ${lang.native} (${lang.name}).
Look at the user's utterances and decide their CEFR level: A1, A2, B1, B2 or C1.
Consider: vocabulary range, grammar, sentence complexity, fluency markers, errors.
If the user wrote in another language entirely or said almost nothing, assume A1.
Output STRICT JSON: {"level":"A2","reasoning":"<one short Swedish sentence why>"}
Nothing else. No markdown.`;

  const prompt = utterances
    .map((u, i) => `Utterance ${i + 1}: """${u.trim()}"""`)
    .join("\n");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: system });
    const resp = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 120,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
      } as Record<string, unknown>,
    });

    const raw = (resp.response.text() ?? "").trim();
    let parsed: { level?: string; reasoning?: string } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Försök plocka ut första JSON-objektet om modellen lade extra text
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    const level = (VALID_LEVELS as readonly string[]).includes(parsed.level ?? "")
      ? parsed.level
      : "A1";
    const reasoning = typeof parsed.reasoning === "string" ? parsed.reasoning : "";

    return NextResponse.json({ level, reasoning });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
