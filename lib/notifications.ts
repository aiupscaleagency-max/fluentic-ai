// In-app aviseringsfeed. Sparas i localStorage, cap 50 senaste.
// Används av nav-belt (badge) + drawer.
"use client";

import * as React from "react";

export type NotificationType =
  | "lesson-start"     // Schemalagd lektion startar nu
  | "lesson-done"     // Lektion klar (+X XP)
  | "streak-freeze"   // Streak-skydd aktiverat
  | "hearts-refilled" // Hjärtan återställda
  | "info";           // Generic info

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  ts: number;       // epoch ms
  read: boolean;
  link?: string;    // valfri navigeringsmål
}

const KEY = "fluentic.notifications";
const CAP = 50;

function safeRead(): InAppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InAppNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(list: InAppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, CAP)));
    window.dispatchEvent(new CustomEvent("fluentic:notifications-changed"));
  } catch {
    // ignorera quota
  }
}

export function getNotifications(): InAppNotification[] {
  return safeRead();
}

export function unreadCount(): number {
  return safeRead().filter((n) => !n.read).length;
}

export function pushNotification(
  n: Omit<InAppNotification, "id" | "ts" | "read">,
): InAppNotification {
  const next: InAppNotification = {
    ...n,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `n-${Date.now()}-${Math.random()}`,
    ts: Date.now(),
    read: false,
  };
  const list = [next, ...safeRead()];
  safeWrite(list);
  return next;
}

export function markRead(id: string): void {
  const list = safeRead().map((n) => (n.id === id ? { ...n, read: true } : n));
  safeWrite(list);
}

export function markAllRead(): void {
  const list = safeRead().map((n) => ({ ...n, read: true }));
  safeWrite(list);
}

export function clearAll(): void {
  safeWrite([]);
}

// Hook: lyssnar på changes så badges/listor uppdateras direkt
export function useNotifications(): {
  list: InAppNotification[];
  unread: number;
} {
  const [list, setList] = React.useState<InAppNotification[]>([]);
  React.useEffect(() => {
    function refresh() { setList(getNotifications()); }
    refresh();
    window.addEventListener("fluentic:notifications-changed", refresh);
    return () => window.removeEventListener("fluentic:notifications-changed", refresh);
  }, []);
  const unread = list.filter((n) => !n.read).length;
  return { list, unread };
}
