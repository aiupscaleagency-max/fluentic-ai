"use client";

import * as React from "react";
import { LANGUAGES } from "@/lib/languages";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Mic, MicOff, Volume2, ArrowLeftRight, Loader2, MessagesSquare } from "lucide-react";
import { getLevel } from "@/lib/level";
import { isValidLangCode } from "@/lib/languages";

// Tolken stödjer även "sv" som käll- och målspråk utöver MVP-fyran
type TranslatorLang = "sv" | "es" | "en" | "fr" | "ar";

import { getSpeechRecognitionCtor, type SRInstance } from "@/lib/speech";

interface TranslateResp {
  translation?: string;
  transliteration?: string;
  alternative?: string;
  error?: string;
}

export function Translator() {
  const [from, setFrom] = React.useState<TranslatorLang>("sv");
  const [to, setTo] = React.useState<TranslatorLang>("es");
  const [text, setText] = React.useState("");
  const [out, setOut] = React.useState<TranslateResp | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [conversationMode, setConversationMode] = React.useState(false);
  const [turn, setTurn] = React.useState<"a" | "b">("a"); // för konversations-tolk
  const [history, setHistory] = React.useState<{ from: string; to: string; text: string; out: string }[]>([]);
  const recRef = React.useRef<SRInstance | null>(null);

  // Vi tillåter "sv" som källa/mål även fast den inte finns i LANGUAGES (UI-språket)
  type AnyLang = { code: TranslatorLang; name: string; native: string; dir: "ltr" | "rtl"; flag: string; bcp47: string };
  const allFrom: AnyLang[] = [
    { code: "sv", name: "Svenska", native: "Svenska", dir: "ltr", flag: "🇸🇪", bcp47: "sv-SE" },
    ...LANGUAGES,
  ];
  const allTo = allFrom;

  const fromMeta = allFrom.find((l) => l.code === from)!;
  const toMeta = allTo.find((l) => l.code === to)!;

  function ensureRecognizer(langBcp47: string) {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = langBcp47;
    rec.continuous = false;
    rec.interimResults = false;
    return rec;
  }

  function startMic(forLang: string) {
    const rec = ensureRecognizer(forLang);
    if (!rec) {
      setError("Talinspelning stöds inte i din webbläsare.");
      return;
    }
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      setText(last[0].transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function stopMic() {
    recRef.current?.stop();
    setListening(false);
  }

  async function translate(textArg?: string, fromArg?: string, toArg?: string) {
    const t = (textArg ?? text).trim();
    const f = fromArg ?? from;
    const tg = toArg ?? to;
    if (!t) return null;
    setLoading(true);
    setError(null);
    setOut(null);
    try {
      // Anpassa nivå efter målspråket om vi översätter TILL ett av Fluentics språk
      const level = isValidLangCode(tg) ? getLevel(tg) : null;
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t, from: f, to: tg, level }),
      });
      const data = (await res.json()) as TranslateResp;
      if (!res.ok || !data.translation) {
        throw new Error(data.error ?? "Översättning misslyckades");
      }
      setOut(data);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }

  function speak(text: string, langBcp47: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langBcp47;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function swap() {
    const f = from;
    setFrom(to);
    setTo(f);
    setText(out?.translation ?? "");
    setOut(null);
  }

  // ---- Konversations-tolk ----
  // Turn A pratar `from`, översätts till `to`. Turn B pratar `to`, översätts till `from`.
  async function speakAndTranslateConversation() {
    const speakerLang = turn === "a" ? from : to;
    const targetLang = turn === "a" ? to : from;
    const speakerBcp = (turn === "a" ? fromMeta : toMeta).bcp47;
    const targetBcp = (turn === "a" ? toMeta : fromMeta).bcp47;

    // Spela in en runda
    const rec = ensureRecognizer(speakerBcp);
    if (!rec) {
      setError("Talinspelning stöds inte i din webbläsare.");
      return;
    }
    setError(null);
    setListening(true);
    rec.onresult = async (e) => {
      const last = e.results[e.results.length - 1];
      const said = last[0].transcript;
      setListening(false);
      const result = await translate(said, speakerLang, targetLang);
      if (result?.translation) {
        speak(result.translation, targetBcp);
        setHistory((h) => [
          ...h,
          { from: speakerLang, to: targetLang, text: said, out: result.translation! },
        ]);
        setTurn((t) => (t === "a" ? "b" : "a"));
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-3">
            <LangPicker label="Från" value={from} onChange={setFrom} options={allFrom} />
            <Button variant="ghost" size="icon" onClick={swap} aria-label="Byt språk">
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <LangPicker label="Till" value={to} onChange={setTo} options={allTo} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{fromMeta.flag} {fromMeta.name}</span>
                <Button
                  size="sm"
                  variant={listening ? "destructive" : "ghost"}
                  onClick={() => (listening ? stopMic() : startMic(fromMeta.bcp47))}
                  disabled={conversationMode}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <textarea
                className="w-full min-h-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Skriv text att översätta…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                dir={fromMeta.dir}
                lang={fromMeta.code}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{toMeta.flag} {toMeta.name}</span>
                {out?.translation && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speak(out.translation!, toMeta.bcp47)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div
                className="w-full min-h-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-sm whitespace-pre-wrap"
                dir={toMeta.dir}
                lang={toMeta.code}
              >
                {loading ? (
                  <span className="text-slate-400 inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Översätter…
                  </span>
                ) : out?.translation ? (
                  <>
                    <div className="font-medium">{out.translation}</div>
                    {out.transliteration && (
                      <div className="text-xs text-slate-500 mt-1" dir="ltr">
                        Translitt: {out.transliteration}
                      </div>
                    )}
                    {out.alternative && (
                      <div className="text-xs text-slate-500 mt-1">
                        Alt: {out.alternative}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400">Översättning kommer här…</span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-2">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => translate()} disabled={loading || !text.trim() || conversationMode}>
              Översätt
            </Button>
            <Button
              variant={conversationMode ? "default" : "outline"}
              onClick={() => {
                setConversationMode((c) => !c);
                setHistory([]);
                setTurn("a");
              }}
            >
              <MessagesSquare className="h-4 w-4" />
              {conversationMode ? "Avsluta konversation" : "Konversation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {conversationMode && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Badge>{turn === "a" ? `${fromMeta.flag} ${fromMeta.name}s tur` : `${toMeta.flag} ${toMeta.name}s tur`}</Badge>
              <Button onClick={speakAndTranslateConversation} disabled={listening || loading}>
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {listening ? "Lyssnar…" : "Spela in"}
              </Button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {history.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Tryck på Spela in. Personerna växlar tur — appen översätter och läser upp åt motparten.
                </p>
              )}
              {history.map((h, i) => {
                const fm = allFrom.find((l) => l.code === h.from)!;
                const tm = allTo.find((l) => l.code === h.to)!;
                return (
                  <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <div className="text-xs text-slate-500">{fm.flag} → {tm.flag}</div>
                    <div dir={fm.dir} lang={fm.code} className="text-sm">{h.text}</div>
                    <div dir={tm.dir} lang={tm.code} className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                      {h.out}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LangPicker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: TranslatorLang;
  onChange: (v: TranslatorLang) => void;
  options: { code: TranslatorLang; name: string; flag: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TranslatorLang)}
        className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.flag} {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
