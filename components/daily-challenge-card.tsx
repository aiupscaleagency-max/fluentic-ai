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
import { getLanguage } from "@/lib/languages";

// Visar dagens utmaning på toppen av /learn/[lang]. När klar — claim-knapp ger +50 XP.
// För "translate" och "listen" navigerar vi till en mini-runner-sida (samma struktur som mix-session).
export function DailyChallengeCard({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
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
      <Card variant="gradient" className="overflow-hidden border-amber-300/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="text-5xl shrink-0">{challenge.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">Dagens utmaning</span>
                <Badge variant="warning" className="gap-1">
                  <Trophy className="h-3 w-3" /> +{challenge.bonusXp} XP
                </Badge>
              </div>
              <h3 className="text-lg font-bold">{challenge.title}</h3>
              <p className="text-sm text-slate-300 mt-0.5">{challenge.description}</p>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {claimed ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Klar idag
                  </Badge>
                ) : challenge.kind === "call" ? (
                  <Link href={`/learn/${lang}/call`}>
                    <Button size="sm" disabled={progressing}>
                      <Mic className="h-4 w-4" /> Starta samtal <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/learn/${lang}/daily`}>
                    <Button size="sm" disabled={progressing} className={cn(completed && "from-emerald-500 to-cyan-500")}>
                      {completed ? "Hämta belöning" : "Starta utmaning"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {!claimed && completed && challenge.kind !== "call" && (
                  <Button size="sm" variant="secondary" onClick={claim}>
                    <Trophy className="h-4 w-4" /> Claim +{challenge.bonusXp}
                  </Button>
                )}
                <span className="text-xs text-slate-400">{language.flag} {language.name}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
