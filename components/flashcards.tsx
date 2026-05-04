"use client";

import * as React from "react";
import { getVocab, type VocabEntry } from "@/lib/vocab";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { addXP, getSrsState, updateSrsCard } from "@/lib/storage";
import { Volume2, RotateCcw } from "lucide-react";
import { useLevel } from "@/lib/use-level";

export function Flashcards({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const allVocab = React.useMemo(() => getVocab(lang, level), [lang, level]);
  // Bygg en kö där "due" kort kommer först (SRS-light)
  const [queue, setQueue] = React.useState<VocabEntry[]>([]);
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [stats, setStats] = React.useState({ knew: 0, missed: 0 });

  React.useEffect(() => {
    const srs = getSrsState(lang);
    const now = Date.now();
    const due = allVocab.filter((v) => !srs[v.id] || srs[v.id].nextDue <= now);
    const future = allVocab.filter((v) => srs[v.id] && srs[v.id].nextDue > now);
    setQueue(due.length > 0 ? due : future);
    setIdx(0);
    setFlipped(false);
    setStats({ knew: 0, missed: 0 });
  }, [lang, allVocab]);

  const current = queue[idx];
  const progress = queue.length > 0 ? ((idx) / queue.length) * 100 : 0;

  function next(knewIt: boolean) {
    if (!current) return;
    updateSrsCard(lang, current.id, knewIt);
    if (knewIt) {
      addXP(5);
      setStats((s) => ({ ...s, knew: s.knew + 1 }));
    } else {
      setStats((s) => ({ ...s, missed: s.missed + 1 }));
      // Lägg tillbaka kort som missades sist i kön så de kommer tillbaka snabbt
      setQueue((q) => [...q, current]);
    }
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  function speak() {
    if (!current || typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(current.word);
    utter.lang = language.bcp47;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function restart() {
    setIdx(0);
    setFlipped(false);
    setStats({ knew: 0, missed: 0 });
  }

  if (!current) {
    return (
      <Card>
        <CardContent className="p-10 text-center space-y-4">
          <h3 className="text-xl font-semibold">Bra jobbat!</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Du klarade {stats.knew} kort den här rundan ({stats.missed} missade).
          </p>
          <Button onClick={restart}>
            <RotateCcw className="h-4 w-4" /> Kör igen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Badge variant="secondary">{current.category}</Badge>
        <div className="flex-1">
          <Progress value={progress} />
        </div>
        <span className="text-sm text-slate-500 tabular-nums">
          {idx + 1} / {queue.length}
        </span>
      </div>

      <div
        className={`flip-card ${flipped ? "flipped" : ""} h-64 cursor-pointer`}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="flip-card-inner">
          <Card className="flip-card-front w-full h-full">
            <CardContent className="flex h-full w-full items-center justify-center text-center p-6">
              <div className="space-y-4">
                <div className="text-sm uppercase tracking-wider text-slate-400">Svenska</div>
                <div className="text-3xl font-bold">{current.sv}</div>
                <div className="text-xs text-slate-500">Tryck för att vända</div>
              </div>
            </CardContent>
          </Card>
          <Card className="flip-card-back w-full h-full">
            <CardContent className="flex h-full w-full items-center justify-center text-center p-6">
              <div className="space-y-4">
                <div className="text-sm uppercase tracking-wider text-slate-400">
                  {language.name}
                </div>
                <div
                  className="text-3xl font-bold"
                  dir={language.dir}
                  lang={lang}
                >
                  {current.word}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak();
                  }}
                >
                  <Volume2 className="h-4 w-4" /> Lyssna
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="destructive" onClick={() => next(false)}>
          Kunde inte
        </Button>
        <Button onClick={() => next(true)}>Kunde</Button>
      </div>
    </div>
  );
}
