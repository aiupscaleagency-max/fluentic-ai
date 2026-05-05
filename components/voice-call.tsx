"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Mic, MicOff, PhoneOff, Settings, Loader2 } from "lucide-react";
import { useLevel } from "@/lib/use-level";
import { useTracks } from "@/lib/track";
import { useExplainLang } from "@/lib/explain-lang";
import { addXP } from "@/lib/storage";

import { getSpeechRecognitionCtor, type SRInstance } from "@/lib/speech";

type Msg = { role: "user" | "assistant"; content: string };
type State = "idle" | "listening" | "thinking" | "speaking";

interface Props {
  lang: LangCode;
  systemOverride?: string;       // För scenarier
  greeting?: string;             // Första AI-meddelandet (på målspråket)
  onEnd?: (history: Msg[]) => void;
  endLabel?: string;
}

export function VoiceCall({ lang, systemOverride, greeting, onEnd, endLabel = "Avsluta samtal" }: Props) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const tracks = useTracks(lang);
  const explainLang = useExplainLang(lang);
  const [state, setState] = React.useState<State>("idle");
  const [history, setHistory] = React.useState<Msg[]>([]);
  const [supported, setSupported] = React.useState(true);
  const [autoRestart, setAutoRestart] = React.useState(true);
  const [rate, setRate] = React.useState(1.0);
  const [voiceURI, setVoiceURI] = React.useState<string>("");
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const recRef = React.useRef<SRInstance | null>(null);
  const stoppedRef = React.useRef(false);
  // Vi håller historiken i en ref för att undvika race med async fetch + restart
  const historyRef = React.useRef<Msg[]>([]);

  React.useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Initiera SR
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
      const text = last[0].transcript.trim();
      if (text) handleUserTurn(text);
    };
    rec.onerror = (e) => {
      // "no-speech" och "aborted" är inte värda att skrika om
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setError(`Mikrofonfel: ${e.error}`);
      }
      setState("idle");
    };
    rec.onend = () => {
      // Hanteras av startListening / handleUserTurn
    };
    recRef.current = rec;
    return () => {
      try { rec.abort?.(); } catch {/* tyst */}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Ladda röster
  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    function load() {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      // Försök hitta en bra röst för språket om ingen vald
      if (!voiceURI) {
        const match = list.find((v) => v.lang.toLowerCase().startsWith(lang)) ?? list.find((v) => v.lang.toLowerCase().startsWith(language.bcp47.slice(0, 2)));
        if (match) setVoiceURI(match.voiceURI);
      }
    }
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Spela greeting när komponenten mountar
  const greetedRef = React.useRef(false);
  React.useEffect(() => {
    if (greetedRef.current || !greeting) return;
    greetedRef.current = true;
    setHistory([{ role: "assistant", content: greeting }]);
    speak(greeting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greeting]);

  function startListening() {
    if (!recRef.current || stoppedRef.current) return;
    setError(null);
    try {
      recRef.current.start();
      setState("listening");
    } catch {
      // Ignorera "already started"
    }
  }

  function stopListening() {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch {/* tyst */}
    setState("idle");
  }

  async function handleUserTurn(text: string) {
    setState("thinking");
    const next: Msg[] = [...historyRef.current, { role: "user", content: text }];
    setHistory(next);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          messages: next,
          level,
          track: tracks,
          voice: true,
          systemOverride,
          explainLang,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error ?? "AI-fel");
      const reply = data.reply;
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
      addXP(2);
      speak(reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState("idle");
    }
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setState("idle");
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language.bcp47;
    utter.rate = rate;
    if (voiceURI) {
      const v = voices.find((vv) => vv.voiceURI === voiceURI);
      if (v) utter.voice = v;
    }
    utter.onstart = () => setState("speaking");
    utter.onend = () => {
      setState("idle");
      if (autoRestart && !stoppedRef.current) {
        setTimeout(startListening, 200);
      }
    };
    utter.onerror = () => setState("idle");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function endCall() {
    stoppedRef.current = true;
    if (recRef.current) {
      try { recRef.current.abort?.(); } catch {/* tyst */}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState("idle");
    onEnd?.(historyRef.current);
  }

  // Visa de senaste 4 turerna
  const tail = history.slice(-4);

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{language.flag}</span>
            <div>
              <div className="font-semibold">Röstsamtal</div>
              <div className="text-xs text-slate-500">{language.native} · CEFR {level ?? "A2"}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings((s) => !s)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {showSettings && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Tal-hastighet</span>
              <div className="flex gap-1">
                {[0.8, 1.0, 1.2].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={`rounded px-2 py-1 text-xs border ${rate === r ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-300 dark:border-slate-700"}`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Auto-starta lyssning</span>
              <button
                onClick={() => setAutoRestart((a) => !a)}
                className={`rounded-full px-3 py-1 text-xs ${autoRestart ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-700"}`}
              >
                {autoRestart ? "På" : "Av"}
              </button>
            </div>
            {voices.length > 0 && (
              <div className="flex items-center justify-between gap-2">
                <span>Röst</span>
                <select
                  value={voiceURI}
                  onChange={(e) => setVoiceURI(e.target.value)}
                  className="text-xs rounded border border-slate-300 dark:border-slate-700 bg-transparent p-1 max-w-[60%]"
                >
                  {voices
                    .filter((v) => v.lang.toLowerCase().startsWith(language.bcp47.slice(0, 2)))
                    .map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 py-4">
          <div
            className={`voice-avatar ${state} flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-6xl shadow-lg`}
            aria-label={`Status: ${state}`}
          >
            {language.flag}
          </div>
          <Badge variant={state === "listening" ? "success" : state === "speaking" ? "default" : "secondary"}>
            {state === "idle" && "Redo"}
            {state === "listening" && "Lyssnar…"}
            {state === "thinking" && (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Tänker…
              </span>
            )}
            {state === "speaking" && "Talar…"}
          </Badge>
        </div>

        {!supported && (
          <p className="text-sm text-amber-600 text-center">
            Din webbläsare stöder inte talinspelning. Testa Chrome eller Safari på desktop/mobil.
          </p>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-2 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {state === "listening" ? (
            <Button onClick={stopListening} variant="secondary">
              <MicOff className="h-4 w-4" /> Pausa
            </Button>
          ) : (
            <Button onClick={startListening} disabled={!supported || state === "thinking" || state === "speaking"}>
              <Mic className="h-4 w-4" /> Tala
            </Button>
          )}
          <Button onClick={endCall} variant="destructive">
            <PhoneOff className="h-4 w-4" /> {endLabel}
          </Button>
        </div>

        {tail.length > 0 && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 space-y-1 text-sm">
            {tail.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-slate-900 dark:text-slate-100" : "text-indigo-700 dark:text-indigo-300"}>
                <span className="text-xs uppercase opacity-60 mr-2">
                  {m.role === "user" ? "Du" : "Tutor"}:
                </span>
                <span dir={language.dir} lang={lang}>
                  {m.content}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
