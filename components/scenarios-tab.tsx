"use client";

import * as React from "react";
import Link from "next/link";
import type { LangCode } from "@/lib/languages";
import { SCENARIOS, type Scenario } from "@/lib/scenarios";
import { useTracks, type TrackId } from "@/lib/track";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Play } from "lucide-react";

export function ScenariosTab({ lang }: { lang: LangCode }) {
  const tracks = useTracks(lang);

  // Multi-track-prioritering: ett scenario som matchar NÅGON av användarens
  // valda tracks räknas som "primary". Om bara general är vald — visa allt.
  const { primary, others } = React.useMemo(() => {
    const realTracks: TrackId[] = tracks.filter((t) => t !== "general");
    if (realTracks.length === 0) {
      return { primary: SCENARIOS, others: [] as Scenario[] };
    }
    const matches = (s: Scenario) => s.tracks.some((st) => realTracks.includes(st));
    const p = SCENARIOS.filter(matches);
    const o = SCENARIOS.filter((s) => !matches(s));
    return { primary: p, others: o };
  }, [tracks]);

  function renderCard(s: Scenario) {
    return (
      <Card key={s.id}>
        <CardContent className="p-4 flex items-center gap-3">
          <span className="text-3xl shrink-0">{s.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{s.title}</span>
              <Badge variant="outline">{s.level}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{s.descriptionSv}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Mål: {s.goalSv}</p>
          </div>
          <Link href={`/learn/${lang}/scenario/${s.id}`}>
            <Button size="sm">
              <Play className="h-4 w-4" /> Starta
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {primary.map(renderCard)}
      </div>

      {others.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-semibold text-slate-500">Andra scenarier</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-80">
            {others.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  );
}
