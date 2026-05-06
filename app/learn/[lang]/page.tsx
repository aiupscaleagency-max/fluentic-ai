"use client";

import { use } from "react";
import * as React from "react";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { isValidLangCode, getLanguage, langNameI18n, LANGUAGES } from "@/lib/languages";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flashcards } from "@/components/flashcards";
import { Conversation } from "@/components/conversation";
import { ListenRepeat } from "@/components/listen-repeat";
import { MatchGame } from "@/components/games/match";
import { ClozeGame } from "@/components/games/cloze";
import { Pronunciation } from "@/components/pronunciation";
import { ScenariosTab } from "@/components/scenarios-tab";
import { ProgressBar } from "@/components/progress-bar";
import { LessonPath } from "@/components/lesson-path";
import { LevelPicker } from "@/components/level-picker";
import { TrackPicker } from "@/components/track-picker";
import { ExplainLangPicker } from "@/components/explain-lang-picker";
import { PersonaPicker } from "@/components/persona-picker";
import { ScrambleGame } from "@/components/games/scramble";
import { ListenPickGame } from "@/components/games/listen-pick";
import { SentenceBuilder } from "@/components/games/sentence-builder";
import { DailyChallengeCard } from "@/components/daily-challenge-card";
import { WordOfTheDay } from "@/components/word-of-the-day";
import { XpBoostBanner } from "@/components/xp-boost-banner";
import { GeneratedLessonContent } from "@/components/generated-lesson-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mic, Dices, Trophy, BookOpen, ArrowDown, Play } from "lucide-react";
import { LESSONS, getLessonI18n } from "@/lib/lessons";
import { getActiveLesson, getLessonActivity } from "@/lib/storage";
import type { LangCode } from "@/lib/languages";
import { useT } from "@/lib/i18n";
import { useUiLang } from "@/lib/ui-language";

export default function LearnPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  if (!isValidLangCode(lang)) {
    notFound();
  }
  const language = getLanguage(lang)!;
  const t = useT();
  const uiLang = useUiLang();
  const targetName = langNameI18n(lang, uiLang);

  const [activeLesson, setActiveLesson] = React.useState<string | null>(null);
  // Kontrollerad tab så Fortsätt-CTA kan flytta användaren till rätt övning
  const [activeTab, setActiveTab] = React.useState<string>("lesson");
  React.useEffect(() => {
    function refresh() {
      setActiveLesson(getActiveLesson(lang as LangCode));
    }
    refresh();
    window.addEventListener("fluentic:active-lesson-changed", refresh);
    return () => window.removeEventListener("fluentic:active-lesson-changed", refresh);
  }, [lang]);

  // Fortsätt-knapp: hoppa till nästa oavklarade aktivitet i lektionen
  // Ordning: flashcards → cloze → listen → om allt klart visa "Ord & fraser"
  function continueLesson() {
    let nextTab = "lesson";
    if (activeLesson) {
      const a = getLessonActivity(activeLesson);
      if (!a.flashcards) nextTab = "flashcards";
      else if (!a.cloze) nextTab = "cloze";
      else if (!a.listen) nextTab = "listen";
    }
    setActiveTab(nextTab);
    // Vänta en frame så tab har bytt content innan vi scrollar
    setTimeout(() => {
      const el = document.getElementById("tasks-heading");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="text-4xl drop-shadow">{language.flag}</div>
          <div>
            <h1 className="text-2xl font-bold">{t("learn.title")} {targetName.toLowerCase()}</h1>
            <p className="text-sm text-slate-400" dir={language.dir} lang={lang}>
              {language.native}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LevelPicker lang={lang} />
          <TrackPicker lang={lang} />
          <ExplainLangPicker lang={lang} />
          <PersonaPicker lang={lang} />
          <Link href="/achievements">
            <Button size="sm" variant="outline">
              <Trophy className="h-4 w-4" /> {t("learn.achievements")}
            </Button>
          </Link>
          <Link href={`/learn/${lang}/call`}>
            <Button size="sm">
              <Mic className="h-4 w-4" /> {t("learn.talk")}
            </Button>
          </Link>
          <div className="flex gap-1 ml-2">
            {LANGUAGES.filter((l) => l.code !== lang).map((l) => (
              <Link
                key={l.code}
                href={`/learn/${l.code}`}
                className="text-2xl hover:scale-110 transition-transform"
                title={l.name}
              >
                {l.flag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <ProgressBar />

      {/* "Dagens samtal" är OK i toppen men kompakt — bara 1 rad så lektionerna
          kommer ändå tydligt nedanför. */}
      <DailyChallengeCard lang={lang} />
      <XpBoostBanner />

      {/* Hero: din aktiva lektion — direkt-CTA, ingen scroll-fördröjning. */}
      <ActiveLessonHero lang={lang} activeLessonId={activeLesson} onContinue={continueLesson} />

      {/* Uppgifter för aktiv lektion — DIREKT. Tabs scrollar inte bort innehållet. */}
      <section aria-labelledby="tasks-heading" className="space-y-3">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 id="tasks-heading" className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-violet-300" /> {t("learn.lessonsHeader")}
            </h2>
            <p className="text-xs text-slate-300">{t("learn.practice.subtitle")}</p>
          </div>
          <Link href={`/learn/${lang}/mix`}>
            <Button size="sm" variant="secondary">
              <Dices className="h-4 w-4" /> {t("learn.quicklesson")}
            </Button>
          </Link>
        </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lesson">{t("tab.lesson")}</TabsTrigger>
          <TabsTrigger value="flashcards">{t("tab.flashcards")}</TabsTrigger>
          <TabsTrigger value="conversation">{t("tab.conversation")}</TabsTrigger>
          <TabsTrigger value="listen">{t("tab.listen")}</TabsTrigger>
          <TabsTrigger value="pron">{t("tab.pron")}</TabsTrigger>
          <TabsTrigger value="scenarios">{t("tab.scenarios")}</TabsTrigger>
          <TabsTrigger value="match">{t("tab.match")}</TabsTrigger>
          <TabsTrigger value="cloze">{t("tab.cloze")}</TabsTrigger>
          <TabsTrigger value="scramble">{t("tab.scramble")}</TabsTrigger>
          <TabsTrigger value="builder">{t("tab.builder")}</TabsTrigger>
          <TabsTrigger value="listenpick">{t("tab.listenpick")}</TabsTrigger>
        </TabsList>
        <TabsContent value="lesson">
          <GeneratedLessonContent lang={lang} lessonId={activeLesson} />
        </TabsContent>
        <TabsContent value="flashcards">
          <Flashcards lang={lang} lessonId={activeLesson ?? undefined} />
        </TabsContent>
        <TabsContent value="conversation">
          <Conversation lang={lang} />
        </TabsContent>
        <TabsContent value="listen">
          <ListenRepeat lang={lang} lessonId={activeLesson ?? undefined} />
        </TabsContent>
        <TabsContent value="pron">
          <Pronunciation lang={lang} />
        </TabsContent>
        <TabsContent value="scenarios">
          <ScenariosTab lang={lang} />
        </TabsContent>
        <TabsContent value="match">
          <MatchGame lang={lang} />
        </TabsContent>
        <TabsContent value="cloze">
          <ClozeGame lang={lang} lessonId={activeLesson ?? undefined} />
        </TabsContent>
        <TabsContent value="scramble">
          <ScrambleGame lang={lang} />
        </TabsContent>
        <TabsContent value="builder">
          <SentenceBuilder lang={lang} />
        </TabsContent>
        <TabsContent value="listenpick">
          <ListenPickGame lang={lang} />
        </TabsContent>
      </Tabs>
      </section>

      {/* Lektionskedjan — TYDLIG "Lektioner"-h2-rubrik så användaren ser att alla
          lektioner finns nedanför. Tidigare hade vi en svag "Lektioner — följ
          din lärväg" som lätt missades. */}
      <section aria-labelledby="path-heading" className="space-y-3 pt-4">
        <div className="flex items-center gap-2 border-t border-white/10 pt-5">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
          <h2 id="path-heading" className="text-2xl font-extrabold text-slate-100">
            {t("learn.lessonsHeader")} — {t("path.title")}
          </h2>
        </div>
        <p className="text-xs text-slate-300">{t("learn.lessons.subtitle")}</p>
        <LessonPath lang={lang} />
      </section>

      {/* Word of the Day längst ner — bonus-snack, inte i vägen */}
      <section className="space-y-3 pt-4">
        <WordOfTheDay lang={lang} />
      </section>
    </motion.div>
  );
}

// Hero-card: din aktiva lektion direkt-CTA. Visar lektionsnummer, titel,
// emoji och en stor "Fortsätt"-knapp som scrollar till uppgifterna.
function ActiveLessonHero({
  lang,
  activeLessonId,
  onContinue,
}: {
  lang: LangCode;
  activeLessonId: string | null;
  onContinue: () => void;
}) {
  const t = useT();
  const uiLang = useUiLang();
  const lesson = activeLessonId ? LESSONS.find((l) => l.id === activeLessonId) : null;

  if (!lesson) {
    // Ingen aktiv lektion än — uppmuntra till första lektionen
    const first = LESSONS[0];
    const firstI18n = getLessonI18n(first, uiLang);
    return (
      <Link
        href={`/learn/${lang}`}
        onClick={(e) => { e.preventDefault(); onContinue(); }}
        className="block"
      >
        <div className="rounded-2xl glass border-violet-300/30 p-5 flex items-center gap-4 hover:bg-white/5 transition-colors">
          <div className="text-5xl">{first.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider text-violet-200 font-extrabold">
              {t("learn.startFirst")}
            </div>
            <div className="font-bold text-lg text-slate-100 truncate">
              {first.number}. {firstI18n.title}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">{firstI18n.goal}</div>
          </div>
          <Button size="lg">
            <Play className="h-4 w-4" /> {t("common.start")}
          </Button>
        </div>
      </Link>
    );
  }

  const i18n = getLessonI18n(lesson, uiLang);

  return (
    <button
      type="button"
      onClick={onContinue}
      className="w-full text-left rounded-2xl border-2 border-violet-400/50 bg-gradient-to-r from-violet-500/15 via-pink-500/10 to-cyan-500/15 p-5 flex items-center gap-4 hover:from-violet-500/25 hover:via-pink-500/20 hover:to-cyan-500/25 transition-all shadow-lg shadow-violet-500/20"
    >
      <div className="text-5xl shrink-0 lesson-active-pulse rounded-full">{lesson.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider text-violet-200 font-extrabold">
          {t("learn.continue")}
        </div>
        <div className="font-bold text-lg text-slate-100 truncate">
          {lesson.number}. {i18n.title}
        </div>
        <div className="text-xs text-slate-300 mt-0.5 truncate">{i18n.goal}</div>
      </div>
      <div className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/40">
        <ArrowDown className="h-4 w-4" /> {t("common.continue")}
      </div>
    </button>
  );
}
