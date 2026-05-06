"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiLang } from "@/lib/ui-language";
import { useT } from "@/lib/i18n";
import { useUser } from "@/lib/auth";
import { usePathname } from "next/navigation";

interface Msg { role: "user" | "assistant"; content: string; }

const STORAGE_KEY = "fluentic.maritza.messages";

// Floating chat-bubbel i nedre högra hörnet — Maritza, Mikes mamma-figur som
// förklarar och hjälper på UI-språket. Persisterar konversation i localStorage
// så den följer användaren mellan sidor.
const HIDE_ON = ["/", "/login", "/signup", "/pricing", "/unlock"];
const SEEN_INTRO_KEY = "fluentic.maritza.seen-intro";

export function MaritzaChat() {
  const t = useT();
  const uiLang = useUiLang();
  const user = useUser();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [showIntro, setShowIntro] = React.useState(false);

  // Auto-presentation 1 gång för inloggade — popup intill bubblan
  React.useEffect(() => {
    if (!user) return;
    if (pathname && HIDE_ON.includes(pathname)) return;
    try {
      if (window.localStorage.getItem(SEEN_INTRO_KEY) === "1") return;
    } catch { return; }
    const id = window.setTimeout(() => setShowIntro(true), 2500); // Liten paus efter Adison
    return () => window.clearTimeout(id);
  }, [user, pathname]);

  function dismissIntro() {
    setShowIntro(false);
    try { window.localStorage.setItem(SEEN_INTRO_KEY, "1"); } catch { /* tyst */ }
  }
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  // Läs in tidigare konversation
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch { /* tyst */ }
  }, []);

  // Spara konversation
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch { /* quota */ }
  }, [messages]);

  // Auto-scroll
  React.useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  // Hämta nuvarande target-språk + level från URL/localStorage som kontext
  function readCurrentContext(): { targetLang?: string; level?: string } {
    if (typeof window === "undefined") return {};
    const path = window.location.pathname;
    const m = path.match(/\/learn\/([a-z]{2,3})/);
    const targetLang = m?.[1];
    let level: string | undefined;
    if (targetLang) {
      try {
        level = window.localStorage.getItem(`fluentic.level.${targetLang}`) ?? undefined;
      } catch { /* tyst */ }
    }
    return { targetLang, level };
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const ctx = readCurrentContext();
      const res = await fetch("/api/maritza", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, uiLang, ...ctx }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error ?? "Fel");
      setMessages((m) => [...m, { role: "assistant", content: data.reply! }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages((m) => [...m, { role: "assistant", content: `⚠ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* tyst */ }
  }

  // Dölj på publika sidor + om ej inloggad
  if (!user) return null;
  if (pathname && HIDE_ON.includes(pathname)) return null;

  return (
    <>
      {/* Auto-presentations-popup intill bubblan — visas 1 gång efter signup */}
      <AnimatePresence>
        {showIntro && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-5 z-[71] w-[min(290px,calc(100vw-2.5rem))] rounded-2xl glass-strong border-2 border-pink-300/40 px-4 py-3 shadow-2xl shadow-pink-500/30"
          >
            <button
              type="button"
              onClick={dismissIntro}
              className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-white/10"
              aria-label={t("common.close")}
            >
              <X className="h-3 w-3" />
            </button>
            <div className="flex items-start gap-2">
              <div className="text-2xl shrink-0">💖</div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-pink-200">Maritza · Stödlärare</div>
                <p className="text-xs text-slate-200 leading-snug mt-1">{t("agent.maritza.intro")}</p>
                <button
                  type="button"
                  onClick={dismissIntro}
                  className="mt-2 text-xs font-bold text-pink-200 hover:text-pink-100"
                >
                  {t("agent.gotIt")}
                </button>
              </div>
            </div>
            {/* Pil ned till bubblan */}
            <div className="absolute -bottom-2 right-6 h-3 w-3 rotate-45 bg-pink-300/15 border-r-2 border-b-2 border-pink-300/40" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble-knapp */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); if (showIntro) dismissIntro(); }}
        className={cn(
          "fixed bottom-5 right-5 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full shadow-2xl shadow-pink-500/40 transition-all",
          open
            ? "bg-slate-700 text-white hover:bg-slate-600"
            : "bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400 text-white hover:scale-105",
          showIntro && !open && "ring-4 ring-pink-300/40 animate-pulse"
        )}
        aria-label={open ? t("common.close") : t("maritza.title")}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat-panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-[70] w-[min(380px,calc(100vw-2.5rem))] glass-strong border border-white/15 rounded-2xl shadow-2xl flex flex-col"
            style={{ height: "min(560px, calc(100vh - 8rem))" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-pink-500/30">
                💖
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-100 text-sm">Maritza</div>
                <div className="text-xs text-slate-400 truncate">{t("maritza.title").split("–")[1]?.trim() ?? t("maritza.title")}</div>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
                >
                  {t("common.close")}
                </button>
              )}
            </div>

            {/* Messages */}
            <div ref={scrollerRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {messages.length === 0 && (
                <div className="text-center text-sm text-slate-300 py-6 px-2 space-y-2">
                  <div className="text-4xl">💖</div>
                  <div className="font-semibold">Maritza</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{t("maritza.greeting")}</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
                        : "bg-white/8 border border-white/10 text-slate-100"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3 py-2 bg-white/8 border border-white/10 text-sm text-slate-300 inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Maritza…
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 p-3 border-t border-white/10"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("maritza.placeholder")}
                disabled={loading}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-400/60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t("common.send")}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
