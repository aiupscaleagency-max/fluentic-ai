"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { getPhrases } from "@/lib/phrases";
import { useLevel } from "@/lib/use-level";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Mic, MicOff, Volume2, ChevronRight } from "lucide-react";
import { similarityScore } from "@/lib/similarity";
import { speakAi } from "@/lib/tts";
import { addXP, markActivityDone } from "@/lib/storage";

import { getSpeechRecognitionCtor, type SRInstance } from "@/lib/speech";

export function ListenRepeat({ lang, lessonId }: { lang: LangCode; lessonId?: string }) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const phrases = React.useMemo(() => {
    const list = getPhrases(level);
    return list.length > 0 ? list : getPhrases();
  }, [level]);
  const [idx, setIdx] = React.useState(0);
  const [transcript, setTranscript] = React.useState("");
  const [score, setScore] = React.useState<number | null>(null);
  const [listening, setListening] = React.useState(false);
  const [supported, setSupported] = React.useState(true);
  const recRef = React.useRef<SRInstance | null>(null);
  // Vilka fras-index har övats med score (för auto-completion av lektion)
  const [practiced, setPracticed] = React.useState<Set<number>>(new Set());
  const reportedRef = React.useRef(false);

  React.useEffect(() => {
    setIdx(0); setTranscript(""); setScore(null);
    setPracticed(new Set());
    reportedRef.current = false;
  }, [phrases, lessonId]);

  // När alla fraser har övats minst en gång — markera listen-aktiviteten klar
  React.useEffect(() => {
    if (!lessonId || reportedRef.current) return;
    if (phrases.length > 0 && practiced.size >= phrases.length) {
      reportedRef.current = true;
      markActivityDone(lessonId, "listen", lang);
    }
  }, [practiced, phrases.length, lessonId, lang]);

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
      // Spara att den här frasen är övad — för auto-completion
      setPracticed((p) => {
        const n = new Set(p);
        n.add(idx % phrases.length);
        return n;
      });
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
    void speakAi(target, lang, { bcp47: language.bcp47 });
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
    setIdx((i) => (i + 1) % phrases.length);
    setTranscript("");
    setScore(null);
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Fras {(idx % phrases.length) + 1} av {phrases.length}</Badge>
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
