"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { LangCode } from "@/lib/languages";
import { getLessons, type Lesson } from "@/lib/lessons";
import {
  getCompletedLessons,
  getLessonActivity,
  getActiveLesson,
  setActiveLesson,
  applyLevelStartingPoint,
} from "@/lib/storage";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "./ui/dialog";
import { Lock, CheckCircle2, Play, Heart, PartyPopper, Sparkles, GraduationCap, FastForward, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { CEFR_DESCRIPTIONS, type CefrLevel, getLevel } from "@/lib/level";
import { useT } from "@/lib/i18n";
import { Confetti } from "./confetti";

// Visuell Duolingo-liknande lektionsväg.
// Noder zig-zaggar, klar = grön glow, aktiv = pulserande violet, låst = grayscale.
export function LessonPath({ lang }: { lang: LangCode }) {
  const t = useT();
  const lessons = React.useMemo(() => getLessons(lang), [lang]);
  const [completed, setCompleted] = React.useState<string[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [stepsByLesson, setStepsByLesson] = React.useState<Record<string, number>>({});
  const [celebrate, setCelebrate] = React.useState<Lesson | null>(null);

  const refresh = React.useCallback(() => {
    setCompleted(getCompletedLessons(lang));
    setActiveId(getActiveLesson(lang));
    const map: Record<string, number> = {};
    for (const l of lessons) {
      const a = getLessonActivity(l.id);
      map[l.id] = (a.flashcards ? 1 : 0) + (a.cloze ? 1 : 0) + (a.listen ? 1 : 0);
    }
    setStepsByLesson(map);
  }, [lang, lessons]);

  React.useEffect(() => {
    refresh();
    const events = [
      "fluentic:lessons-changed",
      "fluentic:activity-changed",
      "fluentic:active-lesson-changed",
    ];
    events.forEach((e) => window.addEventListener(e, refresh));
    function onComplete(e: Event) {
      const detail = (e as CustomEvent<{ lessonId: string }>).detail;
      const lesson = lessons.find((l) => l.id === detail?.lessonId);
      if (lesson) setCelebrate(lesson);
      refresh();
    }
    window.addEventListener("fluentic:lesson-complete", onComplete);
    return () => {
      events.forEach((e) => window.removeEventListener(e, refresh));
      window.removeEventListener("fluentic:lesson-complete", onComplete);
    };
  }, [refresh, lessons]);

  function isUnlocked(idx: number) {
    if (idx === 0) return true;
    return completed.includes(lessons[idx - 1].id);
  }

  function start(id: string) {
    setActiveLesson(lang, id);
  }

  // Collapsible per CEFR-nivå — annars blir 40 lektioner ohanterligt långt scroll.
  // Default: nivån som har aktiv lektion expanderad. Övriga collapsed.
  const [expandedLevels, setExpandedLevels] = React.useState<Set<CefrLevel>>(new Set());
  const activeLessonObj = lessons.find((l) => l.id === activeId);
  React.useEffect(() => {
    const next = new Set<CefrLevel>();
    if (activeLessonObj) next.add(activeLessonObj.level);
    else next.add("A1");
    setExpandedLevels(next);
    // Bara när active byter — manuell expand/collapse av användaren ska inte resettas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  function toggleLevel(lvl: CefrLevel) {
    setExpandedLevels((cur) => {
      const next = new Set(cur);
      if (next.has(lvl)) next.delete(lvl);
      else next.add(lvl);
      return next;
    });
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
            <h3 className="font-semibold flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-violet-300" /> {t("path.title")}
            </h3>
            <JumpToMyLevelButton
              lang={lang}
              lessons={lessons}
              completed={completed}
              activeId={activeId}
              onApplied={refresh}
            />
          </div>
          <p className="text-xs text-slate-300 mb-4">
            {t("path.subtitle")}
          </p>

          {/* CEFR-progress-rad: visar antal klara per nivå */}
          {(() => {
            const byLevel = lessons.reduce<Record<string, { total: number; done: number }>>((acc, l) => {
              acc[l.level] ??= { total: 0, done: 0 };
              acc[l.level].total += 1;
              if (completed.includes(l.id)) acc[l.level].done += 1;
              return acc;
            }, {});
            const levelOrder: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];
            const ringColor: Record<CefrLevel, string> = {
              A1: "border-emerald-400/60 text-emerald-200",
              A2: "border-cyan-400/60 text-cyan-200",
              B1: "border-violet-400/60 text-violet-200",
              B2: "border-pink-400/60 text-pink-200",
              C1: "border-amber-400/60 text-amber-200",
            };
            return (
              <div className="mb-5 flex flex-wrap gap-2">
                {levelOrder.filter((l) => byLevel[l]).map((lvl) => {
                  const { total, done } = byLevel[lvl];
                  const allDone = done === total;
                  return (
                    <div
                      key={lvl}
                      className={cn(
                        "flex items-center gap-2 rounded-full border bg-white/5 px-3 py-1.5 text-xs font-medium",
                        ringColor[lvl],
                        allDone && "ring-1 ring-current/50"
                      )}
                    >
                      <span className="font-bold">{lvl}</span>
                      <span className="opacity-80">{done}/{total}</span>
                      {allDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div className="relative">
            {lessons.map((lesson, i) => {
              const done = completed.includes(lesson.id);
              const unlocked = isUnlocked(i);
              const steps = stepsByLesson[lesson.id] ?? 0;
              const active = activeId === lesson.id;
              // zig-zag: even = vänster, odd = höger
              const right = i % 2 === 1;
              // Visa nivå-rubrik när lektionens CEFR-nivå skiljer sig från föregående
              const prevLevel = i > 0 ? lessons[i - 1].level : null;
              const showLevelHeader = lesson.level !== prevLevel;
              const levelClassByLevel: Record<CefrLevel, string> = {
                A1: "from-emerald-400/30 to-emerald-300/10 border-emerald-300/30 text-emerald-200",
                A2: "from-cyan-400/30 to-cyan-300/10 border-cyan-300/30 text-cyan-200",
                B1: "from-violet-400/30 to-violet-300/10 border-violet-300/30 text-violet-200",
                B2: "from-pink-400/30 to-pink-300/10 border-pink-300/30 text-pink-200",
                C1: "from-amber-400/30 to-amber-300/10 border-amber-300/30 text-amber-200",
              };
              const isExpanded = expandedLevels.has(lesson.level);
              // Räkna lektioner i denna nivå för att visa X/Y i headern
              const inThisLevel = lessons.filter((l) => l.level === lesson.level);
              const doneInLevel = inThisLevel.filter((l) => completed.includes(l.id)).length;
              return (
                <React.Fragment key={lesson.id}>
                {showLevelHeader && (
                  <div className="relative my-5 first:mt-0">
                    <button
                      type="button"
                      onClick={() => toggleLevel(lesson.level)}
                      className={cn(
                        "w-full rounded-xl border bg-gradient-to-r px-4 py-2.5 flex items-center gap-3 hover:brightness-110 transition-all",
                        levelClassByLevel[lesson.level]
                      )}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded
                        ? <ChevronDown className="h-4 w-4 shrink-0" />
                        : <ChevronRight className="h-4 w-4 shrink-0" />}
                      <GraduationCap className="h-4 w-4 shrink-0" />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0 flex-1 text-left">
                        <span className="font-bold text-sm">{t("path.level")} {lesson.level}</span>
                        <span className="text-xs opacity-80 truncate">
                          {CEFR_DESCRIPTIONS[lesson.level].split(" — ")[1]}
                        </span>
                      </div>
                      <span className="text-xs font-medium opacity-90">
                        {doneInLevel}/{inThisLevel.length}
                      </span>
                    </button>
                  </div>
                )}
                {!isExpanded ? null : (
                <div className="relative flex items-center mb-6 last:mb-0">
                  {/* Stigen-linje */}
                  {i < lessons.length - 1 && (
                    <span
                      className={cn(
                        "absolute left-1/2 top-20 h-12 w-1 -translate-x-1/2 rounded-full",
                        done ? "bg-gradient-to-b from-emerald-400 to-cyan-400" : "bg-white/10",
                      )}
                    />
                  )}

                  <div
                    className={cn(
                      "w-1/2 flex",
                      right ? "justify-end pr-4" : "justify-start pl-4",
                    )}
                  >
                    {/* Info-bubbla */}
                    <motion.div
                      initial={{ opacity: 0, x: right ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn(
                        "rounded-2xl glass border-white/10 p-3 max-w-[260px]",
                        !unlocked && "opacity-50",
                      )}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">
                          {lesson.number}. {lesson.title}
                        </span>
                        <Badge variant="outline">{lesson.level}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{lesson.goalSv}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {!done && unlocked && (
                          <Badge variant={steps === 3 ? "success" : "secondary"}>
                            {steps}/3 {t("path.lesson.steps")}
                          </Badge>
                        )}
                        {active && !done && <Badge>{t("path.lesson.active")}</Badge>}
                        {done && <Badge variant="success">{t("path.lesson.done")}</Badge>}
                        {!done && unlocked && !active && (
                          <Button size="sm" onClick={() => start(lesson.id)} className="ml-auto">
                            <Play className="h-3 w-3" /> {t("common.start")}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Noden i mitten */}
                  <div
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 z-10 flex h-16 w-16 items-center justify-center rounded-full text-3xl border-2 transition-all",
                      done
                        ? "bg-gradient-to-br from-emerald-400 to-cyan-500 border-emerald-300 shadow-lg shadow-emerald-500/40"
                        : active
                          ? "bg-gradient-to-br from-violet-500 to-pink-500 border-violet-300 lesson-active-pulse"
                          : unlocked
                            ? "bg-white/10 border-white/20"
                            : "bg-white/5 border-white/10 grayscale opacity-50",
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-7 w-7 text-white" />
                    ) : !unlocked ? (
                      <Lock className="h-6 w-6 text-slate-400" />
                    ) : (
                      <span>{lesson.emoji}</span>
                    )}
                  </div>

                  {/* Plats för balans (andra sidan, tom) */}
                  <div className="w-1/2" />
                </div>
                )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={celebrate !== null} onOpenChange={(o) => !o && setCelebrate(null)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-violet-300" /> {t("path.celebrate.title")}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          {celebrate && (
            <div className="space-y-3 relative">
              <Confetti count={28} className="-top-10" />
              <p className="text-sm">
                {t("path.celebrate.body")} <strong>{celebrate.title}</strong>.{" "}
                <span className="inline-flex items-center gap-1">
                  +20 XP <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                </span>
              </p>
              <p className="text-xs text-slate-300">
                {t("path.celebrate.unlock")}
              </p>
              <div className="flex justify-end">
                <Button onClick={() => setCelebrate(null)}>{t("common.continue")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// "Hoppa till min nivå"-knapp: kör om applyLevelStartingPoint för current level
// så att lägre lektioner markeras klara och aktiv lektion sätts till första olästa
// på användarens CEFR-nivå. Visas bara om det FAKTISKT finns lägre lektioner att skippa.
function JumpToMyLevelButton({
  lang,
  lessons,
  completed,
  activeId,
  onApplied,
}: {
  lang: LangCode;
  lessons: Lesson[];
  completed: string[];
  activeId: string | null;
  onApplied: () => void;
}) {
  const t = useT();
  const [level, setLvl] = React.useState<CefrLevel | null>(null);
  React.useEffect(() => {
    setLvl(getLevel(lang));
    function refresh() { setLvl(getLevel(lang)); }
    window.addEventListener("fluentic:level-changed", refresh);
    return () => window.removeEventListener("fluentic:level-changed", refresh);
  }, [lang]);

  if (!level) return null;
  const ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];
  const targetIdx = ORDER.indexOf(level);
  // Finns det olästa lektioner UNDER current level? Då har användaren något att skippa.
  const lowerUnfinished = lessons.some((l) => {
    const idx = ORDER.indexOf(l.level as CefrLevel);
    return idx >= 0 && idx < targetIdx && !completed.includes(l.id);
  });
  // Sitter användaren redan på rätt aktiv lektion (på sin nivå)? Då behövs ingen knapp.
  const activeLesson = lessons.find((l) => l.id === activeId);
  const onCorrectLevel = activeLesson && ORDER.indexOf(activeLesson.level as CefrLevel) >= targetIdx;
  if (!lowerUnfinished && onCorrectLevel) return null;

  function jump() {
    if (!level) return;
    applyLevelStartingPoint(lang, level, lessons);
    onApplied();
  }
  return (
    <Button size="sm" variant="outline" onClick={jump} title={`${t("path.jumpto")} ${level}`}>
      <FastForward className="h-3.5 w-3.5" /> {t("path.jumpto")} {level}
    </Button>
  );
}
