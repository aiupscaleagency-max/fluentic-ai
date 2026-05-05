"use client";

import { use } from "react";
import * as React from "react";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { isValidLangCode, getLanguage, LANGUAGES } from "@/lib/languages";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mic, Dices, Trophy } from "lucide-react";
import { getActiveLesson } from "@/lib/storage";
import type { LangCode } from "@/lib/languages";

export default function LearnPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  if (!isValidLangCode(lang)) {
    notFound();
  }
  const language = getLanguage(lang)!;

  const [activeLesson, setActiveLesson] = React.useState<string | null>(null);
  React.useEffect(() => {
    function refresh() {
      setActiveLesson(getActiveLesson(lang as LangCode));
    }
    refresh();
    window.addEventListener("fluentic:active-lesson-changed", refresh);
    return () => window.removeEventListener("fluentic:active-lesson-changed", refresh);
  }, [lang]);

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
            <h1 className="text-2xl font-bold">Lär dig {language.name.toLowerCase()}</h1>
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
              <Trophy className="h-4 w-4" /> Achievements
            </Button>
          </Link>
          <Link href={`/learn/${lang}/call`}>
            <Button size="sm">
              <Mic className="h-4 w-4" /> Tala med tutor
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

      <XpBoostBanner />

      {/* Dagliga hookar — Daily Challenge + Word of the day */}
      <DailyChallengeCard lang={lang} />
      <WordOfTheDay lang={lang} />

      {/* Primärt fokus: lärvägen — användaren ska se direkt att lektioner finns nedan */}
      <section aria-labelledby="path-heading" className="space-y-3">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 id="path-heading" className="text-lg font-bold text-slate-100">Lektioner — följ din lärväg</h2>
            <p className="text-xs text-slate-400">Lås upp nästa lektion genom att klara den föregående. Nivåerna går A1 → C1.</p>
          </div>
          <Link href={`/learn/${lang}/mix`}>
            <Button size="sm" variant="secondary">
              <Dices className="h-4 w-4" /> Snabblektion
            </Button>
          </Link>
        </div>
        <LessonPath lang={lang} />
      </section>

      {/* Sekundärt: fri övning utan progression */}
      <section aria-labelledby="practice-heading" className="space-y-3 pt-2">
        <div>
          <h2 id="practice-heading" className="text-lg font-bold text-slate-100">Fri övning</h2>
          <p className="text-xs text-slate-400">Träna enskilda färdigheter när du vill — påverkar inte lärvägen.</p>
        </div>
      <Tabs defaultValue="flashcards">
        <TabsList>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="conversation">Konversation</TabsTrigger>
          <TabsTrigger value="listen">Lyssna & repetera</TabsTrigger>
          <TabsTrigger value="pron">Uttalsövning</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarier</TabsTrigger>
          <TabsTrigger value="match">Match</TabsTrigger>
          <TabsTrigger value="cloze">Lucka</TabsTrigger>
          <TabsTrigger value="scramble">Ordpussel</TabsTrigger>
          <TabsTrigger value="builder">Bygg meningen</TabsTrigger>
          <TabsTrigger value="listenpick">Lyssna & välj</TabsTrigger>
        </TabsList>
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
    </motion.div>
  );
}
