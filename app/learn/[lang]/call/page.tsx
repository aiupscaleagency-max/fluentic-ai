"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { isValidLangCode, getLanguage } from "@/lib/languages";
import { VoiceCall } from "@/components/voice-call";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Drama } from "lucide-react";
import { LevelPicker } from "@/components/level-picker";
import * as React from "react";
import { SCENARIOS } from "@/lib/scenarios";

const GREETINGS: Record<string, string> = {
  es: "¡Hola! ¿De qué te gustaría hablar hoy?",
  en: "Hi! What would you like to talk about today?",
  fr: "Salut ! De quoi aimerais-tu parler aujourd'hui ?",
  ar: "مرحبا! عن ماذا تود أن نتحدث اليوم؟",
};

export default function CallPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  if (!isValidLangCode(lang)) notFound();
  const language = getLanguage(lang)!;
  const [mode, setMode] = React.useState<"free" | "scenario">("free");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/learn/${lang}`} className="inline-flex items-center text-sm text-slate-600 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Tillbaka
        </Link>
        <LevelPicker lang={lang} />
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          {language.flag} Tala med tutor
        </h1>
        <p className="text-sm text-slate-500">Tryck på mikrofonen och börja prata på {language.name.toLowerCase()}.</p>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          variant={mode === "free" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("free")}
        >
          <MessageCircle className="h-4 w-4" /> Fri chatt
        </Button>
        <Button
          variant={mode === "scenario" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("scenario")}
        >
          <Drama className="h-4 w-4" /> Scenario
        </Button>
      </div>

      {mode === "free" ? (
        <VoiceCall
          lang={lang}
          greeting={GREETINGS[lang]}
          onEnd={() => router.push(`/learn/${lang}`)}
        />
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-sm text-slate-500">Välj ett scenario:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENARIOS.map((s) => (
                <Link key={s.id} href={`/learn/${lang}/scenario/${s.id}`} className="block">
                  <Card className="hover:border-indigo-400 cursor-pointer h-full">
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-3xl">{s.emoji}</span>
                      <div>
                        <div className="font-semibold">{s.title}</div>
                        <div className="text-xs text-slate-500">Nivå {s.level}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
