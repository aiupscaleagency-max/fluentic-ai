"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGES, type LangCode } from "@/lib/languages";
import { setTracks, type TrackId } from "@/lib/track";
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
import { PERSONAS, setPersona, type PersonaId } from "@/lib/personas";
import { setLevelAndApplyStartingPoint, type CefrLevel } from "@/lib/level";
import { VoiceLevelTest } from "./voice-level-test";

// 6 steg nu: välkommen, språk, tracks, persona, nivå-test, schema
type Step = 1 | 2 | 3 | 4 | 5 | 6;

// Magisk id för "hoppa över schema" — hanteras mutually exclusive
const SKIP_TEMPLATE_ID = "__skip__";

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
  // Multi: per språk en lista av tracks
  const [tracksByLang, setTracksByLang] = React.useState<Record<string, TrackId[]>>({});
  // Multi: en lista av template-id (eller SKIP_TEMPLATE_ID)
  const [pickedTemplates, setPickedTemplates] = React.useState<string[]>([]);
  // Persona: en per språk (default Sofia om hoppar över)
  const [personaByLang, setPersonaByLang] = React.useState<Record<string, PersonaId>>({});
  // Levels: bedöms via röst-test, fallback A1
  const [levelByLang, setLevelByLang] = React.useState<Record<string, CefrLevel>>({});

  function go(next: Step) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function toggleLang(code: LangCode) {
    setSelLangs((cur) =>
      cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code],
    );
  }

  // Multi-toggle av track per språk
  function toggleTrack(lang: LangCode, track: TrackId) {
    setTracksByLang((cur) => {
      const existing = cur[lang] ?? [];
      const next = existing.includes(track)
        ? existing.filter((t) => t !== track)
        : [...existing, track];
      return { ...cur, [lang]: next };
    });
  }

  // Multi-toggle av schemamall — SKIP är mutually exclusive
  function toggleTemplate(id: string) {
    setPickedTemplates((cur) => {
      if (id === SKIP_TEMPLATE_ID) {
        // Klick på Skip — om redan vald, avmarkera. Annars: bara skip.
        return cur.includes(SKIP_TEMPLATE_ID) ? [] : [SKIP_TEMPLATE_ID];
      }
      // Klick på vanlig mall — ta bort skip om den var vald
      const without = cur.filter((c) => c !== SKIP_TEMPLATE_ID);
      return without.includes(id)
        ? without.filter((c) => c !== id)
        : [...without, id];
    });
  }

  function finish() {
    // 1. Spara språk
    setSelectedLanguages(selectedLangs);
    // 2. Spara per-språk-tracks (multi). Default till general om tom.
    Object.entries(tracksByLang).forEach(([lang, list]) => {
      const final = list.length > 0 ? list : (["general"] as TrackId[]);
      setTracks(lang as LangCode, final);
    });
    // Om användaren hoppade över ett språk i wizarden — sätt default general
    selectedLangs.forEach((l) => {
      if (!tracksByLang[l] || tracksByLang[l].length === 0) {
        setTracks(l, ["general"]);
      }
    });
    // 3. Persona per språk — fallback Sofia (varm/vänlig) om inget val
    selectedLangs.forEach((l) => {
      setPersona(l, personaByLang[l] ?? "sofia");
    });
    // 4. Nivå per språk — sätts redan av VoiceLevelTest med apply-starting-point.
    //    Säkerställ A1 som fallback för språk som hoppat över röst-testet.
    selectedLangs.forEach((l) => {
      if (!levelByLang[l]) void setLevelAndApplyStartingPoint(l, "A1");
    });
    // 5. Schema-mallar (om valda och inte skip) — applicera ALLA på första språket
    if (!pickedTemplates.includes(SKIP_TEMPLATE_ID)) {
      pickedTemplates.forEach((tid) => {
        const tpl = SCHEDULE_TEMPLATES.find((t) => t.id === tid);
        if (tpl) {
          applyTemplate(tpl, selectedLangs[0]);
        }
      });
    }
    markOnboarded();
    const first = selectedLangs[0] ?? "es";
    // Praktika-style: skicka direkt till röstsamtal med tutor-personan
    router.push(`/learn/${first}/call`);
  }

  // Step 3 har "sub-steps" per språk för att inte överbelasta — räkna fram aktivt språk
  const [trackLangIdx, setTrackLangIdx] = React.useState(0);
  const trackLang = selectedLangs[trackLangIdx];
  // Step 4 (persona) sub-step per språk
  const [personaLangIdx, setPersonaLangIdx] = React.useState(0);
  const personaLang = selectedLangs[personaLangIdx];
  // Step 5 (level-test) sub-step per språk
  const [levelLangIdx, setLevelLangIdx] = React.useState(0);
  const levelLang = selectedLangs[levelLangIdx];

  function nextFromStep3() {
    if (trackLangIdx < selectedLangs.length - 1) {
      setTrackLangIdx((i) => i + 1);
    } else {
      setPersonaLangIdx(0);
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

  function nextFromStep4() {
    if (personaLangIdx < selectedLangs.length - 1) {
      setPersonaLangIdx((i) => i + 1);
    } else {
      setLevelLangIdx(0);
      go(5);
    }
  }
  function backFromStep4() {
    if (personaLangIdx > 0) {
      setPersonaLangIdx((i) => i - 1);
    } else {
      setTrackLangIdx(selectedLangs.length - 1);
      go(3);
    }
  }

  function nextFromStep5() {
    if (levelLangIdx < selectedLangs.length - 1) {
      setLevelLangIdx((i) => i + 1);
    } else {
      go(6);
    }
  }
  function backFromStep5() {
    if (levelLangIdx > 0) {
      setLevelLangIdx((i) => i - 1);
    } else {
      setPersonaLangIdx(selectedLangs.length - 1);
      go(4);
    }
  }

  const canNext2 = selectedLangs.length > 0;
  const canNext3 = trackLang ? (tracksByLang[trackLang]?.length ?? 0) > 0 : false;
  const canNext4 = personaLang ? !!personaByLang[personaLang] : false;
  // Step 6 är klar så fort minst en mall är vald (eller skip)
  const canFinish = pickedTemplates.length > 0;

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
        {[1, 2, 3, 4, 5, 6].map((n) => (
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
            key={
              step === 3 ? `3-${trackLangIdx}` :
              step === 4 ? `4-${personaLangIdx}` :
              step === 5 ? `5-${levelLangIdx}` :
              step
            }
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
                pickedTracks={tracksByLang[trackLang] ?? []}
                onToggle={(t) => toggleTrack(trackLang, t)}
                onBack={backFromStep3}
                onNext={nextFromStep3}
                canNext={canNext3}
                idx={trackLangIdx}
                total={selectedLangs.length}
              />
            )}
            {step === 4 && personaLang && (
              <StepPersona
                lang={personaLang}
                picked={personaByLang[personaLang] ?? null}
                onPick={(id) => setPersonaByLang((cur) => ({ ...cur, [personaLang]: id }))}
                onBack={backFromStep4}
                onNext={nextFromStep4}
                canNext={canNext4}
                idx={personaLangIdx}
                total={selectedLangs.length}
              />
            )}
            {step === 5 && levelLang && (
              <StepLevelTest
                lang={levelLang}
                onLevel={(lvl) => {
                  setLevelByLang((cur) => ({ ...cur, [levelLang]: lvl }));
                  nextFromStep5();
                }}
                onSkip={nextFromStep5}
                onBack={backFromStep5}
                idx={levelLangIdx}
                total={selectedLangs.length}
              />
            )}
            {step === 6 && (
              <StepSchedule
                picked={pickedTemplates}
                onToggle={toggleTemplate}
                onBack={() => {
                  setLevelLangIdx(selectedLangs.length - 1);
                  go(5);
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
          Du sätter upp på en minut:
        </p>
        <ul className="text-sm space-y-2 text-left">
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Ett eller flera språk att lära dig</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Mål — vardag, business, resa, akademi…</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Hectór — Sofia, Marco, Luna eller Diego</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Snabbt röst-test som hittar din CEFR-nivå</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Träningsschema — en klick</li>
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

/* ---------- Step 3: tracks per språk (MULTI) ---------- */
const ONBOARDING_TRACKS = [
  { id: "general" as const, emoji: "🌍", label: "Allmän", desc: "Lär dig grunderna och bli bekväm" },
  { id: "business" as const, emoji: "💼", label: "Business", desc: "Möten, mejl, presentationer på språket" },
  { id: "travel" as const, emoji: "✈️", label: "Resa", desc: "Klara dig som turist eller flyttbar" },
  { id: "academic" as const, emoji: "🎓", label: "Akademisk", desc: "Studier, uppsatser, akademiskt språk" },
  { id: "casual" as const, emoji: "☕", label: "Vardag", desc: "Småprata, hänga, vardagsfraser" },
];

function Step3({
  lang,
  pickedTracks,
  onToggle,
  onBack,
  onNext,
  canNext,
  idx,
  total,
}: {
  lang: LangCode;
  pickedTracks: TrackId[];
  onToggle: (t: TrackId) => void;
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
        <p className="text-slate-300">
          Välj ett eller flera mål — vi blandar in vokabulär från alla.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ONBOARDING_TRACKS.map((t, i) => {
          const isSel = pickedTracks.includes(t.id);
          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => onToggle(t.id)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-4 rounded-2xl p-4 text-left transition-all glass border-white/10",
                isSel
                  ? "ring-2 ring-cyan-400 glow-cyan bg-gradient-to-br from-cyan-500/20 to-violet-500/15"
                  : "hover:border-white/30",
              )}
            >
              <div className="text-4xl shrink-0">{t.emoji}</div>
              <div className="min-w-0">
                <div className="font-semibold text-base">{t.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
              </div>
              {isSel && (
                <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-white shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </span>
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

/* ---------- Step 4: välj persona (per språk) ---------- */
function StepPersona({
  lang,
  picked,
  onPick,
  onBack,
  onNext,
  canNext,
  idx,
  total,
}: {
  lang: LangCode;
  picked: PersonaId | null;
  onPick: (id: PersonaId) => void;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
  idx: number;
  total: number;
}) {
  const language = LANGUAGES.find((l) => l.code === lang)!;
  const accentRing: Record<string, string> = {
    rose: "ring-rose-400 from-rose-500/25 to-pink-500/15",
    violet: "ring-violet-400 from-violet-500/25 to-indigo-500/15",
    amber: "ring-amber-400 from-amber-500/25 to-orange-500/15",
    cyan: "ring-cyan-400 from-cyan-500/25 to-sky-500/15",
  };
  return (
    <div className="space-y-6 px-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-sm text-slate-400">
          <span>{idx + 1} av {total}</span>
          <span>·</span>
          <span className="text-2xl">{language.flag}</span>
          <span>{language.name}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold">Vem ska din Hectór vara?</h2>
        <p className="text-slate-300">
          Din Hectór sätter tonen i samtalen. Du kan byta när som helst.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PERSONAS.map((p, i) => {
          const sel = picked === p.id;
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => onPick(p.id)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative flex items-start gap-3 rounded-2xl p-4 text-left glass border-white/10 transition-all",
                sel
                  ? `ring-2 bg-gradient-to-br ${accentRing[p.accent]}`
                  : "hover:border-white/30",
              )}
            >
              <div className="text-4xl shrink-0">{p.emoji}</div>
              <div className="min-w-0">
                <div className="font-semibold text-base">{p.name}</div>
                <div className="text-xs text-slate-300 mt-0.5">{p.pitch}</div>
                <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">{p.bio}</div>
              </div>
              {sel && (
                <span className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </motion.button>
          );
        })}
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

/* ---------- Step 5: röst-baserad nivå-test (per språk) ---------- */
function StepLevelTest({
  lang,
  onLevel,
  onSkip,
  onBack,
  idx,
  total,
}: {
  lang: LangCode;
  onLevel: (lvl: CefrLevel) => void;
  onSkip: () => void;
  onBack: () => void;
  idx: number;
  total: number;
}) {
  const language = LANGUAGES.find((l) => l.code === lang)!;
  return (
    <div className="space-y-4 px-4">
      <div className="text-center text-xs text-slate-400 inline-flex items-center justify-center gap-2 w-full">
        <span>{idx + 1} av {total}</span>
        <span>·</span>
        <span className="text-lg">{language.flag}</span>
        <span>{language.name}</span>
      </div>
      <VoiceLevelTest lang={lang} onDone={onLevel} onSkip={onSkip} />
      <div className="flex items-center justify-start pt-2">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Tillbaka</Button>
      </div>
    </div>
  );
}

/* ---------- Step 6: schemamallar (MULTI) ---------- */
function StepSchedule({
  picked,
  onToggle,
  onBack,
  onFinish,
  canFinish,
}: {
  picked: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onFinish: () => void;
  canFinish: boolean;
}) {
  const skipSelected = picked.includes(SKIP_TEMPLATE_ID);

  return (
    <div className="space-y-6 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold">När vill du öva?</h2>
        <p className="text-slate-300">
          Välj alla rutiner som passar din dag — vi planerar ihop det.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCHEDULE_TEMPLATES.map((tpl, i) => {
          const isSel = picked.includes(tpl.id);
          return (
            <motion.button
              key={tpl.id}
              type="button"
              onClick={() => onToggle(tpl.id)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-4 rounded-2xl p-4 text-left transition-all glass border-white/10",
                isSel
                  ? "ring-2 ring-pink-400 glow-pink bg-gradient-to-br from-pink-500/15 to-violet-500/15"
                  : "hover:border-white/30",
                skipSelected && !isSel && "opacity-50",
              )}
            >
              <div className="text-4xl shrink-0">{tpl.emoji}</div>
              <div className="min-w-0">
                <div className="font-semibold">{tpl.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{tpl.desc}</div>
              </div>
              {isSel && (
                <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-white shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </motion.button>
          );
        })}

        {/* Skip-mall — mutually exclusive */}
        <motion.button
          type="button"
          onClick={() => onToggle(SKIP_TEMPLATE_ID)}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-4 rounded-2xl p-4 text-left glass border-white/10 transition-all",
            skipSelected
              ? "ring-2 ring-slate-400 bg-slate-500/15"
              : "hover:border-white/30",
            !skipSelected && picked.length > 0 && "opacity-50",
          )}
        >
          <div className="text-4xl shrink-0">🪶</div>
          <div className="min-w-0">
            <div className="font-semibold">Hoppa över schema</div>
            <div className="text-xs text-slate-400 mt-0.5">Jag fixar det själv senare</div>
          </div>
          {skipSelected && (
            <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-white shrink-0">
              <Check className="h-3.5 w-3.5" />
            </span>
          )}
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
