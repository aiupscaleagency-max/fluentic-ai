"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { getPhrases, type Phrase } from "@/lib/phrases";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Mic, MicOff, Volume2, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { similarityScore } from "@/lib/similarity";
import { addXP } from "@/lib/storage";
import { useLevel } from "@/lib/use-level";
import { useTrack } from "@/lib/track";
import { useExplainLang } from "@/lib/explain-lang";

import { getSpeechRecognitionCtor, type SRInstance } from "@/lib/speech";

interface AiFeedback {
  score: number;
  tips: string[];
  commonMistakes: string;
}

// Token-nivå-diff: enkel ord-för-ord-jämförelse
function diffTokens(target: string, recognized: string): { token: string; match: boolean }[] {
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, "").trim();
  const recTokens = norm(recognized).split(/\s+/).filter(Boolean);
  return target.split(/\s+/).map((tok) => ({
    token: tok,
    match: recTokens.includes(norm(tok)),
  }));
}

export function Pronunciation({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const track = useTrack(lang);
  const explainLang = useExplainLang(lang);
  const phrases = React.useMemo<Phrase[]>(() => {
    const list = getPhrases(level);
    return list.length >= 4 ? list : getPhrases(); // fallback om mappad nivå har för få
  }, [level]);

  const [idx, setIdx] = React.useState(0);
  const [transcript, setTranscript] = React.useState("");
  const [score, setScore] = React.useState<number | null>(null);
  const [listening, setListening] = React.useState(false);
  const [supported, setSupported] = React.useState(true);
  const [feedback, setFeedback] = React.useState<AiFeedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const recRef = React.useRef<SRInstance | null>(null);

  const phrase = phrases[idx % phrases.length];
  const target = phrase.text[lang];

  React.useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = language.bcp47;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      const text = last[0].transcript;
      setTranscript(text);
      const s = similarityScore(target, text);
      setScore(s);
      if (s >= 70) addXP(5);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => {
      try { rec.stop(); } catch {/* tyst */}
    };
  }, [lang, language.bcp47, target]);

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(target);
    utter.lang = language.bcp47;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function toggleMic() {
    if (!recRef.current) return;
    if (listening) {
      recRef.current.stop();
      setListening(false);
    } else {
      setTranscript("");
      setScore(null);
      setFeedback(null);
      setError(null);
      try { recRef.current.start(); setListening(true); } catch { setListening(false); }
    }
  }

  function nextPhrase() {
    setIdx((i) => (i + 1) % phrases.length);
    setTranscript("");
    setScore(null);
    setFeedback(null);
    setError(null);
  }

  async function loadFeedback() {
    if (!transcript) return;
    setFeedbackLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, recognized: transcript, language: lang, level, track, explainLang }),
      });
      const data = (await res.json()) as AiFeedback & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Fel");
      setFeedback({ score: data.score, tips: data.tips ?? [], commonMistakes: data.commonMistakes ?? "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setFeedbackLoading(false);
    }
  }

  const tokens = transcript ? diffTokens(target, transcript) : [];

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Fras {(idx % phrases.length) + 1} av {phrases.length}</Badge>
          <Badge variant="outline">Nivå {phrase.level}</Badge>
        </div>

        <div className="text-center space-y-2 py-4">
          <div className="text-sm text-slate-500">{phrase.sv}</div>
          <div className="text-2xl font-semibold" dir={language.dir} lang={lang}>
            {target}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={speak} variant="secondary">
            <Volume2 className="h-4 w-4" /> Lyssna
          </Button>
          <Button onClick={toggleMic} disabled={!supported}>
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? "Stopp" : "Spela in"}
          </Button>
          <Button onClick={nextPhrase} variant="ghost">
            Nästa fras <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {!supported && (
          <p className="text-xs text-amber-600 text-center">
            Din webbläsare stöder inte talinspelning. Testa Chrome eller Safari.
          </p>
        )}

        {transcript && (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
                <div className="text-xs uppercase text-slate-500 mb-1">Mål</div>
                <div dir={language.dir} lang={lang}>
                  {tokens.map((t, i) => (
                    <span key={i} className={t.match ? "diff-match" : "diff-mismatch"}>
                      {t.token}
                      {i < tokens.length - 1 ? " " : ""}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
                <div className="text-xs uppercase text-slate-500 mb-1">Du sa</div>
                <div dir={language.dir} lang={lang} className="font-medium">
                  {transcript}
                </div>
              </div>
            </div>

            {score !== null && (
              <div className="flex items-center gap-2 justify-center">
                <Badge variant={score >= 80 ? "success" : score >= 50 ? "warning" : "outline"}>
                  Likhet: {score}%
                </Badge>
                <Button size="sm" variant="outline" onClick={loadFeedback} disabled={feedbackLoading}>
                  {feedbackLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Hämtar tips…</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> AI-tips</>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-2 text-center">
                {error}
              </div>
            )}

            {feedback && (
              <div className="rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/30 p-3 space-y-2">
                <div className="font-semibold text-sm">AI-bedömning: {feedback.score}/100</div>
                {feedback.tips.length > 0 && (
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {feedback.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                )}
                {feedback.commonMistakes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    {feedback.commonMistakes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
