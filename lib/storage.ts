// Abstraktion ovanpå localStorage så vi kan byta till Supabase senare utan att röra UI
import type { LangCode } from "./languages";

const PREFIX = "fluentic:";

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignorera quota-fel etc
  }
}

// Notifiera UI direkt efter ändring så ringar/badges hänger med
function emit(event: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(event));
}

// XP & streak
export interface ProgressState {
  xp: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  todayXp: number;        // XP intjänad idag (för dagligt mål)
  todayDate: string;      // YYYY-MM-DD som todayXp gäller
  freezes: number;        // Streak-freeze, +1 per 5-dagars-streak
  lastFreezeAwardAt: number; // Streak-värde då vi senast delade ut freeze
}

const DEFAULT_PROGRESS: ProgressState = {
  xp: 0,
  streakDays: 0,
  lastActiveDate: "",
  todayXp: 0,
  todayDate: "",
  freezes: 0,
  lastFreezeAwardAt: 0,
};

export function getProgress(): ProgressState {
  return { ...DEFAULT_PROGRESS, ...safeGet<ProgressState>("progress", DEFAULT_PROGRESS) };
}

export function addXP(amount: number): ProgressState {
  const today = new Date().toISOString().slice(0, 10);
  const cur = getProgress();
  let streak = cur.streakDays;
  let freezes = cur.freezes;
  let lastFreezeAwardAt = cur.lastFreezeAwardAt;

  if (cur.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (cur.lastActiveDate === yesterday) {
      streak = streak + 1;
    } else if (cur.lastActiveDate && freezes > 0) {
      // Vi missade en dag men har en freeze — använd den, behåll streak
      freezes -= 1;
      streak = streak + 1; // freeze räknas som om vi var aktiva igår
    } else {
      streak = 1;
    }
  }
  if (streak === 0) streak = 1;

  // Belöna +1 freeze varje gång streaken passerar en ny multipel av 5
  const tier = Math.floor(streak / 5);
  const lastTier = Math.floor(lastFreezeAwardAt / 5);
  if (tier > lastTier) {
    freezes += tier - lastTier;
    lastFreezeAwardAt = streak;
  }

  const todayXp = cur.todayDate === today ? cur.todayXp + amount : amount;

  const next: ProgressState = {
    xp: cur.xp + amount,
    streakDays: streak,
    lastActiveDate: today,
    todayXp,
    todayDate: today,
    freezes,
    lastFreezeAwardAt,
  };
  safeSet("progress", next);
  emit("fluentic:progress-changed");
  return next;
}

// SRS-light: hur ofta ett kort ska visas igen
export interface SrsCardState {
  id: string;
  ease: number; // 1 (svår) – 5 (lätt)
  nextDue: number; // epoch ms
}

export function getSrsState(lang: LangCode): Record<string, SrsCardState> {
  return safeGet<Record<string, SrsCardState>>(`srs:${lang}`, {});
}

export function updateSrsCard(lang: LangCode, id: string, knewIt: boolean): void {
  const state = getSrsState(lang);
  const cur = state[id] ?? { id, ease: 2, nextDue: 0 };
  const newEase = knewIt ? Math.min(5, cur.ease + 1) : Math.max(1, cur.ease - 1);
  const intervalsMin = [1, 10, 60, 60 * 24, 60 * 24 * 3, 60 * 24 * 7];
  const minutes = intervalsMin[newEase] ?? 1;
  state[id] = { id, ease: newEase, nextDue: Date.now() + minutes * 60 * 1000 };
  safeSet(`srs:${lang}`, state);
}

// Schemalagda lektioner
export type LessonType = "flashcards" | "conversation" | "listen";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ScheduledLesson {
  id: string;
  language: LangCode;
  time: string; // HH:MM
  days: Weekday[];
  durationMin: number;
  type: LessonType;
}

export function getSchedule(): ScheduledLesson[] {
  return safeGet<ScheduledLesson[]>("schedule", []);
}

export function setSchedule(list: ScheduledLesson[]): void {
  safeSet("schedule", list);
}

export function addScheduledLesson(lesson: Omit<ScheduledLesson, "id">): ScheduledLesson {
  const next: ScheduledLesson = { ...lesson, id: crypto.randomUUID() };
  const list = getSchedule();
  list.push(next);
  setSchedule(list);
  return next;
}

export function removeScheduledLesson(id: string): void {
  setSchedule(getSchedule().filter((l) => l.id !== id));
}

// ===== Gamification =====

// Dagligt mål — användaren väljer 10/20/50 XP per dag
const DAILY_GOAL_KEY = "fluentic.dailyGoal";

export function getDailyGoal(): number {
  if (typeof window === "undefined") return 20;
  try {
    const v = window.localStorage.getItem(DAILY_GOAL_KEY);
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 20;
  } catch {
    return 20;
  }
}

export function setDailyGoal(goal: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DAILY_GOAL_KEY, String(goal));
    emit("fluentic:progress-changed");
  } catch {
    // ignorera
  }
}

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem("fluentic.onboarded") === "1";
  } catch {
    return true;
  }
}

export function markOnboarded(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("fluentic.onboarded", "1");
  } catch {
    // ignorera
  }
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("fluentic.onboarded");
  } catch {
    // ignorera
  }
}

// === Användarens valda språk (multi-select i onboarding) ===
const SELECTED_LANGS_KEY = "fluentic.languages";

export function getSelectedLanguages(): LangCode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SELECTED_LANGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LangCode[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setSelectedLanguages(langs: LangCode[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SELECTED_LANGS_KEY, JSON.stringify(langs));
  } catch {
    // ignorera
  }
}

// Hjärtan — 5 max, regen 1/30 min
const HEARTS_KEY = "fluentic.hearts";
const HEARTS_MAX = 5;
const HEARTS_REGEN_MS = 30 * 60 * 1000;

interface HeartsState {
  count: number;
  lastChangedAt: number;
}

function readHearts(): HeartsState {
  if (typeof window === "undefined") return { count: HEARTS_MAX, lastChangedAt: Date.now() };
  try {
    const raw = window.localStorage.getItem(HEARTS_KEY);
    if (!raw) return { count: HEARTS_MAX, lastChangedAt: Date.now() };
    const parsed = JSON.parse(raw) as HeartsState;
    return { count: parsed.count ?? HEARTS_MAX, lastChangedAt: parsed.lastChangedAt ?? Date.now() };
  } catch {
    return { count: HEARTS_MAX, lastChangedAt: Date.now() };
  }
}

function writeHearts(s: HeartsState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HEARTS_KEY, JSON.stringify(s));
    emit("fluentic:hearts-changed");
  } catch {
    // ignorera
  }
}

export function getHearts(): { count: number; nextRegenInMs: number } {
  const s = readHearts();
  if (s.count >= HEARTS_MAX) return { count: HEARTS_MAX, nextRegenInMs: 0 };
  const elapsed = Date.now() - s.lastChangedAt;
  const regened = Math.floor(elapsed / HEARTS_REGEN_MS);
  if (regened > 0) {
    const newCount = Math.min(HEARTS_MAX, s.count + regened);
    const newLast = s.lastChangedAt + regened * HEARTS_REGEN_MS;
    writeHearts({ count: newCount, lastChangedAt: newLast });
    if (newCount >= HEARTS_MAX) return { count: HEARTS_MAX, nextRegenInMs: 0 };
    return { count: newCount, nextRegenInMs: HEARTS_REGEN_MS - (Date.now() - newLast) };
  }
  return { count: s.count, nextRegenInMs: HEARTS_REGEN_MS - elapsed };
}

export function loseHeart(): number {
  const s = readHearts();
  // Trigga regen-uträkning först så vi inte tappar hjärtan vi egentligen återfick
  getHearts();
  const cur = readHearts();
  const next = Math.max(0, cur.count - 1);
  writeHearts({ count: next, lastChangedAt: Date.now() });
  return next;
}

export function refillHearts(): void {
  writeHearts({ count: HEARTS_MAX, lastChangedAt: Date.now() });
}

// Lektionspath — vilka lektioner användaren har klarat
const LESSONS_KEY_PREFIX = "fluentic.lessons.";

export function getCompletedLessons(lang: LangCode): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = window.localStorage.getItem(LESSONS_KEY_PREFIX + lang);
    return v ? (JSON.parse(v) as string[]) : [];
  } catch {
    return [];
  }
}

export function markLessonCompleted(lang: LangCode, lessonId: string): void {
  if (typeof window === "undefined") return;
  const list = getCompletedLessons(lang);
  if (!list.includes(lessonId)) {
    list.push(lessonId);
    try {
      window.localStorage.setItem(LESSONS_KEY_PREFIX + lang, JSON.stringify(list));
      emit("fluentic:lessons-changed");
    } catch {
      // ignorera
    }
  }
}

// ===== Aktiv lektion (vilken lektion användarens flikar tränar mot) =====
const ACTIVE_LESSON_KEY_PREFIX = "fluentic.active-lesson.";

export function getActiveLesson(lang: LangCode): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_LESSON_KEY_PREFIX + lang);
  } catch {
    return null;
  }
}

export function setActiveLesson(lang: LangCode, lessonId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (lessonId) {
      window.localStorage.setItem(ACTIVE_LESSON_KEY_PREFIX + lang, lessonId);
    } else {
      window.localStorage.removeItem(ACTIVE_LESSON_KEY_PREFIX + lang);
    }
    emit("fluentic:active-lesson-changed");
  } catch {
    // ignorera
  }
}

// ===== Aktivitetsspårning per lektion =====
// Vi sparar vilka av flashcards/cloze/listen användaren klarat av per lektion-id.
// När alla 3 är gjorda räknas lektionen som klar och vi triggar fluentic:lesson-complete.
const ACTIVITY_KEY_PREFIX = "fluentic.lesson-activity.";

export type LessonActivity = "flashcards" | "cloze" | "listen";

export interface LessonActivityState {
  flashcards: boolean;
  cloze: boolean;
  listen: boolean;
}

const DEFAULT_ACTIVITY: LessonActivityState = {
  flashcards: false,
  cloze: false,
  listen: false,
};

export function getLessonActivity(lessonId: string): LessonActivityState {
  if (typeof window === "undefined") return { ...DEFAULT_ACTIVITY };
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY_PREFIX + lessonId);
    if (!raw) return { ...DEFAULT_ACTIVITY };
    return { ...DEFAULT_ACTIVITY, ...(JSON.parse(raw) as Partial<LessonActivityState>) };
  } catch {
    return { ...DEFAULT_ACTIVITY };
  }
}

export function isLessonComplete(lessonId: string): boolean {
  const a = getLessonActivity(lessonId);
  return a.flashcards && a.cloze && a.listen;
}

// Markerar en aktivitet som gjord. Returnerar true om hela lektionen blev klar nu (övergång false→true).
export function markActivityDone(
  lessonId: string,
  activity: LessonActivity,
  lang?: LangCode,
): boolean {
  if (typeof window === "undefined") return false;
  const cur = getLessonActivity(lessonId);
  if (cur[activity]) {
    // Redan markerad — inget event, men returnera completeness
    return false;
  }
  const next: LessonActivityState = { ...cur, [activity]: true };
  try {
    window.localStorage.setItem(ACTIVITY_KEY_PREFIX + lessonId, JSON.stringify(next));
    emit("fluentic:activity-changed");
  } catch {
    // ignorera quota
  }
  const wasComplete = cur.flashcards && cur.cloze && cur.listen;
  const isComplete = next.flashcards && next.cloze && next.listen;
  if (!wasComplete && isComplete) {
    // Auto-markera lektionen som klar och dela ut XP. lang krävs för persistens per språk.
    if (lang) {
      markLessonCompleted(lang, lessonId);
      addXP(20);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("fluentic:lesson-complete", { detail: { lessonId, lang } }),
      );
    }
    return true;
  }
  return false;
}
