"use client";

// AI dagsplanerare — "Din dag"-sektion på hemskärmen.
// Kan tagga task som klar lokalt så den greyas ut + checkmark.
// Cachas per dygn i localStorage så vi inte spammar API:t. "Generera ny plan"
// bypassar cache exakt en gång.
import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { LANGUAGES, type LangCode } from "@/lib/languages";
import { getSelectedLanguages, getProgress, getDailyGoal, getSchedule } from "@/lib/storage";
import { getTracks, type TrackId } from "@/lib/track";
import { getLevel, type CefrLevel } from "@/lib/level";
import { getExplainLang, type ExplainLang } from "@/lib/explain-lang";
import { Sparkles, RefreshCcw, Check, Loader2, Sunrise } from "lucide-react";
import { cn } from "@/lib/cn";

interface DayTask {
  emoji: string;
  title: string;
  lang: LangCode;
  type: string;
  durationMin: number;
  link: string;
  done?: boolean;
}

interface DayPlanData {
  greeting: string;
  motivation: string;
  tasks: DayTask[];
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const CACHE_PREFIX = "fluentic.dayplan.";

function readCache(date: string): DayPlanData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + date);
    if (!raw) return null;
    return JSON.parse(raw) as DayPlanData;
  } catch {
    return null;
  }
}

function writeCache(date: string, plan: DayPlanData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_PREFIX + date, JSON.stringify(plan));
  } catch {
    // ignorera quota
  }
}

// Beräkna schemalagda lektionstider för idag
function getScheduledForToday(): string[] {
  const today = new Date().getDay();
  return getSchedule()
    .filter((l) => l.days.includes(today as 0 | 1 | 2 | 3 | 4 | 5 | 6))
    .map((l) => l.time)
    .sort();
}

export function DayPlan() {
  const [plan, setPlan] = React.useState<DayPlanData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasLangs, setHasLangs] = React.useState(false);

  const fetchedDateRef = React.useRef<string | null>(null);

  const loadPlan = React.useCallback(async (force = false) => {
    if (typeof window === "undefined") return;
    const langs = getSelectedLanguages();
    setHasLangs(langs.length > 0);
    if (langs.length === 0) {
      setLoading(false);
      return;
    }

    const date = todayKey();
    fetchedDateRef.current = date;

    // Försök cache först
    if (!force) {
      const cached = readCache(date);
      if (cached) {
        setPlan(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    // Bygg per-språk metadata
    const tracks: Record<string, TrackId[]> = {};
    const levels: Record<string, CefrLevel> = {};
    let explainLang: ExplainLang = "sv";
    langs.forEach((l) => {
      tracks[l] = getTracks(l);
      const lv = getLevel(l);
      if (lv) levels[l] = lv;
      // Använd explain-lang från första språket som default för hela planen
      if (l === langs[0]) explainLang = getExplainLang(l);
    });

    const progress = getProgress();
    const dailyGoal = getDailyGoal();
    const scheduledToday = getScheduledForToday();

    try {
      const res = await fetch("/api/day-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languages: langs,
          tracks,
          levels,
          streak: progress.streakDays,
          xpToday: progress.todayXp,
          dailyGoal,
          scheduledToday,
          explainLang,
          hour: new Date().getHours(),
        }),
      });
      const data = (await res.json()) as DayPlanData & { error?: string };
      if (!res.ok || !data.tasks) {
        throw new Error(data.error ?? "Kunde inte hämta dagsplan");
      }
      // Bevara done-flaggor om vi forcerar en ny plan men har samma tasks
      const fresh: DayPlanData = {
        greeting: data.greeting,
        motivation: data.motivation,
        tasks: data.tasks.map((t) => ({ ...t, done: false })),
      };
      setPlan(fresh);
      writeCache(date, fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPlan(false);
    // Lyssna på lesson-complete så vi kan markera matchande task som done
    function onLessonComplete() {
      // Naive: markera FÖRSTA odoneda task som done — bra nog för MVP
      setPlan((cur) => {
        if (!cur) return cur;
        const idx = cur.tasks.findIndex((t) => !t.done);
        if (idx === -1) return cur;
        const next = {
          ...cur,
          tasks: cur.tasks.map((t, i) => (i === idx ? { ...t, done: true } : t)),
        };
        if (fetchedDateRef.current) writeCache(fetchedDateRef.current, next);
        return next;
      });
    }
    window.addEventListener("fluentic:lesson-complete", onLessonComplete);
    return () => window.removeEventListener("fluentic:lesson-complete", onLessonComplete);
  }, [loadPlan]);

  // Inga språk valda — visa inget
  if (!hasLangs) return null;

  // Skeleton-loader
  if (loading && !plan) {
    return (
      <Card variant="gradient" className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/10 shimmer" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-40 rounded bg-white/10 shimmer" />
              <div className="h-3 w-64 rounded bg-white/10 shimmer" />
            </div>
          </div>
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 shimmer" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !plan) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-rose-300 flex items-center justify-between gap-3">
          <span>Kunde inte ladda dagsplan: {error}</span>
          <Button size="sm" variant="outline" onClick={() => loadPlan(true)}>Försök igen</Button>
        </CardContent>
      </Card>
    );
  }

  if (!plan) return null;

  const total = plan.tasks.length;
  const doneCount = plan.tasks.filter((t) => t.done).length;
  const progress = total > 0 ? (doneCount / total) * 100 : 0;

  return (
    <Card variant="gradient" className="relative overflow-hidden">
      {/* Floating glow orb i bakgrunden — ThyroidAI-vibe */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-violet-500/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-400/25 blur-3xl"
      />

      <CardContent className="p-5 sm:p-6 space-y-5 relative z-10">
        {/* Header */}
        <div className="flex items-start gap-3 flex-wrap">
          <motion.div
            initial={{ rotate: -10, scale: 0.7, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-lg shadow-violet-500/40 shrink-0"
          >
            <Sunrise className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider text-violet-300/80 font-semibold">
              Din dag
            </div>
            <div className="text-xl sm:text-2xl font-bold leading-tight">
              {plan.greeting}
            </div>
            <div className="text-sm text-slate-300 mt-1">{plan.motivation}</div>
          </div>
          {total > 0 && (
            <div className="text-right shrink-0">
              <div className="text-xs text-slate-400">Klart</div>
              <div className="text-lg font-bold text-gradient">{doneCount}/{total}</div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        )}

        {/* Task-kort */}
        <div className="space-y-2">
          <AnimatePresence>
            {plan.tasks.map((t, i) => {
              const lang = LANGUAGES.find((l) => l.code === t.lang);
              return (
                <motion.div
                  key={`${t.title}-${i}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  whileHover={!t.done ? { scale: 1.01, y: -1 } : {}}
                >
                  <Link href={t.link} className="block">
                    <div
                      className={cn(
                        "rounded-2xl border p-4 transition-all flex items-center gap-3",
                        t.done
                          ? "border-emerald-500/30 bg-emerald-500/5 opacity-60"
                          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20",
                      )}
                    >
                      <div className="text-3xl shrink-0">{t.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className={cn("font-semibold text-sm", t.done && "line-through")}>
                          {t.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          {lang && (
                            <span className="inline-flex items-center gap-1">
                              <span>{lang.flag}</span>
                              <span>{lang.name}</span>
                            </span>
                          )}
                          <span>·</span>
                          <span>{t.durationMin} min</span>
                        </div>
                      </div>
                      {t.done ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        <Sparkles className="h-4 w-4 text-violet-300 shrink-0" />
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Generera ny plan */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-500">
            Planen uppdateras varje morgon. Klart-status syncas automatiskt.
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadPlan(true)}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Generera ny
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
