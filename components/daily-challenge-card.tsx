"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Mic, CheckCircle2, ArrowRight, Trophy } from "lucide-react";
import type { LangCode } from "@/lib/languages";
import { useLevel } from "@/lib/use-level";
import { getDailyChallenge, getChallengeState, claimChallenge, type DailyChallenge } from "@/lib/daily";
import { addXP } from "@/lib/storage";
import { cn } from "@/lib/cn";
import { getLanguage, langNameI18n } from "@/lib/languages";
import { useUiLang } from "@/lib/ui-language";
import { useT } from "@/lib/i18n";

// Visar dagens utmaning på toppen av /learn/[lang]. När klar — claim-knapp ger +50 XP.
// För "translate" och "listen" navigerar vi till en mini-runner-sida (samma struktur som mix-session).
export function DailyChallengeCard({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const t = useT();
  const uiLang = useUiLang();
  const [challenge, setChallenge] = React.useState<DailyChallenge | null>(null);
  const [state, setState] = React.useState<{ date: string; claimed: boolean }>({ date: "", claimed: false });
  const [progressing, setProgressing] = React.useState(false);

  React.useEffect(() => {
    const c = getDailyChallenge(lang, level);
    setChallenge(c);
    setState(getChallengeState(lang));
    function refresh() {
      setState(getChallengeState(lang));
    }
    window.addEventListener("fluentic:daily-claimed", refresh);
    window.addEventListener("fluentic:daily-progress", refresh);
    return () => {
      window.removeEventListener("fluentic:daily-claimed", refresh);
      window.removeEventListener("fluentic:daily-progress", refresh);
    };
  }, [lang, level]);

  const claimed = state.claimed;
  // För "translate" / "listen" — räkna progress via storage-event (sätts av daily-runner)
  const [completed, setCompleted] = React.useState(false);
  const challengeDate = challenge?.date ?? "";
  React.useEffect(() => {
    function check() {
      if (typeof window === "undefined" || !challengeDate) return;
      const raw = window.localStorage.getItem(`fluentic.daily-progress.${lang}`);
      if (!raw) return setCompleted(false);
      try {
        const p = JSON.parse(raw) as { date: string; done: boolean };
        setCompleted(p.date === challengeDate && p.done);
      } catch {
        setCompleted(false);
      }
    }
    check();
    window.addEventListener("fluentic:daily-progress", check);
    return () => window.removeEventListener("fluentic:daily-progress", check);
  }, [lang, challengeDate]);

  if (!challenge) return null;

  function claim() {
    setProgressing(true);
    claimChallenge(lang);
    addXP(challenge!.bonusXp);
    setProgressing(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Kompakt en-rads-card — tar mindre yta i toppen så lektionerna kommer närmare */}
      <Card variant="gradient" className="overflow-hidden border-amber-300/30">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-3xl shrink-0">{challenge.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-amber-200 font-extrabold">{t("daily.title")}</span>
                <Badge variant="warning" className="gap-1 text-[10px] px-1.5 py-0">
                  <Trophy className="h-3 w-3" /> +{challenge.bonusXp} XP
                </Badge>
                {claimed && (
                  <Badge variant="success" className="gap-1 text-[10px] px-1.5 py-0">
                    <CheckCircle2 className="h-3 w-3" /> {t("daily.claimed")}
                  </Badge>
                )}
              </div>
              <div className="font-bold text-base text-slate-100 truncate">{t(`daily.kind.${challenge.kind}`)}</div>
              <div className="text-xs text-slate-200 truncate">{t(`daily.desc.${challenge.kind}`)}</div>
            </div>
            {!claimed && (
              challenge.kind === "call" ? (
                <Link href={`/learn/${lang}/call`}>
                  <Button size="sm" disabled={progressing}>
                    <Mic className="h-4 w-4" /> {t("daily.startCall")}
                  </Button>
                </Link>
              ) : completed ? (
                <Button size="sm" variant="secondary" onClick={claim}>
                  <Trophy className="h-4 w-4" /> +{challenge.bonusXp}
                </Button>
              ) : (
                <Link href={`/learn/${lang}/daily`}>
                  <Button size="sm" disabled={progressing}>
                    {t("daily.startChallenge")} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )
            )}
            <span className="text-[10px] text-slate-300 hidden sm:inline shrink-0">{language.flag} {langNameI18n(lang, uiLang)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
