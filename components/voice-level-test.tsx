"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Mic, MicOff, Loader2, Check, ArrowRight, SkipForward } from "lucide-react";
import { getLanguage, type LangCode } from "@/lib/languages";
import { setLevel, type CefrLevel, CEFR_LEVELS } from "@/lib/level";
import { getSpeechRecognitionCtor, type SRInstance } from "@/lib/speech";
import { cn } from "@/lib/cn";

// Praktika-style: 2 frågor, användaren svarar på målspråket, Gemini bedömer CEFR.
// Faller tillbaka till manuellt val om mikrofon inte stöds eller användaren skippar.
const PROMPTS_BY_LANG: Record<LangCode, string[]> = {
  es: [
    "Cuéntame algo sobre ti — ¿de dónde eres y a qué te dedicas?",
    "Describe lo que hiciste ayer en unas pocas frases.",
  ],
  en: [
    "Tell me about yourself — where are you from and what do you do?",
    "Describe what you did yesterday in a few sentences.",
  ],
  fr: [
    "Parle-moi un peu de toi — d'où viens-tu et que fais-tu ?",
    "Décris ce que tu as fait hier en quelques phrases.",
  ],
  ar: [
    "احكيلي شوية عن حالك — من وين انت وشو شغلك؟",
    "احكيلي بكم جملة شو سويت مبارح.",
  ],
};

interface Props {
  lang: LangCode;
  onDone: (level: CefrLevel) => void;
  onSkip: () => void;
}

export function VoiceLevelTest({ lang, onDone, onSkip }: Props) {
  const language = getLanguage(lang)!;
  const prompts = PROMPTS_BY_LANG[lang];

  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<string[]>([]);
  const [supported, setSupported] = React.useState(true);
  const [state, setState] = React.useState<"idle" | "listening" | "evaluating" | "done">("idle");
  const [interim, setInterim] = React.useState("");
  const [result, setResult] = React.useState<{ level: CefrLevel; reasoning: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const recRef = React.useRef<SRInstance | null>(null);

  React.useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = language.bcp47;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let final = "";
      let inter = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else inter += r[0].transcript;
      }
      if (inter) setInterim(inter);
      if (final) {
        setInterim("");
        handleAnswer(final.trim());
      }
    };
    rec.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setError(`Mikrofonfel: ${e.error}`);
      }
      setState("idle");
    };
    recRef.current = rec;
    return () => {
      try { rec.abort?.(); } catch { /* tyst */ }
    };
  }, [lang, language.bcp47]);

  function start() {
    if (!recRef.current) return;
    setError(null);
    try {
      recRef.current.start();
      setState("listening");
    } catch { /* already started */ }
  }

  function stop() {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch { /* tyst */ }
    setState("idle");
  }

  function handleAnswer(text: string) {
    setState("idle");
    const next = [...answers, text];
    setAnswers(next);
    if (step + 1 < prompts.length) {
      setStep(step + 1);
    } else {
      evaluate(next);
    }
  }

  async function evaluate(utterances: string[]) {
    setState("evaluating");
    try {
      const res = await fetch("/api/level-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, utterances }),
      });
      const data = (await res.json()) as { level?: string; reasoning?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Bedömning misslyckades");
      const level = (CEFR_LEVELS as readonly string[]).includes(data.level ?? "")
        ? (data.level as CefrLevel)
        : "A1";
      setResult({ level, reasoning: data.reasoning ?? "" });
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState("idle");
    }
  }

  function confirm() {
    if (!result) return;
    setLevel(lang, result.level);
    onDone(result.level);
  }

  // Manuell fallback om mic inte stöds eller användaren skippar mic
  function pickManual(level: CefrLevel) {
    setLevel(lang, level);
    onDone(level);
  }

  if (!supported) {
    return (
      <div className="space-y-5 px-4">
        <div className="text-center space-y-2">
          <div className="text-3xl">{language.flag}</div>
          <h2 className="text-2xl font-bold">Vilken nivå ligger du på i {language.name.toLowerCase()}?</h2>
          <p className="text-sm text-slate-300">
            Mikrofonen funkar inte i den här webbläsaren. Välj nivå manuellt.
          </p>
        </div>
        <div className="grid gap-2">
          {CEFR_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => pickManual(lvl)}
              className="text-left rounded-xl glass border-white/10 p-3 hover:border-white/30 transition-colors"
            >
              <div className="font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-9 items-center justify-center rounded-md bg-indigo-600 text-white text-xs font-bold">{lvl}</span>
                {lvl === "A1" ? "Nybörjare" : lvl === "A2" ? "Grundläggande" : lvl === "B1" ? "Mellannivå" : lvl === "B2" ? "Övre mellan" : "Avancerad"}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state === "done" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 px-4 text-center"
      >
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-2xl shadow-emerald-500/40">
          <Check className="h-10 w-10 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Du verkar ligga på {result.level}</h2>
          {result.reasoning && (
            <p className="text-sm text-slate-300 max-w-md mx-auto">{result.reasoning}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button onClick={confirm} size="lg">
            Stämmer — sätt {result.level} <ArrowRight className="h-5 w-5" />
          </Button>
          <Button variant="ghost" onClick={() => { setStep(0); setAnswers([]); setResult(null); }}>
            Försök igen
          </Button>
        </div>
        <details className="text-xs text-slate-400 max-w-md mx-auto pt-2">
          <summary className="cursor-pointer hover:text-slate-200">Välj annan nivå manuellt</summary>
          <div className="grid grid-cols-5 gap-1 mt-2">
            {CEFR_LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => pickManual(lvl)}
                className={cn(
                  "rounded-md py-1.5 text-xs font-bold border",
                  lvl === result.level
                    ? "border-violet-400 bg-violet-500/20"
                    : "border-white/15 bg-white/5 hover:bg-white/10"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
        </details>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      <div className="text-center space-y-2">
        <div className="text-3xl">{language.flag}</div>
        <h2 className="text-2xl sm:text-3xl font-bold">Snabb nivå-test</h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Svara på {prompts.length} frågor på {language.name.toLowerCase()}. Vi bedömer din CEFR-nivå automatiskt.
        </p>
        <div className="text-xs text-slate-400">Fråga {Math.min(step + 1, prompts.length)} av {prompts.length}</div>
      </div>

      <div className="rounded-2xl glass border-white/10 p-5 space-y-3">
        <div className="text-xs uppercase tracking-wide text-slate-400">Säg på {language.name.toLowerCase()}</div>
        <div className="text-lg font-medium" dir={language.dir} lang={lang}>
          {prompts[step]}
        </div>
        {interim && (
          <div className="text-sm text-slate-400 italic" dir={language.dir} lang={lang}>
            {interim}…
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-300 bg-red-500/15 border border-red-500/30 rounded-md p-2 text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        {state === "evaluating" ? (
          <Button disabled size="lg">
            <Loader2 className="h-5 w-5 animate-spin" /> Bedömer…
          </Button>
        ) : state === "listening" ? (
          <Button onClick={stop} variant="secondary" size="lg" className="px-8">
            <MicOff className="h-5 w-5" /> Stoppa
          </Button>
        ) : (
          <Button onClick={start} size="lg" className="px-8">
            <Mic className="h-5 w-5" /> Tryck och tala
          </Button>
        )}
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
        >
          <SkipForward className="h-3 w-3" /> Hoppa över — jag väljer nivå själv
        </button>
      </div>
    </div>
  );
}
