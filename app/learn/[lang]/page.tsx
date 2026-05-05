"use client";

import { use } from "react";
import * as React from "react";
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
import { Button } from "@/components/ui/button";
import { OnboardingDialog } from "@/components/onboarding";
import Link from "next/link";
import { Mic } from "lucide-react";
import { getActiveLesson } from "@/lib/storage";
import type { LangCode } from "@/lib/languages";

export default function LearnPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  if (!isValidLangCode(lang)) {
    notFound();
  }
  const language = getLanguage(lang)!;

  // Vi spårar vilken lektion som är aktiv så att flashcards/cloze/listen vet
  // vilken lektion deras "klart"-event ska räknas till.
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
    <div className="space-y-6">
      <OnboardingDialog />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{language.flag}</div>
          <div>
            <h1 className="text-2xl font-bold">Lär dig {language.name.toLowerCase()}</h1>
            <p className="text-sm text-slate-500" dir={language.dir} lang={lang}>
              {language.native}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LevelPicker lang={lang} />
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

      <LessonPath lang={lang} />

      <Tabs defaultValue="flashcards">
        <TabsList>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="conversation">Konversation</TabsTrigger>
          <TabsTrigger value="listen">Lyssna & repetera</TabsTrigger>
          <TabsTrigger value="pron">Uttalsövning</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarier</TabsTrigger>
          <TabsTrigger value="match">Match</TabsTrigger>
          <TabsTrigger value="cloze">Lucka</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
