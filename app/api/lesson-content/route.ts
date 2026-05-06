// Auto-genererar vocab + phrases för en lektion på begärt språk via Gemini.
// Server-cache i /tmp så samma lektion+språk inte kostar fler tokens. Cache-key:
// "{lessonId}-{lang}" — lektioner är immutable så vi behöver ingen TTL.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";
import { isValidLangCode, getLanguage } from "@/lib/languages";
import { LESSONS } from "@/lib/lessons";
import { MODEL } from "@/lib/llm";
import { getGoogleApiKey } from "@/lib/env";

export const runtime = "nodejs";

interface Body {
  lessonId: string;
  language: string;
}

interface GeneratedVocab {
  sv: string;
  word: string;
}

interface GeneratedPhrase {
  sv: string;
  text: string;
}

interface LessonContent {
  vocab: GeneratedVocab[];
  phrases: GeneratedPhrase[];
}

const CACHE_DIR = path.join(tmpdir(), "fluentic-lesson-cache");

async function readCache(key: string): Promise<LessonContent | null> {
  try {
    const file = path.join(CACHE_DIR, `${key}.json`);
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as LessonContent;
  } catch {
    return null;
  }
}

async function writeCache(key: string, data: LessonContent): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(path.join(CACHE_DIR, `${key}.json`), JSON.stringify(data));
  } catch {
    // ignorera — cache är best-effort
  }
}

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
  const lesson = LESSONS.find((l) => l.id === body.lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Okänd lektion" }, { status: 404 });
  }

  const lang = getLanguage(body.language)!;
  const cacheKey = `${lesson.id}-${body.language}`;

  // Cache-hit
  const cached = await readCache(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  const system = `You are a curriculum-quality CEFR ${lesson.level} content generator for ${lang.native} (${lang.name}).
Lesson: "${lesson.title}" — ${lesson.goalSv} (Swedish goal). Category: ${lesson.category}.
Generate ONE JSON object — no markdown, no commentary — with this shape:
{
  "vocab": [{"sv": "<Swedish>", "word": "<${lang.native}>"}, ...12 entries],
  "phrases": [{"sv": "<Swedish>", "text": "<${lang.native}>"}, ...6 entries]
}

Rules:
- Match CEFR ${lesson.level} difficulty exactly. ${levelGuide(lesson.level)}
- Vocab = single words or short fixed expressions for the lesson's category.
- Phrases = full sentences a learner would actually say in this lesson's context.
- Use the proper script for ${lang.native}. No emoji.
- Keep Swedish translations natural and idiomatic — not literal word-for-word.
- Output VALID JSON only. No comments, no trailing commas.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: system });
    const resp = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Generate the lesson content for "${lesson.title}".` }] }],
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
      } as Record<string, unknown>,
    });

    const raw = (resp.response.text() ?? "").trim();
    let parsed: LessonContent;
    try {
      parsed = JSON.parse(raw) as LessonContent;
    } catch {
      // Försök plocka ut första JSON-objekt om modellen lade extra text
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Modellsvar var inte JSON");
      parsed = JSON.parse(m[0]) as LessonContent;
    }

    // Validera att vi fick rätt struktur
    if (!Array.isArray(parsed?.vocab) || !Array.isArray(parsed?.phrases)) {
      throw new Error("Ogiltig struktur från modellen");
    }
    parsed.vocab = parsed.vocab.filter((v) => v?.sv && v?.word).slice(0, 20);
    parsed.phrases = parsed.phrases.filter((p) => p?.sv && p?.text).slice(0, 12);

    await writeCache(cacheKey, parsed);
    return NextResponse.json({ ...parsed, cached: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function levelGuide(level: string): string {
  switch (level) {
    case "A1": return "Use simplest A1 vocabulary. Sentences 3-6 words. Present tense only.";
    case "A2": return "A2 vocabulary. Sentences max 8 words. Simple past + present.";
    case "B1": return "B1 vocabulary. Sentences up to 12 words. Past, present, future.";
    case "B2": return "B2 vocabulary. Complex sentences allowed. Abstract topics fine.";
    case "C1": return "Rich C1 vocabulary. Idioms, irony, nuance encouraged.";
    default: return "";
  }
}
