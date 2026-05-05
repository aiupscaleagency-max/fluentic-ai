// Achievements — låsbara badges baserat på milestones (XP, streak, talad tid, lektioner).
// Lagras som array av unlocked IDs i localStorage. Auto-checkas vid relevanta storage-events.
import { getProgress } from "./storage";
import { getSpokenStreak } from "./spoken-time";

export type AchievementId =
  | "first-lesson"
  | "streak-3"
  | "streak-7"
  | "streak-30"
  | "spoken-5"
  | "spoken-30"
  | "spoken-7d-streak"
  | "xp-100"
  | "xp-500"
  | "xp-2000"
  | "polyglot-2"
  | "polyglot-3";

export interface Achievement {
  id: AchievementId;
  emoji: string;
  title: string;
  description: string;
  // Returnera true om kraven är uppfyllda just nu
  check: () => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-lesson",
    emoji: "🎓",
    title: "Första lektionen",
    description: "Klara din första lektion i lärvägen.",
    check: () => {
      if (typeof window === "undefined") return false;
      try {
        const keys = Object.keys(window.localStorage).filter((k) => k.startsWith("fluentic.lessons."));
        return keys.some((k) => {
          try {
            const arr = JSON.parse(window.localStorage.getItem(k) ?? "[]") as string[];
            return Array.isArray(arr) && arr.length > 0;
          } catch { return false; }
        });
      } catch { return false; }
    },
  },
  {
    id: "streak-3",
    emoji: "🔥",
    title: "På rull",
    description: "3 dagars streak.",
    check: () => getProgress().streakDays >= 3,
  },
  {
    id: "streak-7",
    emoji: "🔥",
    title: "Sju dagar",
    description: "7 dagars streak.",
    check: () => getProgress().streakDays >= 7,
  },
  {
    id: "streak-30",
    emoji: "💎",
    title: "En månad",
    description: "30 dagars streak.",
    check: () => getProgress().streakDays >= 30,
  },
  {
    id: "spoken-5",
    emoji: "🎙️",
    title: "Första rösten",
    description: "Tala 5 minuter med tutor.",
    check: () => totalSpokenMinutes() >= 5,
  },
  {
    id: "spoken-30",
    emoji: "🎤",
    title: "30 minuter talad",
    description: "Tala totalt 30 minuter.",
    check: () => totalSpokenMinutes() >= 30,
  },
  {
    id: "spoken-7d-streak",
    emoji: "🌟",
    title: "En vecka röstaktivitet",
    description: "Prata 5+ min varje dag i 7 dagar.",
    check: () => getSpokenStreak() >= 7,
  },
  {
    id: "xp-100",
    emoji: "✨",
    title: "100 XP",
    description: "Samla 100 XP totalt.",
    check: () => getProgress().xp >= 100,
  },
  {
    id: "xp-500",
    emoji: "💫",
    title: "500 XP",
    description: "Samla 500 XP totalt.",
    check: () => getProgress().xp >= 500,
  },
  {
    id: "xp-2000",
    emoji: "👑",
    title: "2000 XP",
    description: "Samla 2000 XP totalt.",
    check: () => getProgress().xp >= 2000,
  },
  {
    id: "polyglot-2",
    emoji: "🌍",
    title: "Tvåspråkig",
    description: "Aktivera 2 språk.",
    check: () => selectedLangCount() >= 2,
  },
  {
    id: "polyglot-3",
    emoji: "🌎",
    title: "Trespråkig",
    description: "Aktivera 3 språk.",
    check: () => selectedLangCount() >= 3,
  },
];

function totalSpokenMinutes(): number {
  if (typeof window === "undefined") return 0;
  try {
    let total = 0;
    for (const k of Object.keys(window.localStorage)) {
      if (k.startsWith("fluentic.spoken.")) {
        const sec = parseInt(window.localStorage.getItem(k) ?? "0", 10) || 0;
        total += sec;
      }
    }
    return Math.floor(total / 60);
  } catch { return 0; }
}

function selectedLangCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem("fluentic.languages");
    if (!raw) return 0;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr.length : 0;
  } catch { return 0; }
}

const KEY = "fluentic.achievements";

export function getUnlocked(): AchievementId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? (arr as AchievementId[]) : [];
  } catch { return []; }
}

function setUnlocked(arr: AchievementId[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(arr));
  } catch { /* tyst */ }
}

// Kör genom alla achievements och unlocka nya. Returnerar lista med just-unlocked för UI-popup.
export function checkAchievements(): Achievement[] {
  if (typeof window === "undefined") return [];
  const have = new Set(getUnlocked());
  const newly: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (have.has(a.id)) continue;
    try {
      if (a.check()) {
        have.add(a.id);
        newly.push(a);
      }
    } catch { /* tyst — en achievement-check ska aldrig krascha */ }
  }
  if (newly.length > 0) {
    setUnlocked([...have]);
    window.dispatchEvent(new CustomEvent("fluentic:achievement-unlocked", { detail: { ids: newly.map((a) => a.id) } }));
  }
  return newly;
}
