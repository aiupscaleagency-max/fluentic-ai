"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Volume2, Loader2, Sparkles, BookOpen, MessageSquare } from "lucide-react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { LESSONS } from "@/lib/lessons";
import { useGeneratedLessonContent } from "@/lib/lesson-content";
import { useT } from "@/lib/i18n";

// Visar lektions-specifikt vocab + phrases. Auto-genereras via Gemini om
// vi inte redan har handgjord data. Cachas på server (tmpdir) + klient (localStorage).
export function GeneratedLessonContent({
  lang,
  lessonId,
}: {
  lang: LangCode;
  lessonId: string | null;
}) {
  const language = getLanguage(lang)!;
  const t = useT();
  const lesson = lessonId ? LESSONS.find((l) => l.id === lessonId) : null;
  const { content, loading, error } = useGeneratedLessonContent(lessonId, lang);

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language.bcp47;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  if (!lessonId || !lesson) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-slate-300">
          {t("gen.empty")}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-slate-300 flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
          {t("gen.preparing")} {lesson.title}…
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-red-300">
          {t("gen.error")} {error}
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-300">
          {t("common.loading")}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{lesson.emoji}</span>
          <div>
            <div className="font-semibold flex items-center gap-2">
              {lesson.number}. {lesson.title}
              <Badge variant="outline">{lesson.level}</Badge>
            </div>
            <div className="text-xs text-slate-300">{lesson.goalSv}</div>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" /> {t("gen.aiCreated")}
        </Badge>
      </div>

      {/* Vocab */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-100">
            <BookOpen className="h-4 w-4 text-cyan-300" /> {t("gen.words")} ({content.vocab.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {content.vocab.map((v, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-base text-slate-100 truncate" dir={language.dir} lang={lang}>
                    {v.word}
                  </div>
                  <div className="text-xs text-slate-300 truncate">{v.sv}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => speak(v.word)}
                  aria-label={t("common.listen")}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phrases */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-100">
            <MessageSquare className="h-4 w-4 text-violet-300" /> {t("gen.phrases")} ({content.phrases.length})
          </h3>
          <div className="space-y-2">
            {content.phrases.map((p, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 flex items-start gap-3"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="font-medium text-slate-100" dir={language.dir} lang={lang}>
                    {p.text}
                  </div>
                  <div className="text-xs text-slate-300">{p.sv}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => speak(p.text)} aria-label={t("common.listen")}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
