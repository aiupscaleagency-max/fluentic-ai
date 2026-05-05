"use client";

import { use } from "react";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { notFound } from "next/navigation";
import { isValidLangCode, getLanguage, type LangCode } from "@/lib/languages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, CheckCircle2, XCircle, Volume2, Trophy } from "lucide-react";
import { useLevel } from "@/lib/use-level";
import { getDailyChallenge, claimChallenge, getChallengeState, type DailyChallenge } from "@/lib/daily";
import { addXP } from "@/lib/storage";

// Mini-runner för Daily Challenge typer "translate" och "listen".
// "call" routas till /learn/[lang]/call direkt från card och claimas via spoken-time tracker.
export default function DailyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  if (!isValidLangCode(lang)) notFound();
  const language = getLanguage(lang)!;
  const router = useRouter();
  const level = useLevel(lang);
  const [challenge, setChallenge] = React.useState<DailyChallenge | null>(null);
  const [idx, setIdx] = React.useState(0);
  const [correct, setCorrect] = React.useState(0);
  const [phase, setPhase] = React.useState<"running" | "done">("running");

  React.useEffect(() => {
    const c = getDailyChallenge(lang as LangCode, level);
    setChallenge(c);
    // Om redan claimed idag — skicka tillbaka
    const s = getChallengeState(lang as LangCode);
    if (s.claimed) router.replace(`/learn/${lang}`);
  }, [lang, level, router]);

  if (!challenge || !challenge.items) return null;
  const total = challenge.items.length;
  const current = challenge.items[idx];

  function next(wasCorrect: boolean) {
    if (wasCorrect) setCorrect((c) => c + 1);
    if (idx + 1 < total) {
      setIdx(idx + 1);
    } else {
      // Markera done lokalt så card visar "Hämta belöning"
      try {
        const date = challenge!.date;
        window.localStorage.setItem(
          `fluentic.daily-progress.${lang}`,
          JSON.stringify({ date, done: true }),
        );
        window.dispatchEvent(new CustomEvent("fluentic:daily-progress"));
      } catch { /* tyst */ }
      setPhase("done");
    }
  }

  function claim() {
    claimChallenge(lang as LangCode);
    addXP(challenge!.bonusXp);
    router.push(`/learn/${lang}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <Link href={`/learn/${lang}`} className="inline-flex items-center text-sm text-slate-300 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4 mr-1" /> Tillbaka
        </Link>
        <div className="text-xs text-slate-400">{language.flag} {language.name} · {challenge.title}</div>
      </div>

      {phase === "running" ? (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Fråga {idx + 1} / {total}</span>
              <span>Rätt: {correct}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-400 to-cyan-400 transition-all"
                style={{ width: `${((idx) / total) * 100}%` }}
              />
            </div>
            <AnimatePresence mode="wait">
              {challenge.kind === "translate" ? (
                <TranslateRound
                  key={current.id}
                  prompt={current.sv}
                  expected={current.text[lang as LangCode]}
                  lang={lang as LangCode}
                  onDone={next}
                />
              ) : (
                <ListenRound
                  key={current.id}
                  expectedSv={current.sv}
                  text={current.text[lang as LangCode]}
                  lang={lang as LangCode}
                  pool={challenge.items!.map((it) => it.sv)}
                  onDone={next}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      ) : (
        <Card variant="gradient">
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 shadow-lg shadow-amber-500/40">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Bra jobbat!</h2>
            <p className="text-sm text-slate-300">
              Du klarade {correct} av {total}. Hämta din belöning.
            </p>
            <Button size="lg" onClick={claim}>
              <Trophy className="h-5 w-5" /> Claim +{challenge.bonusXp} XP
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function TranslateRound({
  prompt,
  expected,
  lang,
  onDone,
}: {
  prompt: string;
  expected: string;
  lang: LangCode;
  onDone: (correct: boolean) => void;
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
    const ok = normalize(input) === normalize(expected);
    setRight(ok);
    setSubmitted(true);
  }

  return (
    <motion.form
      onSubmit={check}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center space-y-1">
        <div className="text-xs uppercase tracking-wider text-slate-400">Översätt till {language.name}</div>
        <div className="text-2xl font-bold">{prompt}</div>
      </div>
      <input
        autoFocus
        type="text"
        className="w-full rounded-lg border border-white/15 bg-white/5 p-3 text-center text-lg"
        placeholder="Skriv översättningen"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={submitted}
        dir={language.dir}
        lang={lang}
      />
      {submitted ? (
        <div className="space-y-3 text-center">
          <div className={`text-sm flex items-center justify-center gap-1 ${right ? "text-emerald-400" : "text-red-400"}`}>
            {right ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {right ? "Rätt!" : `Rätt svar: ${expected}`}
          </div>
          <Button type="button" onClick={() => onDone(right)}>
            Nästa <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button type="submit" className="w-full" disabled={!input.trim()}>Kontrollera</Button>
      )}
    </motion.form>
  );
}

function ListenRound({
  expectedSv,
  text,
  lang,
  pool,
  onDone,
}: {
  expectedSv: string;
  text: string;
  lang: LangCode;
  pool: string[];
  onDone: (correct: boolean) => void;
}) {
  const language = getLanguage(lang)!;
  const [picked, setPicked] = React.useState<string | null>(null);
  // Shuffle 4 alternativ med rätt svar inkluderat
  const options = React.useMemo(() => {
    const wrong = pool.filter((s) => s !== expectedSv).slice(0, 3);
    const all = [expectedSv, ...wrong];
    return all
      .map((s) => ({ s, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map((o) => o.s);
  }, [expectedSv, pool]);

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language.bcp47;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
  React.useEffect(() => {
    const t = window.setTimeout(speak, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedSv]);

  function pick(s: string) {
    if (picked) return;
    setPicked(s);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center space-y-2">
        <div className="text-xs uppercase tracking-wider text-slate-400">Lyssna och välj</div>
        <Button onClick={speak} variant="secondary" size="sm">
          <Volume2 className="h-4 w-4" /> Spela igen
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {options.map((o) => {
          const isCorrect = o === expectedSv;
          const isPicked = picked === o;
          const showResult = picked != null;
          return (
            <button
              key={o}
              onClick={() => pick(o)}
              disabled={picked !== null}
              className={`rounded-lg border p-3 text-sm font-medium text-left ${
                showResult && isCorrect
                  ? "bg-emerald-500/15 border-emerald-400 text-emerald-100"
                  : showResult && isPicked && !isCorrect
                    ? "bg-red-500/15 border-red-400 text-red-100"
                    : "bg-white/5 border-white/15 hover:border-indigo-400"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked != null && (
        <div className="text-center">
          <Button onClick={() => onDone(picked === expectedSv)}>
            Nästa <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
