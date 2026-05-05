// Daily Challenge — en ny utmaning per dag som rotar mellan typer (call/translate/listen).
// Pickar deterministiskt baserat på datum + språk så samma dag = samma challenge för alla.
// Ger +50 XP bonus när klar. Word-of-the-day pickar 1 vocab-entry per dag.
import type { LangCode } from "./languages";
import type { CefrLevel } from "./level";
import { getVocab, type VocabEntry } from "./vocab";
import { PHRASES, type Phrase } from "./phrases";

export type ChallengeKind = "call" | "translate" | "listen";

export interface DailyChallenge {
  date: string;          // YYYY-MM-DD
  kind: ChallengeKind;
  title: string;
  description: string;
  emoji: string;
  // För translate/listen: 5 phrases att klara
  items?: Phrase[];
  // För call: minuter att tala
  callMinutes?: number;
  bonusXp: number;
}

const KINDS: ChallengeKind[] = ["call", "translate", "listen"];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Enkel deterministisk hash (FNV-1a) — ger oss stabilt index per dag+språk
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

export function getDailyChallenge(lang: LangCode, level: CefrLevel | null): DailyChallenge {
  const date = todayKey();
  const seed = hash(`${date}-${lang}`);
  const kind = KINDS[seed % KINDS.length];
  const phrasesAtLevel = PHRASES.filter((p) => (level ? p.level === level : true));
  const pool = phrasesAtLevel.length > 0 ? phrasesAtLevel : PHRASES;
  // Pick 5 stabilt slumpade phrases
  const items: Phrase[] = [];
  for (let i = 0; i < 5 && i < pool.length; i++) {
    const idx = hash(`${date}-${lang}-p${i}`) % pool.length;
    const item = pool[idx];
    if (!items.some((it) => it.id === item.id)) items.push(item);
  }

  if (kind === "call") {
    return {
      date,
      kind,
      title: "Dagens samtal",
      description: "Prata 5 minuter med din tutor på målspråket.",
      emoji: "🎙️",
      callMinutes: 5,
      bonusXp: 50,
    };
  }
  if (kind === "translate") {
    return {
      date,
      kind,
      title: "Dagens översättning",
      description: "Översätt 5 fraser till målspråket.",
      emoji: "✍️",
      items,
      bonusXp: 50,
    };
  }
  return {
    date,
    kind,
    title: "Dagens lyssning",
    description: "Lyssna och välj rätt översättning för 5 fraser.",
    emoji: "🎧",
    items,
    bonusXp: 50,
  };
}

const COMPLETED_PREFIX = "fluentic.daily-challenge.";   // fluentic.daily-challenge.{lang} = JSON{ date, claimed:true }

export interface ChallengeState {
  date: string;
  claimed: boolean;
}

export function getChallengeState(lang: LangCode): ChallengeState {
  if (typeof window === "undefined") return { date: "", claimed: false };
  try {
    const raw = window.localStorage.getItem(COMPLETED_PREFIX + lang);
    if (!raw) return { date: "", claimed: false };
    const parsed = JSON.parse(raw) as ChallengeState;
    if (parsed.date !== todayKey()) return { date: "", claimed: false };
    return parsed;
  } catch {
    return { date: "", claimed: false };
  }
}

export function claimChallenge(lang: LangCode): void {
  if (typeof window === "undefined") return;
  try {
    const state: ChallengeState = { date: todayKey(), claimed: true };
    window.localStorage.setItem(COMPLETED_PREFIX + lang, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("fluentic:daily-claimed", { detail: { lang } }));
  } catch {
    // ignorera
  }
}

// Word of the day — pickar 1 vocab per dag baserat på lang + level
export function getWordOfTheDay(lang: LangCode, level: CefrLevel | null): VocabEntry | null {
  const all = getVocab(lang, level ?? "A2", "general");
  if (all.length === 0) return null;
  const idx = hash(`${todayKey()}-wotd-${lang}`) % all.length;
  return all[idx];
}
