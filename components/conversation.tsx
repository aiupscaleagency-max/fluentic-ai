"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Loader2, Volume2 } from "lucide-react";
import { addXP } from "@/lib/storage";
import { useLevel } from "@/lib/use-level";
import { useTrack } from "@/lib/track";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function Conversation({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const track = useTrack(lang);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scroller = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMessages([]);
    setError(null);
  }, [lang]);

  React.useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, messages: next, level, track }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error ?? "Något gick fel");
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply! }]);
      addXP(3);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    // Vi pratar bara den första raden (målspråket) — andra raden är svensk översättning
    const firstLine = text.split("\n")[0] ?? text;
    const utter = new SpeechSynthesisUtterance(firstLine);
    utter.lang = language.bcp47;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div
          ref={scroller}
          className="h-[420px] overflow-y-auto p-4 space-y-3"
        >
          {messages.length === 0 && (
            <div className="text-center text-slate-500 py-12">
              Säg hej till din AI-tutor på {language.name.toLowerCase()}!
              <div className="mt-2 text-xs">
                Tutorn svarar på {language.name.toLowerCase()} med svensk översättning under.
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
                dir={m.role === "assistant" && language.dir === "rtl" ? "auto" : "ltr"}
                lang={m.role === "assistant" ? lang : "sv"}
              >
                {m.content}
                {m.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => speak(m.content)}
                    aria-label="Lyssna"
                    className="ml-2 inline-flex align-middle text-slate-500 hover:text-indigo-600"
                  >
                    <Volume2 className="h-3.5 w-3.5 inline" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Tutorn tänker…
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-2">
              {error}
            </div>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-slate-200 dark:border-slate-800 p-3 flex gap-2"
        >
          <Input
            placeholder={`Skriv ett meddelande på svenska eller ${language.name.toLowerCase()}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
