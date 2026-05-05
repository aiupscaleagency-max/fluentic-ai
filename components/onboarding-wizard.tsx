"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGES, type LangCode } from "@/lib/languages";
import { TRACKS, setTrack, type TrackId } from "@/lib/track";
import {
  markOnboarded,
  setSelectedLanguages,
} from "@/lib/storage";
import {
  EXPLAIN_LANGS,
  getExplainLang,
  setExplainLang,
  type ExplainLang,
} from "@/lib/explain-lang";
import { SCHEDULE_TEMPLATES, applyTemplate } from "@/lib/schedule-templates";
import { Button } from "./ui/button";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type Step = 1 | 2 | 3 | 4;

// Smooth slide-in/out för varje steg. Direction = +1 (next) / -1 (back).
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>(1);
  const [direction, setDirection] = React.useState(1);
  const [selectedLangs, setSelLangs] = React.useState<LangCode[]>([]);
  const [tracksByLang, setTracksByLang] = React.useState<Record<string, TrackId>>({});
  const [pickedTemplate, setPickedTemplate] = React.useState<string | null>(null);

  function go(next: Step) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function toggleLang(code: LangCode) {
    setSelLangs((cur) =>
      cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code],
    );
  }

  function pickTrack(lang: LangCode, track: TrackId) {
    setTracksByLang((cur) => ({ ...cur, [lang]: track }));
  }

  function finish() {
    // 1. Spara språk
    setSelectedLanguages(selectedLangs);
    // 2. Spara per-språk-track
    Object.entries(tracksByLang).forEach(([lang, track]) => {
      setTrack(lang as LangCode, track);
    });
    // 3. Schema-mall (om vald)
    if (pickedTemplate && pickedTemplate !== "skip") {
      const tpl = SCHEDULE_TEMPLATES.find((t) => t.id === pickedTemplate);
      if (tpl) {
        // Applicera på första valda språk (vi vill inte spamma alla)
        applyTemplate(tpl, selectedLangs[0]);
      }
    }
    markOnboarded();
    const first = selectedLangs[0] ?? "es";
    router.push(`/learn/${first}`);
  }

  // Step 3 har "sub-steps" per språk för att inte överbelasta — räkna fram aktivt språk
  const [trackLangIdx, setTrackLangIdx] = React.useState(0);
  const trackLang = selectedLangs[trackLangIdx];

  function nextFromStep3() {
    if (trackLangIdx < selectedLangs.length - 1) {
      setTrackLangIdx((i) => i + 1);
    } else {
      go(4);
    }
  }
  function backFromStep3() {
    if (trackLangIdx > 0) {
      setTrackLangIdx((i) => i - 1);
    } else {
      go(2);
    }
  }

  const canNext1 = true;
  const canNext2 = selectedLangs.length > 0;
  const canNext3 = trackLang ? !!tracksByLang[trackLang] : false;
  const canFinish = pickedTemplate !== null;

  return (
    <div className="relative min-h-[80vh] flex flex-col">
      {/* Floating gradient-orbs i bakgrund */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="float-slow absolute -top-20 -left-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="float-med absolute top-40 -right-16 h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="float-fast absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-500/25 blur-3xl" />
      </div>

      {/* Progress dots */}
      <div className="relative z-10 flex justify-center gap-2 pt-4">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              n === step
                ? "w-10 bg-gradient-to-r from-violet-400 to-cyan-400"
                : n < step
                  ? "w-6 bg-violet-500/60"
                  : "w-6 bg-white/15",
            )}
          />
        ))}
      </div>

      {/* Steg-innehåll */}
      <div className="relative z-10 flex-1 flex items-start sm:items-center justify-center pt-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step === 3 ? `3-${trackLangIdx}` : step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full max-w-3xl"
          >
            {step === 1 && <Step1 onNext={() => go(2)} />}
            {step === 2 && (
              <Step2
                selected={selectedLangs}
                onToggle={toggleLang}
                onBack={() => go(1)}
                onNext={() => {
                  setTrackLangIdx(0);
                  go(3);
                }}
                canNext={canNext2}
              />
            )}
            {step === 3 && trackLang && (
              <Step3
                lang={trackLang}
                pickedTrack={tracksByLang[trackLang]}
                onPick={(t) => pickTrack(trackLang, t)}
                onBack={backFromStep3}
                onNext={nextFromStep3}
                canNext={canNext3}
                idx={trackLangIdx}
                total={selectedLangs.length}
              />
            )}
            {step === 4 && (
              <Step4
                picked={pickedTemplate}
                onPick={setPickedTemplate}
                onBack={() => {
                  setTrackLangIdx(selectedLangs.length - 1);
                  go(3);
                }}
                onFinish={finish}
                canFinish={canFinish}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Step 1: välkommen ---------- */
function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center space-y-8 px-4">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-2xl shadow-violet-500/40"
      >
        <Sparkles className="h-10 w-10 text-white" />
      </motion.div>

      <div className="space-y-3">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Välkommen till{" "}
          <span className="text-gradient">Fluentic AI</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-xl mx-auto">
          Lär dig som om du var där. Vi sätter upp din profil på
          under en minut.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 max-w-lg mx-auto space-y-3">
        <p className="text-sm text-slate-300">
          Du får välja:
        </p>
        <ul className="text-sm space-y-2 text-left">
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Ett eller flera språk</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Vad du vill kunna säga (vardag, business, resa…)</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> När du vill öva — en mall, en klick</li>
        </ul>
      </div>

      <Button size="lg" onClick={onNext} className="px-8">
        Sätt igång <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

/* ---------- Step 2: välj språk (multi) ---------- */
function Step2({
  selected,
  onToggle,
  onBack,
  onNext,
  canNext,
}: {
  selected: LangCode[];
  onToggle: (c: LangCode) => void;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="space-y-8 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold">Välj språk</h2>
        <p className="text-slate-300">Du kan välja flera. Lägg till fler senare när du vill.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {LANGUAGES.map((lang, i) => {
          const isSel = selected.includes(lang.code);
          return (
            <motion.button
              key={lang.code}
              type="button"
              onClick={() => onToggle(lang.code)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative rounded-2xl p-5 text-center transition-all duration-200",
                "glass border-white/10",
                isSel
                  ? "ring-2 ring-violet-400 glow-violet"
                  : "hover:border-white/30",
              )}
            >
              {isSel && (
                <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white text-xs">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="text-5xl mb-2">{lang.flag}</div>
              <div className="font-semibold">{lang.name}</div>
              <div className="text-xs text-slate-400 mt-0.5" dir={lang.dir} lang={lang.code}>
                {lang.native}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Tillbaka</Button>
        <Button onClick={onNext} disabled={!canNext}>
          Fortsätt <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- Step 3: track per språk ---------- */
const ONBOARDING_TRACKS = [
  { id: "general" as const, emoji: "🌍", label: "Allmän", desc: "Lär dig grunderna och bli bekväm" },
  { id: "business" as const, emoji: "💼", label: "Business", desc: "Möten, mejl, presentationer på språket" },
  { id: "travel" as const, emoji: "✈️", label: "Resa", desc: "Klara dig som turist eller flyttbar" },
  { id: "academic" as const, emoji: "🎓", label: "Akademisk", desc: "Studier, uppsatser, akademiskt språk" },
  { id: "casual" as const, emoji: "☕", label: "Vardag", desc: "Småprata, hänga, vardagsfraser" },
];

function Step3({
  lang,
  pickedTrack,
  onPick,
  onBack,
  onNext,
  canNext,
  idx,
  total,
}: {
  lang: LangCode;
  pickedTrack: TrackId | undefined;
  onPick: (t: TrackId) => void;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
  idx: number;
  total: number;
}) {
  const language = LANGUAGES.find((l) => l.code === lang)!;
  // Förklaringsspråk per inlärningsspråk — speglas mot localStorage så switch fungerar direkt
  const [explain, setExplain] = React.useState<ExplainLang>("sv");
  React.useEffect(() => {
    setExplain(getExplainLang(lang));
  }, [lang]);
  function pickExplain(code: ExplainLang) {
    setExplain(code);
    setExplainLang(lang, code);
  }

  return (
    <div className="space-y-6 px-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-sm text-slate-400">
          <span>{idx + 1} av {total}</span>
          <span>·</span>
          <span className="text-2xl">{language.flag}</span>
          <span>{language.name}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold">Vad ska du använda det till?</h2>
        <p className="text-slate-300">Det här styr ord, scenarier och tutorns fokus.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ONBOARDING_TRACKS.map((t, i) => {
          const isSel = pickedTrack === t.id;
          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-4 rounded-2xl p-4 text-left transition-all glass border-white/10",
                isSel ? "ring-2 ring-cyan-400 glow-cyan" : "hover:border-white/30",
              )}
            >
              <div className="text-4xl shrink-0">{t.emoji}</div>
              <div className="min-w-0">
                <div className="font-semibold text-base">{t.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
              </div>
              {isSel && (
                <Check className="h-5 w-5 text-cyan-400 shrink-0 ml-auto" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Förklaringsspråk per språk — Mike vill kunna träna t.ex. arabiska MED spanska förklaringar */}
      <div className="rounded-2xl glass border-white/10 p-4 space-y-3">
        <div className="text-sm">
          På vilket språk vill du få förklaringar för{" "}
          <span className="font-semibold">{language.name}</span>?
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Förklaringsspråk">
          {EXPLAIN_LANGS.map((el) => {
            const active = explain === el.code;
            return (
              <button
                key={el.code}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => pickExplain(el.code)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm border transition-colors",
                  active
                    ? "border-violet-400 bg-violet-500/20 text-violet-100"
                    : "border-white/15 bg-white/5 hover:bg-white/10 text-slate-200",
                )}
              >
                {el.flag} {el.native}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Tillbaka</Button>
        <Button onClick={onNext} disabled={!canNext}>
          {idx < total - 1 ? "Nästa språk" : "Fortsätt"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- Step 4: schema-mallar ---------- */
function Step4({
  picked,
  onPick,
  onBack,
  onFinish,
  canFinish,
}: {
  picked: string | null;
  onPick: (id: string) => void;
  onBack: () => void;
  onFinish: () => void;
  canFinish: boolean;
}) {
  return (
    <div className="space-y-6 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold">När vill du öva?</h2>
        <p className="text-slate-300">Välj en mall — du kan ändra eller lägga till fler senare.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCHEDULE_TEMPLATES.map((tpl, i) => {
          const isSel = picked === tpl.id;
          return (
            <motion.button
              key={tpl.id}
              type="button"
              onClick={() => onPick(tpl.id)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-4 rounded-2xl p-4 text-left transition-all glass border-white/10",
                isSel ? "ring-2 ring-pink-400 glow-pink" : "hover:border-white/30",
              )}
            >
              <div className="text-4xl shrink-0">{tpl.emoji}</div>
              <div className="min-w-0">
                <div className="font-semibold">{tpl.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{tpl.desc}</div>
              </div>
              {isSel && <Check className="h-5 w-5 text-pink-400 shrink-0 ml-auto" />}
            </motion.button>
          );
        })}

        <motion.button
          type="button"
          onClick={() => onPick("skip")}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-4 rounded-2xl p-4 text-left glass border-white/10",
            picked === "skip" ? "ring-2 ring-slate-400" : "hover:border-white/30",
          )}
        >
          <div className="text-4xl shrink-0">🪶</div>
          <div className="min-w-0">
            <div className="font-semibold">Skip</div>
            <div className="text-xs text-slate-400 mt-0.5">Hoppa över schema — jag fixar själv</div>
          </div>
        </motion.button>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Tillbaka</Button>
        <Button onClick={onFinish} disabled={!canFinish} size="lg" className="px-6">
          Klar — börja lära <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
