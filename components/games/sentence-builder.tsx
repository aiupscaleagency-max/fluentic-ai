"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CheckCircle2, XCircle, ChevronRight, Volume2, RotateCcw } from "lucide-react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { useLevel } from "@/lib/use-level";
import { PHRASES } from "@/lib/phrases";
import { addXP } from "@/lib/storage";

// Sentence-builder: användaren klickar ord i rätt ordning för att bygga upp meningen.
// Klick på orden längst ner = lägg till. Klick på orden längst upp = ta bort.
// Vi shufflar målmeningens ord + lägger till 2 distraktörer från en annan fras.
export function SentenceBuilder({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const level = useLevel(lang);

  // Pick fraser i rätt nivå (om saknas — alla)
  const pool = React.useMemo(() => {
    const filtered = PHRASES.filter((p) => (level ? p.level === level : true));
    return filtered.length > 0 ? filtered : PHRASES;
  }, [level]);

  const [idx, setIdx] = React.useState(0);
  const [round, setRound] = React.useState<{ targetTokens: string[]; bank: string[] } | null>(null);
  const [picked, setPicked] = React.useState<string[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [right, setRight] = React.useState(false);

  const phrase = pool[idx % pool.length];
  const target = phrase?.text[lang] ?? "";

  // Tokenisera meningen: behåll skiljetecken som egna tokens om de står ensamma så att de syns
  function tokenize(s: string): string[] {
    // Splitta på whitespace; behåll skiljetecken-tecken inom orden (t.ex. "¿cómo")
    return s.split(/\s+/).filter((t) => t.length > 0);
  }

  React.useEffect(() => {
    if (!phrase) return;
    const tgt = tokenize(target);
    // Plocka 2 distraktor-ord från random annan fras i samma språk
    const distractors: string[] = [];
    const others = pool.filter((p) => p.id !== phrase.id);
    if (others.length > 0) {
      const otherTokens = tokenize(others[Math.floor(Math.random() * others.length)].text[lang] ?? "");
      const candidates = otherTokens.filter((t) => !tgt.includes(t));
      while (distractors.length < 2 && candidates.length > 0) {
        const j = Math.floor(Math.random() * candidates.length);
        distractors.push(candidates.splice(j, 1)[0]);
      }
    }
    const bank = [...tgt, ...distractors]
      .map((t) => ({ t, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map((o) => o.t);
    setRound({ targetTokens: tgt, bank });
    setPicked([]);
    setSubmitted(false);
    setRight(false);
  }, [idx, phrase, target, pool, lang]);

  if (!phrase || !round) return null;

  function pickToken(t: string) {
    if (submitted) return;
    setPicked((p) => [...p, t]);
  }
  function removeToken(i: number) {
    if (submitted) return;
    setPicked((p) => p.filter((_, j) => j !== i));
  }

  function check() {
    if (submitted) return;
    // Jämför token-för-token (case-insensitive, behåll skiljetecken)
    const ok = picked.length === round!.targetTokens.length &&
      picked.every((t, i) => t.toLowerCase() === round!.targetTokens[i].toLowerCase());
    setRight(ok);
    setSubmitted(true);
    if (ok) addXP(3);
  }

  function reset() {
    setPicked([]);
    setSubmitted(false);
  }

  function next() {
    setIdx((i) => i + 1);
  }

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(target);
    u.lang = language.bcp47;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  // Räkna återstående tokens i bank — som inte redan används i picked (med multiplicitet)
  const usedCount = React.useMemo(() => {
    const m: Record<string, number> = {};
    picked.forEach((t) => { m[t] = (m[t] ?? 0) + 1; });
    return m;
  }, [picked]);

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400">Bygg meningen</div>
            <div className="text-sm text-slate-300 mt-0.5">Översätt: <span className="font-semibold text-slate-100">{phrase.sv}</span></div>
          </div>
          <Badge variant="outline">Nivå {phrase.level}</Badge>
        </div>

        {/* Picked-area: orden i ordning */}
        <div
          dir={language.dir}
          lang={lang}
          className={`min-h-[88px] rounded-xl border-2 border-dashed ${
            submitted
              ? right ? "border-emerald-400 bg-emerald-500/10" : "border-red-400 bg-red-500/10 animate-shake"
              : "border-white/15 bg-white/5"
          } p-3 flex flex-wrap items-start gap-2`}
        >
          {picked.length === 0 && (
            <span className="text-xs text-slate-500 italic">Klicka på orden nedanför för att bygga meningen…</span>
          )}
          {picked.map((t, i) => (
            <motion.button
              key={`${t}-${i}`}
              type="button"
              onClick={() => removeToken(i)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.04 }}
              className="rounded-lg bg-violet-500/25 border border-violet-400/50 px-3 py-1.5 text-base font-medium text-violet-50"
              disabled={submitted}
            >
              {t}
            </motion.button>
          ))}
        </div>

        {/* Bank: tillgängliga ord */}
        <div className="flex flex-wrap gap-2" dir={language.dir} lang={lang}>
          {round.bank.map((t, i) => {
            // Hur många gånger förekommer t i banken vs picked? Disable om alla är använda
            const inBank = round.bank.filter((b) => b === t).length;
            const inPicked = usedCount[t] ?? 0;
            const usedAll = inPicked >= inBank;
            return (
              <button
                key={`${t}-${i}`}
                type="button"
                onClick={() => pickToken(t)}
                disabled={usedAll || submitted}
                className={`rounded-lg border px-3 py-1.5 text-base font-medium transition-all ${
                  usedAll
                    ? "border-white/10 bg-white/5 text-slate-500 line-through"
                    : "border-white/15 bg-white/10 hover:border-indigo-400 text-slate-100"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Result + actions */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm flex items-center gap-1 ${right ? "text-emerald-400" : "text-red-400"}`}
            >
              {right ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {right ? "Helt rätt! +3 XP" : `Rätt ordning: ${round.targetTokens.join(" ")}`}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={speak}>
              <Volume2 className="h-4 w-4" /> Lyssna
            </Button>
            {!submitted && picked.length > 0 && (
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="h-4 w-4" /> Återställ
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {!submitted ? (
              <Button onClick={check} disabled={picked.length === 0}>Kontrollera</Button>
            ) : (
              <Button onClick={next}>Nästa <ChevronRight className="h-4 w-4" /></Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
