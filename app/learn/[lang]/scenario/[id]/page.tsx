"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { isValidLangCode, getLanguage } from "@/lib/languages";
import { getScenario } from "@/lib/scenarios";
import { VideoCall } from "@/components/video-call";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award } from "lucide-react";
import { LevelPicker } from "@/components/level-picker";
import { useLevel } from "@/lib/use-level";
import { addXP } from "@/lib/storage";
import * as React from "react";

interface Summary {
  strengths: string[];
  improvements: string[];
}

// Scenario-specifik tutor-roll och stadsmiljö (för "Maria · Barista" etc).
// Generisk fallback om ingen matchning.
const SCENARIO_ROLES: Record<string, { role: string; gradient: string }> = {
  cafe:       { role: "Maria · Barista",          gradient: "from-amber-400 via-orange-500 to-rose-500" },
  airport:    { role: "Carlos · Säkerhetspersonal", gradient: "from-sky-400 via-indigo-500 to-violet-600" },
  party:      { role: "Alex · På festen",         gradient: "from-pink-400 via-fuchsia-500 to-violet-500" },
  apartment:  { role: "Elena · Hyresvärd",        gradient: "from-emerald-400 via-teal-500 to-cyan-500" },
  doctor:     { role: "Dr. Rivera · Läkare",      gradient: "from-cyan-300 via-blue-500 to-indigo-600" },
  interview:  { role: "Linda · HR-chef",          gradient: "from-violet-400 via-indigo-500 to-blue-600" },
  restaurant: { role: "Luca · Hovmästare",        gradient: "from-rose-400 via-red-500 to-orange-500" },
  pharmacy:   { role: "Pia · Apotekare",          gradient: "from-emerald-400 via-cyan-500 to-blue-500" },
  hotel:      { role: "Marc · Receptionist",      gradient: "from-amber-300 via-rose-400 to-violet-500" },
  coworker:   { role: "Sam · Kollega",            gradient: "from-cyan-400 via-blue-500 to-violet-500" },
};

export default function ScenarioPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = use(params);
  if (!isValidLangCode(lang)) notFound();
  const scenario = getScenario(id);
  if (!scenario) notFound();
  const language = getLanguage(lang)!;
  const level = useLevel(lang);
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const role = SCENARIO_ROLES[scenario.id] ?? {
    role: "Tutor · Scenario",
    gradient: "from-violet-500 via-indigo-500 to-cyan-500",
  };

  async function handleEnd(history: { role: "user" | "assistant"; content: string }[]) {
    setDone(true);
    if (history.length < 2) return;
    setSummaryLoading(true);
    addXP(15);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          systemOverride: `You are a Swedish-speaking language coach. Read the role-play transcript between the user (learning ${language.native}) and an in-character partner. Output a single JSON object — no prose, no fences. Schema:
{
  "strengths": string[],
  "improvements": string[]
}`,
          level,
          messages: [
            {
              role: "user",
              content: `Transkript:\n${history.map((m) => `${m.role === "user" ? "Användaren" : "Tutor"}: ${m.content}`).join("\n")}`,
            },
          ],
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error ?? "Fel");
      const match = data.reply.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Kunde inte tolka summering");
      const parsed = JSON.parse(match[0]) as Summary;
      setSummary(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-3">
        <Link href={`/learn/${lang}`} className="inline-flex items-center text-sm text-slate-300 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4 mr-1" /> Tillbaka
        </Link>
        <LevelPicker lang={lang} />
      </div>

      <div className="text-center space-y-1">
        <div className="text-5xl">{scenario.emoji}</div>
        <h1 className="text-2xl font-bold">{scenario.title}</h1>
        <p className="text-sm text-slate-400">Mål: {scenario.goalSv}</p>
      </div>

      {!done ? (
        <VideoCall
          lang={lang}
          systemOverride={scenario.personaForLang(lang)}
          greeting={scenario.openingForLang(lang)}
          onEnd={handleEnd}
          endLabel="Avsluta scenario"
          scenarioMeta={{
            badge: `${scenario.emoji} ${scenario.title} — ${scenario.goalSv}`,
            tutorRole: role.role,
            gradient: role.gradient,
          }}
        />
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-violet-300" />
              <h2 className="text-lg font-semibold">Bra jobbat! +15 XP</h2>
            </div>
            {summaryLoading && <p className="text-sm text-slate-400">Skapar feedback…</p>}
            {error && <p className="text-sm text-rose-300">{error}</p>}
            {summary && (
              <>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Det här gjorde du bra</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {summary.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Tre saker att förbättra</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {summary.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            <div className="flex gap-2 pt-2">
              <Link href={`/learn/${lang}`}>
                <Button>Tillbaka till lektioner</Button>
              </Link>
              <Button variant="outline" onClick={() => { setDone(false); setSummary(null); setError(null); }}>
                Kör scenariot igen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
