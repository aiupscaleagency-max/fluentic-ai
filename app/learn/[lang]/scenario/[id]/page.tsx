"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLangCode, getLanguage } from "@/lib/languages";
import { getScenario } from "@/lib/scenarios";
import { VoiceCall } from "@/components/voice-call";
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
          // Vi ber om summary på svenska — egen systemprompt
          systemOverride: `You are a Swedish-speaking language coach. Read the role-play transcript between the user (learning ${language.native}) and an in-character partner. Output a single JSON object — no prose, no fences. Schema:
{
  "strengths": string[],   // 1-3 things the user did well, in Swedish
  "improvements": string[] // exactly 3 concrete improvement tips in Swedish
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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/learn/${lang}`} className="inline-flex items-center text-sm text-slate-600 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Tillbaka
        </Link>
        <LevelPicker lang={lang} />
      </div>

      <div className="text-center space-y-1">
        <div className="text-5xl">{scenario.emoji}</div>
        <h1 className="text-2xl font-bold">{scenario.title}</h1>
        <p className="text-sm text-slate-500">Mål: {scenario.goalSv}</p>
      </div>

      {!done ? (
        <VoiceCall
          lang={lang}
          systemOverride={scenario.personaForLang(lang)}
          onEnd={handleEnd}
          endLabel="Avsluta scenario"
        />
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold">Bra jobbat! +15 XP</h2>
            </div>
            {summaryLoading && <p className="text-sm text-slate-500">Skapar feedback…</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
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
    </div>
  );
}
