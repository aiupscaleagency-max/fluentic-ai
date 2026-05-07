"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { getPhrases, type Phrase } from "@/lib/phrases";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { addXP, loseHeart, getHearts, refillHearts } from "@/lib/storage";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "../ui/dialog";
import { Volume2, ChevronRight, Heart, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { useLevel } from "@/lib/use-level";
import { speakAi } from "@/lib/tts";

const SESSION_LEN = 8;

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

export function ListenPickGame({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);

  // Vi använder phrases-poolen (har sv-översättning + flera språk)
  const allPhrases = React.useMemo<Phrase[]>(() => {
    const list = getPhrases(level);
    return list.length > 0 ? list : getPhrases();
  }, [level]);

  const [round, setRound] = React.useState(0);
  const session = React.useMemo<Phrase[]>(() => {
    return shuffle(allPhrases).slice(0, Math.min(SESSION_LEN, allPhrases.length));
  }, [allPhrases, round]);

  const [idx, setIdx] = React.useState(0);
  const [picked, setPicked] = React.useState<string | null>(null);
  const [score, setScore] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [hearts, setHearts] = React.useState(5);
  const [outOfHearts, setOutOfHearts] = React.useState(false);

  React.useEffect(() => {
    function refresh() { setHearts(getHearts().count); }
    refresh();
    window.addEventListener("fluentic:hearts-changed", refresh);
    return () => window.removeEventListener("fluentic:hearts-changed", refresh);
  }, []);

  React.useEffect(() => {
    setIdx(0); setPicked(null); setScore(0); setDone(false);
  }, [session]);

  const current = session[idx];

  // Bygg 4 alternativ: rätt svensk + 3 distraktorer från andra fraser
  const options = React.useMemo<string[]>(() => {
    if (!current) return [];
    const correct = current.sv;
    const others = shuffle(allPhrases.filter((p) => p.sv !== correct)).slice(0, 3).map((p) => p.sv);
    return shuffle([correct, ...others]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, allPhrases]);

  function speak() {
    if (!current) return;
    void speakAi(current.text[lang], lang, { bcp47: language.bcp47 });
  }

  // Auto-spela när ny fras visas (efter en kort delay så TTS-en hinner ladda)
  React.useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(speak, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function pick(opt: string) {
    if (picked || !current) return;
    setPicked(opt);
    if (opt === current.sv) {
      setScore((s) => s + 1);
      addXP(5);
    } else {
      const left = loseHeart();
      setHearts(left);
      if (left === 0) setOutOfHearts(true);
    }
  }

  function next() {
    if (idx + 1 >= session.length) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
    }
  }

  if (allPhrases.length === 0) {
    return <Card><CardContent className="p-6 text-sm text-slate-500">Inga fraser på den här nivån.</CardContent></Card>;
  }

  if (done) {
    return (
      <Card>
        <CardContent className="p-10 text-center space-y-4">
          <h3 className="text-xl font-semibold">Klart!</h3>
          <p className="text-slate-600 dark:text-slate-400">Du fick {score}/{session.length} rätt.</p>
          <Button onClick={() => setRound((r) => r + 1)}>
            <RotateCcw className="h-4 w-4" /> Kör en till
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge variant="secondary">{idx + 1} / {session.length}</Badge>
            <div className="flex items-center gap-2">
              <Badge>Poäng: {score}</Badge>
              <span className="inline-flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-4 w-4 ${i < hearts ? "text-red-500 fill-red-500" : "text-slate-300"}`}
                  />
                ))}
              </span>
            </div>
          </div>

          <div className="text-center space-y-3">
            <Button onClick={speak} variant="secondary" size="lg">
              <Volume2 className="h-5 w-5" /> Lyssna igen
            </Button>
            <p className="text-xs text-slate-500">Lyssna på {language.name.toLowerCase()}-frasen och välj rätt svensk översättning.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((opt) => {
              const isCorrect = opt === current.sv;
              const isPicked = picked === opt;
              const showResult = picked !== null;
              return (
                <button
                  key={opt}
                  onClick={() => pick(opt)}
                  disabled={picked !== null}
                  className={`rounded-lg border p-3 text-sm font-medium transition-colors text-left ${
                    showResult && isCorrect
                      ? "bg-emerald-100 border-emerald-400 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                      : showResult && isPicked && !isCorrect
                        ? "bg-red-100 border-red-400 text-red-900"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                  }`}
                >
                  {opt}
                  {showResult && isCorrect && (
                    <CheckCircle2 className="inline h-4 w-4 ml-1 text-emerald-600" />
                  )}
                  {showResult && isPicked && !isCorrect && (
                    <XCircle className="inline h-4 w-4 ml-1 text-red-600" />
                  )}
                </button>
              );
            })}
          </div>

          {picked && (
            <div className="text-center">
              <Button onClick={next}>
                Nästa <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={outOfHearts} onOpenChange={setOutOfHearts}>
        <DialogHeader><DialogTitle>Inga hjärtan kvar</DialogTitle></DialogHeader>
        <DialogContent>
          <p className="text-sm text-slate-500 mb-4">
            Hjärtan fylls på automatiskt — ett hjärta var 30:e minut.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOutOfHearts(false)}>Fortsätt utan hjärtan</Button>
            <Button onClick={() => { refillHearts(); setHearts(5); setOutOfHearts(false); }}>
              Återställ (debug)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
