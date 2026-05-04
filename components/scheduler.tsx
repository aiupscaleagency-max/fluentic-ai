"use client";

import * as React from "react";
import { LANGUAGES, getLanguage, type LangCode } from "@/lib/languages";
import {
  addScheduledLesson,
  getSchedule,
  removeScheduledLesson,
  type LessonType,
  type ScheduledLesson,
  type Weekday,
} from "@/lib/storage";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Trash2, Bell, BellRing, Calendar, Plus } from "lucide-react";

const WEEKDAYS: { d: Weekday; label: string }[] = [
  { d: 1, label: "Mån" },
  { d: 2, label: "Tis" },
  { d: 3, label: "Ons" },
  { d: 4, label: "Tor" },
  { d: 5, label: "Fre" },
  { d: 6, label: "Lör" },
  { d: 0, label: "Sön" },
];

const TYPE_LABELS: Record<LessonType, string> = {
  flashcards: "Flashcards",
  conversation: "Konversation",
  listen: "Lyssna & repetera",
};

export function Scheduler() {
  const [list, setList] = React.useState<ScheduledLesson[]>([]);
  const [language, setLanguage] = React.useState<LangCode>("es");
  const [time, setTime] = React.useState("18:00");
  const [days, setDays] = React.useState<Weekday[]>([1, 3, 5]);
  const [duration, setDuration] = React.useState(15);
  const [type, setType] = React.useState<LessonType>("flashcards");
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">("default");

  React.useEffect(() => {
    setList(getSchedule());
    if (typeof window !== "undefined") {
      if (!("Notification" in window)) {
        setPermission("unsupported");
      } else {
        setPermission(Notification.permission);
      }
    }
  }, []);

  // Påminnelse-loop: kollar varje minut om någon lektion ska triggas just nu
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (permission !== "granted") return;
    const fired = new Set<string>(); // hindrar dubbla notiser inom samma minut

    function tick() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const day = now.getDay() as Weekday;
      const stamp = `${now.toDateString()}-${hh}:${mm}`;
      const current = getSchedule();
      current.forEach((l) => {
        if (l.time === `${hh}:${mm}` && l.days.includes(day)) {
          const key = `${l.id}-${stamp}`;
          if (fired.has(key)) return;
          fired.add(key);
          const lang = getLanguage(l.language);
          new Notification("Dags att öva " + (lang?.name ?? l.language) + "!", {
            body: `${TYPE_LABELS[l.type]} • ${l.durationMin} min`,
          });
        }
      });
    }

    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [permission]);

  function toggleDay(d: Weekday) {
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  }

  function add() {
    if (days.length === 0) return;
    const lesson = addScheduledLesson({
      language,
      time,
      days,
      durationMin: duration,
      type,
    });
    setList((cur) => [...cur, lesson]);
  }

  function remove(id: string) {
    removeScheduledLesson(id);
    setList((cur) => cur.filter((l) => l.id !== id));
  }

  async function requestPerm() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") {
      new Notification("Påminnelser är aktiva", {
        body: "Vi pingar dig när det är dags att öva.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5" /> Lägg till lektion
            </h2>
            <Button
              variant={permission === "granted" ? "secondary" : "default"}
              onClick={requestPerm}
              disabled={permission === "unsupported" || permission === "granted"}
            >
              {permission === "granted" ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              {permission === "granted"
                ? "Påminnelser aktiva"
                : permission === "unsupported"
                  ? "Notiser stöds ej"
                  : permission === "denied"
                    ? "Notiser nekade"
                    : "Aktivera påminnelser"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <label className="block">
              <span className="text-xs text-slate-500">Språk</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LangCode)}
                className="mt-1 block w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 text-sm"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Tid</span>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Längd (min)</span>
              <Input
                type="number"
                min={5}
                max={120}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Typ</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LessonType)}
                className="mt-1 block w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 text-sm"
              >
                {(Object.keys(TYPE_LABELS) as LessonType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className="text-xs text-slate-500">Dagar</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {WEEKDAYS.map((w) => {
                const active = days.includes(w.d);
                return (
                  <button
                    key={w.d}
                    type="button"
                    onClick={() => toggleDay(w.d)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-transparent border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={add} disabled={days.length === 0}>
            <Plus className="h-4 w-4" /> Spara
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Dina lektioner
          </h2>
          {list.length === 0 ? (
            <p className="text-sm text-slate-500">Inga lektioner schemalagda än.</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {list.map((l) => {
                const lang = getLanguage(l.language);
                const dayLabels = WEEKDAYS.filter((w) => l.days.includes(w.d))
                  .map((w) => w.label)
                  .join(", ");
                return (
                  <li key={l.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-2xl">{lang?.flag}</div>
                      <div className="min-w-0">
                        <div className="font-medium">{lang?.name} • {l.time}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {dayLabels} • {TYPE_LABELS[l.type]} • {l.durationMin} min
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{TYPE_LABELS[l.type]}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(l.id)}
                        aria-label="Ta bort"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
