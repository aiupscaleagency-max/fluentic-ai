// AI dagsplanerare — genererar 3-5 micro-tasks för användarens dag.
// Per användare-state — ingen server-side caching. Klient cachar 1/dag i localStorage.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { MODEL } from "@/lib/llm";
import { LANGUAGES, isValidLangCode, type LangCode } from "@/lib/languages";
import { CEFR_LEVELS, type CefrLevel } from "@/lib/level";
import { TRACKS, type TrackId, getTrackMeta } from "@/lib/track-data";
import { getGoogleApiKey } from "@/lib/env";
import {
  explainGuidance,
  isExplainLang,
  type ExplainLang,
} from "@/lib/explain-lang-server";

export const runtime = "nodejs";

interface DayPlanBody {
  languages: string[];
  tracks: Record<string, string[]>;
  levels: Record<string, string>;
  streak: number;
  xpToday: number;
  dailyGoal: number;
  scheduledToday: string[];   // "HH:MM" tider
  explainLang?: ExplainLang;
  // Klockslag i timmar (0-23) för att välja morning/lunch/evening/night-greeting
  hour?: number;
}

interface PlannedTask {
  emoji: string;
  title: string;
  lang: string;
  type: "flashcards" | "conversation" | "mix" | "scenario" | "pronunciation" | "listen";
  durationMin: number;
  link: string;
}

interface DayPlan {
  greeting: string;
  motivation: string;
  tasks: PlannedTask[];
}

function safeLangs(input: unknown): LangCode[] {
  if (!Array.isArray(input)) return [];
  return input.filter((l): l is LangCode => typeof l === "string" && isValidLangCode(l));
}

function safeTracks(input: unknown): Record<LangCode, TrackId[]> {
  const out: Record<string, TrackId[]> = {};
  if (!input || typeof input !== "object") return out as Record<LangCode, TrackId[]>;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!isValidLangCode(k)) continue;
    if (!Array.isArray(v)) continue;
    const valid = v.filter((t): t is TrackId => TRACKS.some((tt) => tt.id === t));
    if (valid.length > 0) out[k] = valid;
  }
  return out as Record<LangCode, TrackId[]>;
}

function safeLevels(input: unknown): Record<LangCode, CefrLevel> {
  const out: Record<string, CefrLevel> = {};
  if (!input || typeof input !== "object") return out as Record<LangCode, CefrLevel>;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!isValidLangCode(k)) continue;
    if (typeof v !== "string") continue;
    if ((CEFR_LEVELS as string[]).includes(v)) out[k] = v as CefrLevel;
  }
  return out as Record<LangCode, CefrLevel>;
}

export async function POST(req: Request) {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google API-nyckel saknas (sätt GOOGLE_AI_API_KEY)" },
      { status: 500 },
    );
  }

  let body: DayPlanBody;
  try {
    body = (await req.json()) as DayPlanBody;
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  const langs = safeLangs(body.languages);
  if (langs.length === 0) {
    return NextResponse.json({ error: "Minst ett språk krävs" }, { status: 400 });
  }
  const tracks = safeTracks(body.tracks);
  const levels = safeLevels(body.levels);
  const streak = Number.isFinite(body.streak) ? body.streak : 0;
  const xpToday = Number.isFinite(body.xpToday) ? body.xpToday : 0;
  const dailyGoal = Number.isFinite(body.dailyGoal) && body.dailyGoal > 0 ? body.dailyGoal : 20;
  const scheduledToday = Array.isArray(body.scheduledToday) ? body.scheduledToday : [];
  const explainLang: ExplainLang = isExplainLang(body.explainLang) ? body.explainLang : "sv";
  const ex = explainGuidance(explainLang);
  const hour = typeof body.hour === "number" ? body.hour : new Date().getHours();

  // Bygg en kompakt context-prompt
  const langSummary = langs
    .map((l) => {
      const lang = LANGUAGES.find((x) => x.code === l)!;
      const ts = (tracks[l] ?? ["general"]).map((t) => getTrackMeta(t).label).join(", ");
      const lv = levels[l] ?? "A2";
      return `- ${lang.name} (${l}, CEFR ${lv}, mål: ${ts})`;
    })
    .join("\n");

  const sched =
    scheduledToday.length > 0
      ? scheduledToday.join(", ")
      : "(inget schemalagt idag)";

  const explainNamePretty: Record<ExplainLang, string> = {
    sv: "Swedish",
    es: "Spanish",
    en: "English",
  };

  const system = `You are an encouraging language coach for a Swedish learner using Fluentic AI.
Generate today's micro-plan as 3–5 short actionable tasks.

ALL output text (greeting, motivation, task titles) MUST be written in ${ex.englishName}.

Output a strict JSON object matching this schema:
{
  "greeting": string,        // short, warm greeting that fits the time of day
  "motivation": string,      // 1 sentence, warm, no fluff
  "tasks": [
    {
      "emoji": string,                      // single emoji
      "title": string,                      // <50 chars, specific, no generic stuff like "Practice Spanish"
      "lang": string,                       // language code from the list (es, en, fr, ar)
      "type": "flashcards"|"conversation"|"mix"|"scenario"|"pronunciation"|"listen",
      "durationMin": number,                // 5-30
      "link": string                        // /learn/<lang>/mix or /learn/<lang>/call or /learn/<lang>/scenario/<id>
    }
  ]
}

Rules:
- 3-5 tasks total
- Mix language and activity types — not all on the same lang/type
- Be SPECIFIC: e.g. "Snacka 5 min med Sofia om helgen" not "Practice Spanish"
- If user has multiple languages, distribute tasks fairly
- Prefer mix-mode (/learn/{lang}/mix) for short sessions
- Use /learn/{lang}/call for conversation/pronunciation
- Use /learn/{lang}/scenario/{id} for scenario practice (valid ids: cafe, airport, party, apartment, doctor, interview, restaurant, pharmacy, hotel, coworker)
- Total durationMin should roughly target the daily XP goal (assume ~5 XP/min)
`;

  const userMsg = `Today's user state:
Languages and goals:
${langSummary}
Streak: ${streak} days
XP earned today: ${xpToday}/${dailyGoal}
Scheduled lesson times today: ${sched}
Current hour: ${hour}
Output in: ${explainNamePretty[explainLang]}.
Generate the micro-plan as JSON now.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: system,
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 800,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 },
      } as Record<string, unknown>,
    });

    const resp = await model.generateContent(userMsg);
    const raw = (resp.response.text() ?? "").trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Ogiltigt svar från modellen" }, { status: 500 });
    }
    let parsed: DayPlan;
    try {
      parsed = JSON.parse(match[0]) as DayPlan;
    } catch {
      return NextResponse.json({ error: "Kunde inte tolka dagsplan" }, { status: 500 });
    }
    // Sanity-clean tasks
    const cleanTasks = Array.isArray(parsed.tasks)
      ? parsed.tasks.slice(0, 5).map((t) => {
          const lang = isValidLangCode(t.lang) ? t.lang : langs[0];
          const dur = Number.isFinite(t.durationMin) ? Math.max(5, Math.min(30, Math.round(t.durationMin))) : 10;
          const allowedTypes: PlannedTask["type"][] = [
            "flashcards", "conversation", "mix", "scenario", "pronunciation", "listen",
          ];
          const type = allowedTypes.includes(t.type) ? t.type : "mix";
          // Säkerställ att link börjar med /learn/<lang>/
          let link = typeof t.link === "string" ? t.link : `/learn/${lang}/mix`;
          if (!link.startsWith("/learn/")) link = `/learn/${lang}/mix`;
          return {
            emoji: typeof t.emoji === "string" ? t.emoji.slice(0, 4) : "✨",
            title: typeof t.title === "string" ? t.title.slice(0, 80) : "Öva nu",
            lang,
            type,
            durationMin: dur,
            link,
          } as PlannedTask;
        })
      : [];

    return NextResponse.json({
      greeting: typeof parsed.greeting === "string" ? parsed.greeting : "Hej!",
      motivation: typeof parsed.motivation === "string" ? parsed.motivation : "",
      tasks: cleanTasks,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
