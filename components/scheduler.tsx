"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGES, getLanguage, type LangCode } from "@/lib/languages";
import {
  addScheduledLesson,
  getSchedule,
  removeScheduledLesson,
  getSelectedLanguages,
  type LessonType,
  type ScheduledLesson,
  type Weekday,
} from "@/lib/storage";
import { SCHEDULE_TEMPLATES, applyTemplate } from "@/lib/schedule-templates";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Trash2, Calendar, Plus, ChevronDown, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { NotificationCard } from "./notification-card";
import { pushNotification } from "@/lib/notifications";

const WEEKDAYS: { d: Weekday; label: string; short: string }[] = [
  { d: 1, label: "Mån", short: "M" },
  { d: 2, label: "Tis", short: "T" },
  { d: 3, label: "Ons", short: "O" },
  { d: 4, label: "Tor", short: "T" },
  { d: 5, label: "Fre", short: "F" },
  { d: 6, label: "Lör", short: "L" },
  { d: 0, label: "Sön", short: "S" },
];

const TYPE_LABELS: Record<LessonType, string> = {
  flashcards: "Flashcards",
  conversation: "Konversation",
  listen: "Lyssna & repetera",
};

// Kort, snärtigt namn på lektionstyp för notifikations-titel
const TYPE_SHORT: Record<LessonType, string> = {
  flashcards: "Snabblektion",
  conversation: "Konversationspass",
  listen: "Lyssna-pass",
};

// Lektionsfärger för veckogrid (per type)
const TYPE_COLORS: Record<LessonType, string> = {
  flashcards: "from-violet-500 to-fuchsia-500",
  conversation: "from-cyan-400 to-blue-500",
  listen: "from-emerald-400 to-teal-500",
};

export function Scheduler() {
  const [list, setList] = React.useState<ScheduledLesson[]>([]);
  const [language, setLanguage] = React.useState<LangCode>("es");
  const [time, setTime] = React.useState("18:00");
  const [days, setDays] = React.useState<Weekday[]>([1, 3, 5]);
  const [duration, setDuration] = React.useState(15);
  const [type, setType] = React.useState<LessonType>("flashcards");
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">("default");
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [appliedToast, setAppliedToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    setList(getSchedule());
    if (typeof window !== "undefined") {
      if (!("Notification" in window)) {
        setPermission("unsupported");
        return;
      }
      setPermission(Notification.permission);
      // Default-språk = användarens första valda språk
      const sel = getSelectedLanguages();
      if (sel.length > 0) setLanguage(sel[0]);
      // Poll permission var 2:a sek så vi reagerar när användaren tillåter via NotificationCard
      const id = window.setInterval(() => {
        const p = Notification.permission;
        setPermission((cur) => (cur !== p ? p : cur));
      }, 2000);
      return () => window.clearInterval(id);
    }
  }, []);

  // Påminnelse-loop — rik notifikation + in-app feed
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (permission !== "granted") return;
    const fired = new Set<string>();
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
          const langName = lang?.name ?? l.language;
          const title = `Dags att öva ${langName}!`;
          // Rik body: "⏰ Snabblektion — 15 min på Spanska · Klicka för att börja"
          const body = `⏰ ${TYPE_SHORT[l.type]} — ${l.durationMin} min på ${langName} · Klicka för att börja`;
          // Mix-läget passar för alla schemalagda typer (det blandar ändå)
          const url = `/learn/${l.language}/mix`;
          try {
            const n = new Notification(title, {
              body,
              tag: `fluentic-${l.id}-${stamp}`, // dedupera per slot
              requireInteraction: true,
              icon: "/icon-192.png",
              badge: "/icon-192.png",
              data: { url },
            });
            // Direkt-klick i samma tab (utan SW)
            n.onclick = () => {
              window.focus();
              window.location.href = url;
              n.close();
            };
          } catch {
            // ignorera om browser inte stödjer alla options
          }
          // Lägg in i in-app feed också så användaren ser det i klockan
          pushNotification({
            type: "lesson-start",
            title,
            body: `${TYPE_SHORT[l.type]} — ${l.durationMin} min på ${langName}`,
            link: url,
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
    const lesson = addScheduledLesson({ language, time, days, durationMin: duration, type });
    setList((cur) => [...cur, lesson]);
  }

  function remove(id: string) {
    removeScheduledLesson(id);
    setList((cur) => cur.filter((l) => l.id !== id));
  }

  function quickApply(templateId: string) {
    const tpl = SCHEDULE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const sel = getSelectedLanguages();
    const target = sel[0] ?? language;
    applyTemplate(tpl, target);
    setList(getSchedule());
    setAppliedToast(`${tpl.emoji} ${tpl.title} tillagd för ${getLanguage(target)?.name}`);
    window.setTimeout(() => setAppliedToast(null), 2200);
  }

  return (
    <div className="space-y-6">
      {/* Notification-permission card — visas bara när relevant */}
      <NotificationCard />

      {/* Snabbmallar */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-violet-300" /> Snabbmallar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCHEDULE_TEMPLATES.map((tpl, i) => (
            <motion.button
              key={tpl.id}
              type="button"
              onClick={() => quickApply(tpl.id)}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 rounded-2xl glass border-white/10 p-4 text-left hover:border-white/30 transition-all"
            >
              <div className="text-3xl">{tpl.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{tpl.title}</div>
                <div className="text-xs text-slate-400">{tpl.desc}</div>
              </div>
              <Plus className="h-5 w-5 text-violet-300" />
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {appliedToast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-3 inline-flex rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-sm text-emerald-200"
            >
              {appliedToast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Veckogrid */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-cyan-300" /> Vecka
        </h2>
        <WeekGrid list={list} onRemove={remove} />
      </div>

      {/* Manuell-läget */}
      <div>
        <button
          onClick={() => setShowAdvanced((s) => !s)}
          className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
          Lägg till manuellt
        </button>
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <Card className="mt-3">
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <label className="block">
                      <span className="text-xs text-slate-400">Språk</span>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as LangCode)}
                        className="mt-1 block w-full h-10 rounded-xl border border-white/15 bg-white/5 px-3 text-sm"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.flag} {l.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs text-slate-400">Tid</span>
                      <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" />
                    </label>
                    <label className="block">
                      <span className="text-xs text-slate-400">Längd (min)</span>
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
                      <span className="text-xs text-slate-400">Typ</span>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as LessonType)}
                        className="mt-1 block w-full h-10 rounded-xl border border-white/15 bg-white/5 px-3 text-sm"
                      >
                        {(Object.keys(TYPE_LABELS) as LessonType[]).map((t) => (
                          <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Dagar</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {WEEKDAYS.map((w) => {
                        const active = days.includes(w.d);
                        return (
                          <button
                            key={w.d}
                            type="button"
                            onClick={() => toggleDay(w.d)}
                            className={cn(
                              "px-3 py-1.5 text-sm rounded-lg border transition-all",
                              active
                                ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white border-transparent shadow-md shadow-violet-500/30"
                                : "border-white/15 bg-white/5 hover:bg-white/10",
                            )}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Dina lektioner
          </h2>
          {list.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-white/10">
              {list.map((l) => {
                const lang = getLanguage(l.language);
                const dayLabels = WEEKDAYS.filter((w) => l.days.includes(w.d)).map((w) => w.label).join(", ");
                return (
                  <li key={l.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-2xl">{lang?.flag}</div>
                      <div className="min-w-0">
                        <div className="font-medium">{lang?.name} • {l.time}</div>
                        <div className="text-xs text-slate-400 truncate">
                          {dayLabels} • {TYPE_LABELS[l.type]} • {l.durationMin} min
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{TYPE_LABELS[l.type]}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => remove(l.id)} aria-label="Ta bort">
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

/* ---------- WeekGrid: tim-rader x dag-kolumner, klick på blob = ta bort ---------- */
function WeekGrid({
  list,
  onRemove,
}: {
  list: ScheduledLesson[];
  onRemove: (id: string) => void;
}) {
  // Hitta intervall — vi visar 6:00–22:00
  const startHour = 6;
  const endHour = 22;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div className="rounded-2xl glass border-white/10 p-3 sm:p-4 overflow-x-auto">
      <div className="min-w-[560px]">
        {/* header */}
        <div className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] gap-1 mb-1">
          <div />
          {WEEKDAYS.map((w) => (
            <div key={w.d} className="text-[10px] sm:text-xs text-center text-slate-400 font-semibold">
              <span className="hidden sm:inline">{w.label}</span>
              <span className="sm:hidden">{w.short}</span>
            </div>
          ))}
        </div>

        {hours.map((h) => (
          <div key={h} className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] gap-1">
            <div className="text-[10px] text-slate-500 pr-1 text-right pt-1 font-mono tabular-nums">
              {String(h).padStart(2, "0")}
            </div>
            {WEEKDAYS.map((w) => {
              const here = list.filter(
                (l) => l.days.includes(w.d) && parseInt(l.time.slice(0, 2), 10) === h,
              );
              return (
                <div
                  key={`${h}-${w.d}`}
                  className="relative h-8 sm:h-10 rounded-md border border-white/5 bg-white/[0.02]"
                >
                  {here.map((l, i) => {
                    const lang = getLanguage(l.language);
                    return (
                      <button
                        key={l.id}
                        onClick={() => {
                          if (confirm(`Ta bort ${lang?.name} ${l.time}?`)) onRemove(l.id);
                        }}
                        title={`${lang?.name} • ${l.time} • ${TYPE_LABELS[l.type]} (${l.durationMin}m)`}
                        className={cn(
                          "absolute inset-x-0.5 top-0.5 rounded text-[10px] font-semibold text-white px-1 truncate",
                          "bg-gradient-to-br shadow-md transition-transform active:scale-95",
                          TYPE_COLORS[l.type],
                        )}
                        style={{
                          height: `calc(100% - ${i * 4}px - 4px)`,
                          zIndex: 5 + i,
                        }}
                      >
                        {lang?.flag} {l.time}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */
function EmptyState() {
  return (
    <div className="text-center py-8 space-y-3">
      <div className="text-5xl">📅</div>
      <p className="text-sm text-slate-400">
        Inga lektioner schemalagda än. Klicka på en mall ovan för att komma igång på 1 sekund.
      </p>
    </div>
  );
}
