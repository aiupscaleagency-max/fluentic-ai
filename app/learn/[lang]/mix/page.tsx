"use client";

import { use } from "react";
import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLangCode, getLanguage } from "@/lib/languages";
import { MixSession } from "@/components/mix-session";
import { LevelPicker } from "@/components/level-picker";
import { TrackPicker } from "@/components/track-picker";
import { ArrowLeft, Dices } from "lucide-react";
import { getActiveLesson } from "@/lib/storage";
import type { LangCode } from "@/lib/languages";

export default function MixPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  if (!isValidLangCode(lang)) notFound();
  const language = getLanguage(lang)!;

  // Vi rapporterar bara framsteg till en lektion om den var aktiv när användaren startade mix
  const [activeLesson, setActiveLesson] = React.useState<string | null>(null);
  React.useEffect(() => {
    setActiveLesson(getActiveLesson(lang as LangCode));
  }, [lang]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link href={`/learn/${lang}`} className="inline-flex items-center text-sm text-slate-600 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Tillbaka
        </Link>
        <div className="flex items-center gap-2">
          <LevelPicker lang={lang} />
          <TrackPicker lang={lang} />
        </div>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          {language.flag} <Dices className="h-6 w-6" /> Snabblektion
        </h1>
        <p className="text-sm text-slate-500">
          8 turer som skiftar mellan flashcards, lucka, par-match, översättning och lyssna.
        </p>
        {activeLesson && (
          <p className="text-xs text-slate-400">Aktiv lektion: {activeLesson} — räknas mot din lärväg.</p>
        )}
      </div>

      <MixSession lang={lang} lessonId={activeLesson} />
    </div>
  );
}
