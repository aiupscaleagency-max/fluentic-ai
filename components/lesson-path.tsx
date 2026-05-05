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
} from "@/lib/storage";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "./ui/dialog";
import { Lock, CheckCircle2, Play, Heart, PartyPopper, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

// Visuell Duolingo-liknande lektionsväg.
// Noder zig-zaggar, klar = grön glow, aktiv = pulserande violet, låst = grayscale.
export function LessonPath({ lang }: { lang: LangCode }) {
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

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-300" /> Din lärväg
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Markeras klar när flashcards + lucka + lyssna är gjorda. +20 XP per lektion.
          </p>

          <div className="relative">
            {lessons.map((lesson, i) => {
              const done = completed.includes(lesson.id);
              const unlocked = isUnlocked(i);
              const steps = stepsByLesson[lesson.id] ?? 0;
              const active = activeId === lesson.id;
              // zig-zag: even = vänster, odd = höger
              const right = i % 2 === 1;
              return (
                <div key={lesson.id} className="relative flex items-center mb-6 last:mb-0">
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
                            {steps}/3 steg
                          </Badge>
                        )}
                        {active && !done && <Badge>Aktiv</Badge>}
                        {done && <Badge variant="success">Klar</Badge>}
                        {!done && unlocked && !active && (
                          <Button size="sm" onClick={() => start(lesson.id)} className="ml-auto">
                            <Play className="h-3 w-3" /> Starta
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
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={celebrate !== null} onOpenChange={(o) => !o && setCelebrate(null)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-violet-300" /> Lektion klar!
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          {celebrate && (
            <div className="space-y-3">
              <p className="text-sm">
                Du klarade <strong>{celebrate.title}</strong>.{" "}
                <span className="inline-flex items-center gap-1">
                  +20 XP <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Hjärtat är ifyllt och nästa lektion är upplåst. Bra jobbat!
              </p>
              <div className="flex justify-end">
                <Button onClick={() => setCelebrate(null)}>Fortsätt</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
