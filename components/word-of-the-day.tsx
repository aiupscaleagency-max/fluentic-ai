"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Volume2, Sparkles } from "lucide-react";
import { getWordOfTheDay } from "@/lib/daily";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { useLevel } from "@/lib/use-level";
import { useT } from "@/lib/i18n";

// Visar dagens ord/fras med uttal-knapp. Pickar deterministiskt per dag.
export function WordOfTheDay({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const t = useT();
  const [entry, setEntry] = React.useState<ReturnType<typeof getWordOfTheDay>>(null);

  React.useEffect(() => {
    setEntry(getWordOfTheDay(lang, level));
  }, [lang, level]);

  if (!entry) return null;

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(entry!.word);
    u.lang = language.bcp47;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
      <Card>
        <CardContent className="p-5 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-violet-200 font-extrabold">
            <Sparkles className="h-4 w-4" /> {t("wotd.title")}
          </div>
          <div className="flex items-baseline gap-3 min-w-0 flex-1">
            <span className="text-2xl font-bold text-slate-100" dir={language.dir} lang={lang}>
              {entry.word}
            </span>
            <span className="text-sm text-slate-300 truncate">— {entry.sv}</span>
          </div>
          <Button size="sm" variant="secondary" onClick={speak}>
            <Volume2 className="h-4 w-4" /> {t("common.listen")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
