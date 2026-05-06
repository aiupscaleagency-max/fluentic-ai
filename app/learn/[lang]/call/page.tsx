"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { isValidLangCode, getLanguage } from "@/lib/languages";
import { VideoCall } from "@/components/video-call";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Drama } from "lucide-react";
import { LevelPicker } from "@/components/level-picker";
import { PersonaPicker } from "@/components/persona-picker";
import { usePersona } from "@/lib/personas";
import * as React from "react";
import { SCENARIOS } from "@/lib/scenarios";
import { useT } from "@/lib/i18n";

const FALLBACK_GREETINGS: Record<string, string> = {
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
  const t = useT();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const persona = usePersona(lang as import("@/lib/languages").LangCode);
  const greeting = persona?.greetings[lang as import("@/lib/languages").LangCode] ?? FALLBACK_GREETINGS[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-3">
        <Link href={`/learn/${lang}`} className="inline-flex items-center text-sm text-slate-300 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("common.back")}
        </Link>
        <div className="flex items-center gap-2">
          <PersonaPicker lang={lang as import("@/lib/languages").LangCode} />
          <LevelPicker lang={lang} />
        </div>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          {language.flag} {t("call.title")}
        </h1>
        <p className="text-sm text-slate-400">{t("call.subtitle")} ({language.name.toLowerCase()})</p>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          variant={mode === "free" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("free")}
        >
          <MessageCircle className="h-4 w-4" /> {t("call.free")}
        </Button>
        <Button
          variant={mode === "scenario" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("scenario")}
        >
          <Drama className="h-4 w-4" /> {t("call.scenario")}
        </Button>
      </div>

      {mode === "free" ? (
        // Re-mounta när persona ändras så att rätt greeting används från start
        <VideoCall
          key={persona?.id ?? "none"}
          lang={lang}
          greeting={greeting}
          onEnd={() => router.push(`/learn/${lang}`)}
        />
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-sm text-slate-400">Välj ett scenario:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENARIOS.map((s) => (
                <Link key={s.id} href={`/learn/${lang}/scenario/${s.id}`} className="block">
                  <Card variant="gradient" className="cursor-pointer h-full hover:bg-white/10 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-3xl">{s.emoji}</span>
                      <div>
                        <div className="font-semibold">{s.title}</div>
                        <div className="text-xs text-slate-400">Nivå {s.level}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
