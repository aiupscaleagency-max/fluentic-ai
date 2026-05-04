"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { PHRASES } from "@/lib/phrases";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Mic, MicOff, Volume2, ChevronRight } from "lucide-react";
import { similarityScore } from "@/lib/similarity";
import { addXP } from "@/lib/storage";

// Web Speech API har inga riktiga TS-typer i lib.dom — vi deklarerar minimalt vi behöver
type SRResult = {
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
  resultIndex: number;
};
type SRInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SRResult) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SRConstructor = new () => SRInstance;

declare global {
  interface Window {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  }
}

export function ListenRepeat({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const [idx, setIdx] = React.useState(0);
  const [transcript, setTranscript] = React.useState("");
  const [score, setScore] = React.useState<number | null>(null);
  const [listening, setListening] = React.useState(false);
  const [supported, setSupported] = React.useState(true);
  const recRef = React.useRef<SRInstance | null>(null);

  const phrase = PHRASES[idx];
  const target = phrase.text[lang];

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
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
      try {
        rec.stop();
      } catch {
        // Tyst — vissa browsers slänger om recognizer inte är aktiv
      }
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
      try {
        recRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }

  function nextPhrase() {
    setIdx((i) => (i + 1) % PHRASES.length);
    setTranscript("");
    setScore(null);
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Fras {idx + 1} av {PHRASES.length}</Badge>
          <Button variant="ghost" size="sm" onClick={nextPhrase}>
            Nästa <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center space-y-2 py-4">
          <div className="text-sm text-slate-500">{phrase.sv}</div>
          <div
            className="text-2xl font-semibold"
            dir={language.dir}
            lang={lang}
          >
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
        </div>

        {!supported && (
          <p className="text-xs text-amber-600 text-center">
            Din webbläsare stöder inte talinspelning. Testa Chrome eller Safari.
          </p>
        )}

        {transcript && (
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-4 space-y-2">
            <div className="text-xs uppercase text-slate-500">Du sa</div>
            <div dir={language.dir} lang={lang} className="font-medium">
              {transcript}
            </div>
            {score !== null && (
              <div className="flex items-center gap-2">
                <Badge variant={score >= 80 ? "success" : score >= 50 ? "warning" : "outline"}>
                  Likhet: {score}%
                </Badge>
                <span className="text-xs text-slate-500">
                  {score >= 80
                    ? "Riktigt bra!"
                    : score >= 50
                      ? "Inte illa — försök igen!"
                      : "Försök igen, du fixar det!"}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
