"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { getVocab, type VocabEntry } from "@/lib/vocab";
import { getPhrases, type Phrase } from "@/lib/phrases";
import { useLevel } from "@/lib/use-level";
import { useTracks } from "@/lib/track";
import { speakAi } from "@/lib/tts";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "./ui/dialog";
import { addXP, loseHeart, getHearts, refillHearts, markActivityDone } from "@/lib/storage";
import { Volume2, ChevronRight, RotateCcw, CheckCircle2, XCircle, Heart, Sparkles } from "lucide-react";

// 8 turer per session, slumpmässiga aktivitetstyper
const TURNS = 8;

type ActivityType = "flashcard" | "cloze" | "match" | "translate" | "listen";

interface FlashcardTurn { kind: "flashcard"; entry: VocabEntry; }
interface ClozeTurn { kind: "cloze"; entry: VocabEntry; sentence: string; options: string[]; correct: string; }
interface MatchTurn { kind: "match"; pairs: { sv: string; word: string; id: string }[]; }
interface TranslateTurn { kind: "translate"; entry: VocabEntry; }
interface ListenTurn { kind: "listen"; phrase: Phrase; options: string[]; }

type Turn = FlashcardTurn | ClozeTurn | MatchTurn | TranslateTurn | ListenTurn;

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Bygg en mix av 8 turer från tillgängligt material
function buildSession(vocab: VocabEntry[], phrases: Phrase[]): Turn[] {
  const types: ActivityType[] = ["flashcard", "cloze", "match", "translate", "listen"];
  const turns: Turn[] = [];

  for (let i = 0; i < TURNS; i++) {
    // Försök få variation — sista turens typ får inte vara samma som nuvarande
    let t = pickRandom(types);
    if (i > 0 && turns[i - 1].kind === t) {
      const others = types.filter((tt) => tt !== t);
      t = pickRandom(others);
    }

    if (t === "flashcard" && vocab.length > 0) {
      turns.push({ kind: "flashcard", entry: pickRandom(vocab) });
    } else if (t === "cloze" && vocab.length >= 4) {
      const correct = pickRandom(vocab);
      const distractors = shuffle(vocab.filter((v) => v.id !== correct.id)).slice(0, 3).map((v) => v.word);
      turns.push({
        kind: "cloze",
        entry: correct,
        sentence: `___ (${correct.sv})`,
        options: shuffle([correct.word, ...distractors]),
        correct: correct.word,
      });
    } else if (t === "match" && vocab.length >= 2) {
      const picks = shuffle(vocab).slice(0, 2);
      turns.push({
        kind: "match",
        pairs: picks.map((v) => ({ id: v.id, sv: v.sv, word: v.word })),
      });
    } else if (t === "translate" && vocab.length > 0) {
      turns.push({ kind: "translate", entry: pickRandom(vocab) });
    } else if (t === "listen" && phrases.length >= 4) {
      const correct = pickRandom(phrases);
      const distractors = shuffle(phrases.filter((p) => p.sv !== correct.sv)).slice(0, 3).map((p) => p.sv);
      turns.push({
        kind: "listen",
        phrase: correct,
        options: shuffle([correct.sv, ...distractors]),
      });
    } else if (vocab.length > 0) {
      // Fallback till flashcard om vald typ inte hade nog material
      turns.push({ kind: "flashcard", entry: pickRandom(vocab) });
    }
  }
  return turns;
}

interface Props {
  lang: LangCode;
  // Om mix-sessionen kördes från en aktiv lektion: markera den klar i slutet
  lessonId?: string | null;
}

export function MixSession({ lang, lessonId }: Props) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const tracks = useTracks(lang);

  const vocab = React.useMemo(() => getVocab(lang, level, tracks), [lang, level, tracks]);
  const phrases = React.useMemo(() => getPhrases(level), [level]);

  const [round, setRound] = React.useState(0);
  const session = React.useMemo<Turn[]>(() => buildSession(vocab, phrases), [vocab, phrases, round]);
  const [idx, setIdx] = React.useState(0);
  const [correct, setCorrect] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [xpEarned, setXpEarned] = React.useState(0);
  const [hearts, setHearts] = React.useState(5);
  const [outOfHearts, setOutOfHearts] = React.useState(false);

  React.useEffect(() => {
    function refresh() { setHearts(getHearts().count); }
    refresh();
    window.addEventListener("fluentic:hearts-changed", refresh);
    return () => window.removeEventListener("fluentic:hearts-changed", refresh);
  }, []);

  React.useEffect(() => {
    setIdx(0); setCorrect(0); setDone(false); setXpEarned(0);
  }, [session]);

  // När session blir klar: markera lektionsaktivitet om vi har lessonId
  // (vi mappar mix till "flashcards"-aktiviteten — det är den naturliga "klart"-signalen)
  React.useEffect(() => {
    if (done && lessonId) {
      markActivityDone(lessonId, "flashcards", lang);
    }
  }, [done, lessonId, lang]);

  function recordResult(wasRight: boolean) {
    if (wasRight) {
      addXP(5);
      setXpEarned((x) => x + 5);
      setCorrect((c) => c + 1);
    } else {
      const left = loseHeart();
      setHearts(left);
      if (left === 0) setOutOfHearts(true);
    }
  }

  function advance() {
    if (idx + 1 >= session.length) setDone(true);
    else setIdx((i) => i + 1);
  }

  if (vocab.length < 4 || phrases.length < 4) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-500">
          Vi behöver mer material för att bygga en mix på den här nivån/tracken — testa en bredare nivå eller "Allmän"-track.
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardContent className="p-10 text-center space-y-4">
          <Sparkles className="h-10 w-10 text-indigo-500 mx-auto" />
          <h3 className="text-2xl font-bold">Klar! +{xpEarned} XP</h3>
          <p className="text-slate-600 dark:text-slate-400">{correct}/{session.length} rätt.</p>
          <Button onClick={() => setRound((r) => r + 1)}>
            <RotateCcw className="h-4 w-4" /> Kör en till
          </Button>
        </CardContent>
      </Card>
    );
  }

  const turn = session[idx];
  const progress = ((idx) / session.length) * 100;

  return (
    <>
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Badge variant="secondary">Tur {idx + 1} / {session.length}</Badge>
              <div className="flex items-center gap-2">
                <Badge>+{xpEarned} XP</Badge>
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
            <Progress value={progress} />
          </div>

          {turn.kind === "flashcard" && (
            <FlashcardTurnView
              key={`f-${idx}`}
              turn={turn}
              lang={lang}
              onResult={(r) => { recordResult(r); }}
              onNext={advance}
            />
          )}
          {turn.kind === "cloze" && (
            <ClozeTurnView
              key={`c-${idx}`}
              turn={turn}
              lang={lang}
              onResult={recordResult}
              onNext={advance}
            />
          )}
          {turn.kind === "match" && (
            <MatchTurnView
              key={`m-${idx}`}
              turn={turn}
              lang={lang}
              onResult={recordResult}
              onNext={advance}
            />
          )}
          {turn.kind === "translate" && (
            <TranslateTurnView
              key={`t-${idx}`}
              turn={turn}
              lang={lang}
              onResult={recordResult}
              onNext={advance}
            />
          )}
          {turn.kind === "listen" && (
            <ListenTurnView
              key={`l-${idx}`}
              turn={turn}
              lang={lang}
              langBcp47={language.bcp47}
              onResult={recordResult}
              onNext={advance}
            />
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

// ===== Subkomponenter per aktivitetstyp =====

function FlashcardTurnView({
  turn,
  lang,
  onResult,
  onNext,
}: {
  turn: FlashcardTurn;
  lang: LangCode;
  onResult: (right: boolean) => void;
  onNext: () => void;
}) {
  const language = getLanguage(lang)!;
  const [revealed, setRevealed] = React.useState(false);
  const [answered, setAnswered] = React.useState(false);

  function speak() {
    void speakAi(turn.entry.word, lang, { bcp47: language.bcp47 });
  }

  return (
    <div className="space-y-4">
      <div className="text-xs uppercase text-slate-500 text-center">Flashcard</div>
      <div className="text-center space-y-2 py-4">
        <div className="text-sm text-slate-500">Svenska</div>
        <div className="text-3xl font-bold">{turn.entry.sv}</div>
        {revealed && (
          <div className="space-y-1 mt-3">
            <div className="text-sm text-slate-500">{language.name}</div>
            <div className="text-2xl font-bold" dir={language.dir} lang={lang}>{turn.entry.word}</div>
            <Button size="sm" variant="ghost" onClick={speak}>
              <Volume2 className="h-4 w-4" /> Lyssna
            </Button>
          </div>
        )}
      </div>
      {!revealed ? (
        <Button className="w-full" onClick={() => setRevealed(true)}>Visa översättning</Button>
      ) : !answered ? (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="destructive" onClick={() => { setAnswered(true); onResult(false); }}>Kunde inte</Button>
          <Button onClick={() => { setAnswered(true); onResult(true); }}>Kunde</Button>
        </div>
      ) : (
        <div className="text-center">
          <Button onClick={onNext}>Nästa <ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

function ClozeTurnView({
  turn,
  lang,
  onResult,
  onNext,
}: {
  turn: ClozeTurn;
  lang: LangCode;
  onResult: (r: boolean) => void;
  onNext: () => void;
}) {
  const language = getLanguage(lang)!;
  const [picked, setPicked] = React.useState<string | null>(null);

  function pick(o: string) {
    if (picked) return;
    setPicked(o);
    onResult(o === turn.correct);
  }

  return (
    <div className="space-y-4">
      <div className="text-xs uppercase text-slate-500 text-center">Fyll i ordet</div>
      <div className="text-center text-sm text-slate-500">Översätt: <span className="font-semibold text-slate-700 dark:text-slate-200">{turn.entry.sv}</span></div>
      <div className="grid grid-cols-2 gap-2">
        {turn.options.map((opt) => {
          const isCorrect = opt === turn.correct;
          const isPicked = picked === opt;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={picked !== null}
              dir={language.dir}
              lang={lang}
              className={`rounded-lg border p-3 text-sm font-medium ${
                picked && isCorrect
                  ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                  : picked && isPicked && !isCorrect
                    ? "bg-red-100 border-red-400 text-red-900"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="text-center">
          <Button onClick={onNext}>Nästa <ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

function MatchTurnView({
  turn,
  lang,
  onResult,
  onNext,
}: {
  turn: MatchTurn;
  lang: LangCode;
  onResult: (r: boolean) => void;
  onNext: () => void;
}) {
  const language = getLanguage(lang)!;
  type Side = "sv" | "tgt";
  type Tile = { id: string; pairId: string; label: string; side: Side };
  const tiles = React.useMemo<Tile[]>(() => {
    const t: Tile[] = [];
    turn.pairs.forEach((p) => {
      t.push({ id: `${p.id}-sv`, pairId: p.id, label: p.sv, side: "sv" });
      t.push({ id: `${p.id}-tgt`, pairId: p.id, label: p.word, side: "tgt" });
    });
    return shuffle(t);
  }, [turn]);
  const [matched, setMatched] = React.useState<Set<string>>(new Set());
  const [selected, setSelected] = React.useState<Tile | null>(null);
  const [wrong, setWrong] = React.useState<Set<string>>(new Set());
  const [missed, setMissed] = React.useState(false);

  function pick(t: Tile) {
    if (matched.has(t.id) || wrong.size > 0) return;
    if (!selected) { setSelected(t); return; }
    if (selected.id === t.id) return;
    if (selected.pairId === t.pairId && selected.side !== t.side) {
      const n = new Set(matched); n.add(t.id); n.add(selected.id);
      setMatched(n);
      setSelected(null);
      if (n.size === tiles.length) {
        // Klar med alla par i denna mini-match
        onResult(!missed);
      }
    } else {
      setMissed(true);
      const w = new Set([selected.id, t.id]);
      setWrong(w);
      setTimeout(() => { setWrong(new Set()); setSelected(null); }, 600);
    }
  }

  const allDone = matched.size === tiles.length;

  return (
    <div className="space-y-4">
      <div className="text-xs uppercase text-slate-500 text-center">Para ihop</div>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((t) => {
          const m = matched.has(t.id);
          const w = wrong.has(t.id);
          const s = selected?.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => pick(t)}
              disabled={m}
              dir={t.side === "tgt" ? language.dir : "ltr"}
              lang={t.side === "tgt" ? lang : "sv"}
              className={`min-h-14 rounded-lg p-2 text-sm font-medium border ${
                m ? "bg-emerald-100 border-emerald-300 text-emerald-800 opacity-60"
                  : w ? "bg-red-100 border-red-300 text-red-800"
                  : s ? "bg-indigo-100 border-indigo-400"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {allDone && (
        <div className="text-center">
          <Button onClick={onNext}>Nästa <ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

function TranslateTurnView({
  turn,
  lang,
  onResult,
  onNext,
}: {
  turn: TranslateTurn;
  lang: LangCode;
  onResult: (r: boolean) => void;
  onNext: () => void;
}) {
  const language = getLanguage(lang)!;
  const [input, setInput] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [right, setRight] = React.useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, "");
  }

  function check(e?: React.FormEvent) {
    e?.preventDefault();
    if (submitted) return;
    const ok = normalize(input) === normalize(turn.entry.word);
    setRight(ok);
    setSubmitted(true);
    onResult(ok);
  }

  return (
    <form onSubmit={check} className="space-y-4">
      <div className="text-xs uppercase text-slate-500 text-center">Översätt till {language.name}</div>
      <div className="text-center text-2xl font-bold">{turn.entry.sv}</div>
      <input
        autoFocus
        type="text"
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-center text-lg"
        placeholder="Skriv översättningen"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={submitted}
        dir={language.dir}
        lang={lang}
      />
      {submitted ? (
        <div className="space-y-3 text-center">
          <div className={`text-sm flex items-center justify-center gap-1 ${right ? "text-emerald-600" : "text-red-600"}`}>
            {right ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {right ? "Rätt!" : `Rätt svar: ${turn.entry.word}`}
          </div>
          <Button type="button" onClick={onNext}>Nästa <ChevronRight className="h-4 w-4" /></Button>
        </div>
      ) : (
        <Button type="submit" className="w-full" disabled={!input.trim()}>Kontrollera</Button>
      )}
    </form>
  );
}

function ListenTurnView({
  turn,
  lang,
  langBcp47,
  onResult,
  onNext,
}: {
  turn: ListenTurn;
  lang: LangCode;
  langBcp47: string;
  onResult: (r: boolean) => void;
  onNext: () => void;
}) {
  const [picked, setPicked] = React.useState<string | null>(null);

  function speak() {
    void speakAi(turn.phrase.text[lang], lang, { bcp47: langBcp47 });
  }

  React.useEffect(() => {
    const t = window.setTimeout(speak, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

  function pick(o: string) {
    if (picked) return;
    setPicked(o);
    onResult(o === turn.phrase.sv);
  }

  return (
    <div className="space-y-4">
      <div className="text-xs uppercase text-slate-500 text-center">Lyssna & välj</div>
      <div className="text-center">
        <Button onClick={speak} variant="secondary"><Volume2 className="h-4 w-4" /> Spela igen</Button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {turn.options.map((opt) => {
          const isCorrect = opt === turn.phrase.sv;
          const isPicked = picked === opt;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={picked !== null}
              className={`rounded-lg border p-3 text-sm font-medium text-left ${
                picked && isCorrect
                  ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                  : picked && isPicked && !isCorrect
                    ? "bg-red-100 border-red-400 text-red-900"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="text-center">
          <Button onClick={onNext}>Nästa <ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
