"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useLevel } from "@/lib/use-level";
import { useTracks, getTrackMeta } from "@/lib/track";
import { useExplainLang } from "@/lib/explain-lang";
import { addXP } from "@/lib/storage";
import { usePersona } from "@/lib/personas";
import { addSpokenSeconds } from "@/lib/spoken-time";
import { getSpeechRecognitionCtor, type SRInstance } from "@/lib/speech";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string };
type State = "idle" | "listening" | "thinking" | "speaking";

interface ScenarioMeta {
  badge: string;       // ex: "☕ Beställa kaffe — du är på Café Sol i Madrid"
  tutorRole: string;   // ex: "Maria · Barista"
  gradient?: string;   // ex: "from-amber-500 via-pink-500 to-violet-500"
}

interface Props {
  lang: LangCode;
  systemOverride?: string;
  greeting?: string;
  onEnd?: (history: Msg[]) => void;
  endLabel?: string;
  scenarioMeta?: ScenarioMeta;
}

// Tutor-personas per språk för att kännas mänskligt
const PERSONAS: Record<LangCode, { name: string; city: string; role: string; gradient: string }> = {
  es: { name: "Sofia",  city: "Madrid", role: "Spansklärare", gradient: "from-rose-400 via-amber-400 to-violet-500" },
  en: { name: "James",  city: "London", role: "Engelsklärare", gradient: "from-cyan-400 via-blue-500 to-violet-500" },
  fr: { name: "Léa",    city: "Paris",  role: "Fransklärare", gradient: "from-pink-400 via-fuchsia-500 to-indigo-500" },
  ar: { name: "Yara",   city: "Beirut", role: "Arabisklärare", gradient: "from-emerald-400 via-teal-400 to-cyan-500" },
};

export function VideoCall({
  lang,
  systemOverride,
  greeting,
  onEnd,
  endLabel = "Avsluta samtal",
  scenarioMeta,
}: Props) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const tracks = useTracks(lang);
  const explainLang = useExplainLang(lang);
  const userPersona = usePersona(lang);
  const [state, setState] = React.useState<State>("idle");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  // Sekunder användaren faktiskt pratat — för Praktika-style streak baserad på talad tid
  const sessionStartRef = React.useRef<number | null>(null);
  const [history, setHistory] = React.useState<Msg[]>([]);
  const [supported, setSupported] = React.useState(true);
  const [autoRestart] = React.useState(true);
  const [muted, setMuted] = React.useState(false);
  const [speakerOn, setSpeakerOn] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [secs, setSecs] = React.useState(0);
  const [voiceURI] = React.useState<string>("");
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [rate] = React.useState<number>(() => {
    if (typeof window === "undefined") return 1.0;
    try {
      const v = parseFloat(window.localStorage.getItem("fluentic.voice-rate") ?? "1.0");
      return Number.isFinite(v) && v > 0 ? v : 1.0;
    } catch { return 1.0; }
  });

  const recRef = React.useRef<SRInstance | null>(null);
  const stoppedRef = React.useRef(false);
  const historyRef = React.useRef<Msg[]>([]);
  const mountedAt = React.useRef<number>(Date.now());

  // "Iris-tracking" — pupillen följer musen för uncanny "tittar på dig"
  const [iris, setIris] = React.useState({ x: 0, y: 0 });
  const orbRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { historyRef.current = history; }, [history]);

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
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setError(`Mikrofonfel: ${e.error}`);
      }
      setState("idle");
    };
    rec.onend = () => {/* hanteras explicit */};
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
      setVoices(window.speechSynthesis.getVoices());
    }
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  // Greeting
  const greetedRef = React.useRef(false);
  React.useEffect(() => {
    if (greetedRef.current || !greeting) return;
    greetedRef.current = true;
    setHistory([{ role: "assistant", content: greeting }]);
    speak(greeting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greeting]);

  // Timer för call-duration
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setSecs(Math.floor((Date.now() - mountedAt.current) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Iris-tracking
  React.useEffect(() => {
    function move(e: MouseEvent) {
      const orb = orbRef.current;
      if (!orb) return;
      const r = orb.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const max = 12; // pixlar pupillen får röra sig
      const len = Math.hypot(dx, dy) || 1;
      const cap = Math.min(len, max * 6);
      setIris({ x: (dx / len) * (cap / 6), y: (dy / len) * (cap / 6) });
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  function startListening() {
    if (!recRef.current || stoppedRef.current || muted) return;
    setError(null);
    setFeedback(null);
    try {
      recRef.current.start();
      setState("listening");
      sessionStartRef.current = Date.now();
    } catch {/* already started */}
  }

  function flushSpoken() {
    if (sessionStartRef.current != null) {
      const sec = (Date.now() - sessionStartRef.current) / 1000;
      addSpokenSeconds(sec);
      sessionStartRef.current = null;
    }
  }

  function stopListening() {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch {/* tyst */}
    flushSpoken();
    setState("idle");
  }

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      if (next) stopListening();
      return next;
    });
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
          personaId: userPersona?.id,
          microFeedback: true,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string; feedback?: string | null };
      if (!res.ok || !data.reply) throw new Error(data.error ?? "AI-fel");
      const reply = data.reply;
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
      setFeedback(data.feedback ?? null);
      addXP(2);
      speak(reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState("idle");
    }
  }

  function speak(text: string) {
    if (!speakerOn) {
      setState("idle");
      if (autoRestart && !stoppedRef.current && !muted) {
        setTimeout(startListening, 200);
      }
      return;
    }
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
    } else {
      const v = voices.find((vv) => vv.lang.toLowerCase().startsWith(language.bcp47.slice(0, 2)));
      if (v) utter.voice = v;
    }
    utter.onstart = () => setState("speaking");
    utter.onend = () => {
      setState("idle");
      if (autoRestart && !stoppedRef.current && !muted) {
        setTimeout(startListening, 200);
      }
    };
    utter.onerror = () => setState("idle");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function endCall() {
    stoppedRef.current = true;
    flushSpoken();
    if (recRef.current) {
      try { recRef.current.abort?.(); } catch {/* tyst */}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState("idle");
    onEnd?.(historyRef.current);
  }

  const persona = PERSONAS[lang];
  // Användarens vald persona vinner — fall tillbaka till språk-baserad om ingen
  const tutorName = scenarioMeta?.tutorRole
    ? scenarioMeta.tutorRole
    : userPersona
      ? `${userPersona.emoji} ${userPersona.name} · ${language.name}`
      : `${persona.name} · ${persona.city} · ${persona.role}`;
  const gradient = scenarioMeta?.gradient ?? persona.gradient;

  // Visa senaste yttrandet (rolling caption)
  const lastMsg = history[history.length - 1];
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="relative rounded-3xl overflow-hidden glass-strong border-white/15 shadow-2xl shadow-violet-500/20 min-h-[78vh] sm:min-h-[600px] flex flex-col">
      {/* Mörk videosamtal-bakgrund */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-slate-950 to-black" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl float-slow" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl float-med" />
      </div>

      {/* Top bar: LIVE + timer + scenario badge */}
      <div className="flex items-center justify-between p-4 sm:p-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 border border-rose-400/40 px-3 py-1 text-xs font-semibold text-rose-200">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-rose-400" />
          LIVE
        </div>
        {scenarioMeta && (
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full glass border-white/10 px-3 py-1 text-xs text-slate-200 max-w-[55%] truncate">
            {scenarioMeta.badge}
          </div>
        )}
        <div className="rounded-full glass border-white/10 px-3 py-1 font-mono text-xs text-slate-200 tabular-nums">
          {mm}:{ss}
        </div>
      </div>

      {scenarioMeta && (
        <div className="sm:hidden mx-4 mb-2 rounded-xl glass border-white/10 px-3 py-2 text-xs text-slate-200">
          {scenarioMeta.badge}
        </div>
      )}

      {/* Avatar */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 py-6">
        <TutorAvatar
          ref={orbRef}
          state={state}
          gradient={gradient}
          iris={iris}
        />

        <div className="text-center space-y-1">
          <div className="text-lg font-semibold">{tutorName}</div>
          <div className="text-xs text-slate-400">
            {language.native} · CEFR {level ?? "A2"} · {tracks.map((t) => getTrackMeta(t).shortLabel).join(" · ")}
          </div>
          <StateLabel state={state} />
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/15 border border-rose-400/40 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}

        {!supported && (
          <p className="text-sm text-amber-300 text-center max-w-md">
            Din webbläsare stöder inte talinspelning. Testa Chrome eller Safari.
          </p>
        )}
      </div>

      {/* Mikro-feedback-toast — coaching-tips från senaste user-tur */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-xs text-amber-100 text-center"
        >
          💡 {feedback}
        </motion.div>
      )}

      {/* Rolling caption (sista yttrandet) */}
      {lastMsg && (
        <motion.div
          key={`${lastMsg.role}-${history.length}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-4 mb-4 rounded-2xl glass border-white/10 px-4 py-3 text-sm text-center"
        >
          <span className="text-xs text-slate-400 block mb-0.5">
            {lastMsg.role === "user" ? "Du sa" : tutorName.split("·")[0].trim()}
          </span>
          <span dir={language.dir} lang={lang}>{lastMsg.content}</span>
        </motion.div>
      )}

      {/* Bottom action bar */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 p-5 pb-6">
        <ActionButton
          onClick={toggleMute}
          tooltip={muted ? "Slå på mikrofon" : "Stäng av mikrofon"}
          active={!muted && state === "listening"}
          color={muted ? "muted" : "cyan"}
        >
          {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </ActionButton>

        {state !== "listening" && state !== "thinking" && state !== "speaking" && !muted && (
          <button
            onClick={startListening}
            disabled={!supported || muted}
            className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-violet-500/40 hover:shadow-violet-500/60 active:scale-95 transition-all"
          >
            Tala
          </button>
        )}

        <ActionButton
          onClick={endCall}
          tooltip={endLabel}
          color="red"
        >
          <PhoneOff className="h-6 w-6" />
        </ActionButton>

        <ActionButton
          onClick={() => setSpeakerOn((s) => !s)}
          tooltip={speakerOn ? "Tysta tutor" : "Slå på tutor"}
          active={speakerOn}
          color={speakerOn ? "violet" : "muted"}
        >
          {speakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
        </ActionButton>
      </div>
    </div>
  );
}

/* ---------- Avatar (animated gradient sphere with iris) ---------- */
const TutorAvatar = React.forwardRef<
  HTMLDivElement,
  { state: State; gradient: string; iris: { x: number; y: number } }
>(function TutorAvatar({ state, gradient, iris }, ref) {
  const breathe = state === "idle" ? { scale: [1, 1.02, 1] } : { scale: 1 };

  return (
    <div className="relative">
      {/* Pulsering vid lyssna */}
      {state === "listening" && (
        <span className="absolute inset-0 rounded-full ring-2 ring-cyan-300/60 animate-ping" />
      )}
      {state === "thinking" && (
        <span className="absolute -inset-3 rounded-full border-2 border-dashed border-violet-300/50 animate-spin [animation-duration:3s]" />
      )}

      <motion.div
        ref={ref}
        animate={breathe}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "tutor-orb relative flex h-44 w-44 sm:h-56 sm:w-56 items-center justify-center rounded-full",
          "bg-gradient-to-br shadow-2xl shadow-violet-500/40",
          gradient,
        )}
        style={{
          filter:
            state === "listening"
              ? "saturate(1.4) brightness(1.1)"
              : state === "speaking"
                ? "saturate(1.3)"
                : "saturate(1)",
        }}
      >
        {/* Inre "iris" som följer mus */}
        <div
          className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-950/70 backdrop-blur-sm border border-white/15 overflow-hidden transition-transform"
          style={{ transform: `translate(${iris.x}px, ${iris.y}px)` }}
        >
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-300 via-violet-400 to-pink-400" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950" />
          <div className="absolute left-[60%] top-[35%] h-1.5 w-1.5 rounded-full bg-white/90" />
        </div>

        {/* Talar-vågor längst ner på orben */}
        {state === "speaking" && <Waveform />}
      </motion.div>
    </div>
  );
});

/* ---------- Waveform-bars (under orben vid speaking) ---------- */
function Waveform() {
  return (
    <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 items-end gap-1 h-6">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="wave-bar inline-block w-1 rounded-full bg-gradient-to-t from-cyan-400 to-violet-300"
          style={{
            height: "100%",
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- State label ---------- */
function StateLabel({ state }: { state: State }) {
  if (state === "idle") return <div className="text-xs text-slate-500">Redo</div>;
  if (state === "listening") return <div className="text-xs text-cyan-300 inline-flex items-center gap-1">● Lyssnar…</div>;
  if (state === "thinking")
    return (
      <div className="text-xs text-violet-300 inline-flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Tänker…
      </div>
    );
  return <div className="text-xs text-pink-300">Talar…</div>;
}

/* ---------- Round action button ---------- */
function ActionButton({
  children,
  onClick,
  tooltip,
  active,
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  active?: boolean;
  color: "cyan" | "violet" | "red" | "muted";
}) {
  const colorClass: Record<typeof color, string> = {
    cyan: active
      ? "bg-cyan-500/30 border-cyan-300 text-cyan-100 glow-cyan"
      : "bg-white/10 border-white/20 text-slate-200 hover:bg-white/15",
    violet: active
      ? "bg-violet-500/30 border-violet-300 text-violet-100 glow-violet"
      : "bg-white/10 border-white/20 text-slate-200 hover:bg-white/15",
    red: "bg-rose-500 border-rose-300 text-white shadow-lg shadow-rose-500/40 hover:bg-rose-400",
    muted: "bg-white/5 border-white/15 text-slate-400 hover:bg-white/10",
  };
  return (
    <button
      onClick={onClick}
      title={tooltip}
      aria-label={tooltip}
      className={cn(
        "h-14 w-14 rounded-full border flex items-center justify-center transition-all active:scale-95",
        colorClass[color],
      )}
    >
      {children}
    </button>
  );
}
