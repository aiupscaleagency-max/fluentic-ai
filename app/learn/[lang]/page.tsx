"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { isValidLangCode, getLanguage, LANGUAGES } from "@/lib/languages";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flashcards } from "@/components/flashcards";
import { Conversation } from "@/components/conversation";
import { ListenRepeat } from "@/components/listen-repeat";
import { MatchGame } from "@/components/games/match";
import { ClozeGame } from "@/components/games/cloze";
import { ProgressBar } from "@/components/progress-bar";
import Link from "next/link";

export default function LearnPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  if (!isValidLangCode(lang)) {
    notFound();
  }
  const language = getLanguage(lang)!;

  return (
    <div className="space-y-6">
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
        <div className="flex gap-2">
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

      <ProgressBar />

      <Tabs defaultValue="flashcards">
        <TabsList>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="conversation">Konversation</TabsTrigger>
          <TabsTrigger value="listen">Lyssna & repetera</TabsTrigger>
          <TabsTrigger value="match">Match</TabsTrigger>
          <TabsTrigger value="cloze">Lucka</TabsTrigger>
        </TabsList>
        <TabsContent value="flashcards">
          <Flashcards lang={lang} />
        </TabsContent>
        <TabsContent value="conversation">
          <Conversation lang={lang} />
        </TabsContent>
        <TabsContent value="listen">
          <ListenRepeat lang={lang} />
        </TabsContent>
        <TabsContent value="match">
          <MatchGame lang={lang} />
        </TabsContent>
        <TabsContent value="cloze">
          <ClozeGame lang={lang} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
