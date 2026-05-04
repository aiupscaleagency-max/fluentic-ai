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

// XP & streak
export interface ProgressState {
  xp: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export function getProgress(): ProgressState {
  return safeGet<ProgressState>("progress", { xp: 0, streakDays: 0, lastActiveDate: "" });
}

export function addXP(amount: number): ProgressState {
  const today = new Date().toISOString().slice(0, 10);
  const cur = getProgress();
  let streak = cur.streakDays;
  if (cur.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = cur.lastActiveDate === yesterday ? streak + 1 : 1;
  }
  if (streak === 0) streak = 1;
  const next: ProgressState = {
    xp: cur.xp + amount,
    streakDays: streak,
    lastActiveDate: today,
  };
  safeSet("progress", next);
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
