"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { getVocab, type VocabEntry } from "@/lib/vocab";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { addXP, loseHeart, getHearts, refillHearts } from "@/lib/storage";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "../ui/dialog";
import { RotateCcw, ChevronRight, Heart, Volume2 } from "lucide-react";
import { useLevel } from "@/lib/use-level";
import { useTracks } from "@/lib/track";

// Vi väljer 8 ord per session vars måltext har 3-12 tecken (annars blir det jobbigt med tiles)
const SESSION_LEN = 8;

interface Letter {
  id: number;       // unik per render så React-keys är stabila
  ch: string;
}

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

// Bygger letter-pool med skarpa ID:n så vi kan plocka och flytta utan att React tappar tråden
function buildLetters(word: string): Letter[] {
  const letters: Letter[] = word.split("").map((ch, i) => ({ id: i, ch }));
  let scrambled = shuffle(letters);
  // Säkerställ att start-ordningen INTE är samma som rätt svar (för korta ord ofta hänt)
  if (word.length > 1 && scrambled.map((l) => l.ch).join("") === word) {
    scrambled = [scrambled[scrambled.length - 1], ...scrambled.slice(0, -1)];
  }
  return scrambled;
}

export function ScrambleGame({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const tracks = useTracks(lang);

  // Plocka pool — filtrera bort fraser med whitespace eller orimliga längder
  const pool = React.useMemo<VocabEntry[]>(() => {
    const all = getVocab(lang, level, tracks).filter((v) => {
      const w = v.word.trim();
      return w.length >= 3 && w.length <= 12 && !/\s/.test(w);
    });
    return shuffle(all).slice(0, SESSION_LEN);
  }, [lang, level, tracks]);

  const [round, setRound] = React.useState(0);
  const [idx, setIdx] = React.useState(0);
  const [correct, setCorrect] = React.useState(0);
  const [picked, setPicked] = React.useState<Letter[]>([]);
  const [bank, setBank] = React.useState<Letter[]>([]);
  const [shake, setShake] = React.useState(false);
  const [pulse, setPulse] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [hearts, setHearts] = React.useState(5);
  const [outOfHearts, setOutOfHearts] = React.useState(false);

  React.useEffect(() => {
    function refresh() { setHearts(getHearts().count); }
    refresh();
    window.addEventListener("fluentic:hearts-changed", refresh);
    return () => window.removeEventListener("fluentic:hearts-changed", refresh);
  }, []);

  // Reset session när pool/round byts
  React.useEffect(() => {
    setIdx(0);
    setCorrect(0);
    setDone(false);
    setPicked([]);
    if (pool.length > 0) setBank(buildLetters(pool[0].word));
  }, [pool, round]);

  const current = pool[idx];

  // När idx ändras inom samma session: ladda nästa ord
  React.useEffect(() => {
    if (!current) return;
    setPicked([]);
    setBank(buildLetters(current.word));
    setShake(false);
    setPulse(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language.bcp47;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handlePick(letter: Letter) {
    if (!current || done) return;
    const target = current.word;
    const nextPicked = [...picked, letter];
    const expected = target.slice(0, nextPicked.length);
    const actual = nextPicked.map((l) => l.ch).join("");

    if (actual === expected) {
      // Rätt så långt
      setPicked(nextPicked);
      setBank((b) => b.filter((l) => l.id !== letter.id));
      if (actual === target) {
        // Helt klart med ordet
        setPulse(true);
        addXP(5);
        setCorrect((c) => c + 1);
        window.setTimeout(() => {
          setPulse(false);
          if (idx + 1 >= pool.length) {
            setDone(true);
          } else {
            setIdx((i) => i + 1);
          }
        }, 500);
      }
    } else {
      // Fel — wiggle och förlora hjärta. Vi nollar inte picked, bara skakar input.
      setShake(true);
      const left = loseHeart();
      setHearts(left);
      if (left === 0) setOutOfHearts(true);
      window.setTimeout(() => setShake(false), 400);
    }
  }

  function reset() {
    setPicked([]);
    if (current) setBank(buildLetters(current.word));
  }

  if (pool.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-500">
          Inga ord matchar nivå + track just nu. Byt nivå eller track.
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardContent className="p-10 text-center space-y-4">
          <h3 className="text-xl font-semibold">Klart!</h3>
          <p className="text-slate-600 dark:text-slate-400">Du klarade {correct}/{pool.length} ord.</p>
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
            <Badge variant="secondary">{idx + 1} / {pool.length}</Badge>
            <div className="flex items-center gap-2">
              <Badge>Rätt: {correct}</Badge>
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

          <div className="text-center space-y-1">
            <div className="text-xs uppercase text-slate-500">Översätt till {language.name}</div>
            <div className="text-2xl font-bold">{current.sv}</div>
          </div>

          {/* Spelarens nuvarande gissning */}
          <div
            className={`min-h-14 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1 p-2 transition-all ${
              shake ? "animate-shake border-red-400" : ""
            } ${pulse ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" : ""}`}
            dir={language.dir}
            lang={lang}
          >
            {picked.length === 0 ? (
              <span className="text-xs text-slate-400">Klicka bokstäverna i rätt ordning</span>
            ) : (
              picked.map((l) => (
                <span
                  key={l.id}
                  className="rounded-md bg-indigo-600 text-white px-3 py-2 text-lg font-semibold"
                >
                  {l.ch}
                </span>
              ))
            )}
          </div>

          {/* Bank med kvarvarande bokstäver */}
          <div className="flex flex-wrap items-center justify-center gap-2" dir={language.dir} lang={lang}>
            {bank.map((l) => (
              <button
                key={l.id}
                onClick={() => handlePick(l)}
                className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-lg font-semibold hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {l.ch}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Rensa
            </Button>
            <Button variant="ghost" size="sm" onClick={() => speak(current.word)}>
              <Volume2 className="h-4 w-4" /> Lyssna
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (idx + 1 >= pool.length) setDone(true);
                else setIdx((i) => i + 1);
              }}
            >
              Hoppa över <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
