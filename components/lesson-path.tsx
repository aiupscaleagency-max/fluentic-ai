"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLessons } from "@/lib/lessons";
import { getCompletedLessons, markLessonCompleted, addXP } from "@/lib/storage";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Lock, CheckCircle2, Play } from "lucide-react";

// Visar 5 lektioner som en vertikal "väg" där nästa låses upp när föregående klarats
export function LessonPath({ lang }: { lang: LangCode }) {
  const lessons = React.useMemo(() => getLessons(lang), [lang]);
  const [completed, setCompleted] = React.useState<string[]>([]);

  React.useEffect(() => {
    function refresh() { setCompleted(getCompletedLessons(lang)); }
    refresh();
    window.addEventListener("fluentic:lessons-changed", refresh);
    return () => window.removeEventListener("fluentic:lessons-changed", refresh);
  }, [lang]);

  function isUnlocked(idx: number) {
    if (idx === 0) return true;
    return completed.includes(lessons[idx - 1].id);
  }

  function complete(id: string) {
    markLessonCompleted(lang, id);
    addXP(20);
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <h3 className="font-semibold">Din lärväg</h3>
        <div className="space-y-2">
          {lessons.map((lesson, i) => {
            const done = completed.includes(lesson.id);
            const unlocked = isUnlocked(i);
            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  done
                    ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20"
                    : unlocked
                      ? "border-indigo-200 dark:border-indigo-800"
                      : "border-slate-200 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="text-3xl">{lesson.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{lesson.number}. {lesson.title}</span>
                    <Badge variant="outline">{lesson.level}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{lesson.goalSv}</p>
                </div>
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : !unlocked ? (
                  <Lock className="h-5 w-5 text-slate-400" />
                ) : (
                  <Button size="sm" onClick={() => complete(lesson.id)}>
                    <Play className="h-4 w-4" /> Klar
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">Markera klar när du har övat kategorin med flashcards, cloze och listen-repeat. +20 XP per lektion.</p>
      </CardContent>
    </Card>
  );
}
