"use client";

import * as React from "react";
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
import { Lock, CheckCircle2, Play, Heart, PartyPopper } from "lucide-react";

// Visar lektioner som en vertikal "väg" där nästa låses upp när föregående klarats.
// Klart = användaren har gjort flashcards + cloze + listen-repeat (auto-spårat).
export function LessonPath({ lang }: { lang: LangCode }) {
  const lessons = React.useMemo(() => getLessons(lang), [lang]);
  const [completed, setCompleted] = React.useState<string[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  // Cache för antal aktiviteter klara per lektion-id
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
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold">Din lärväg</h3>
          <div className="space-y-2">
            {lessons.map((lesson, i) => {
              const done = completed.includes(lesson.id);
              const unlocked = isUnlocked(i);
              const steps = stepsByLesson[lesson.id] ?? 0;
              const active = activeId === lesson.id;
              return (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    done
                      ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20"
                      : active
                        ? "border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20"
                        : unlocked
                          ? "border-indigo-200 dark:border-indigo-800"
                          : "border-slate-200 dark:border-slate-800 opacity-60"
                  }`}
                >
                  <div className="text-3xl">{lesson.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{lesson.number}. {lesson.title}</span>
                      <Badge variant="outline">{lesson.level}</Badge>
                      {!done && unlocked && (
                        <Badge variant={steps === 3 ? "success" : "secondary"}>
                          Steg klara: {steps}/3
                        </Badge>
                      )}
                      {active && !done && (
                        <Badge>Aktiv</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{lesson.goalSv}</p>
                  </div>
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : !unlocked ? (
                    <Lock className="h-5 w-5 text-slate-400" />
                  ) : active ? (
                    <Badge variant="outline">Tränar nu</Badge>
                  ) : (
                    <Button size="sm" onClick={() => start(lesson.id)}>
                      <Play className="h-4 w-4" /> Starta
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500">
            Lektionen markeras automatiskt som klar när du har gjort flashcards, lucka och lyssna & repetera. +20 XP per lektion.
          </p>
        </CardContent>
      </Card>

      <Dialog open={celebrate !== null} onOpenChange={(o) => !o && setCelebrate(null)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-indigo-600" /> Lektion klar!
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          {celebrate && (
            <div className="space-y-3">
              <p className="text-sm">
                Du klarade <strong>{celebrate.title}</strong>. <span className="inline-flex items-center gap-1">+20 XP <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /></span>
              </p>
              <p className="text-xs text-slate-500">
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
