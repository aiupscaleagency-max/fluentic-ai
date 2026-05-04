"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { getVocab } from "@/lib/vocab";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { addXP } from "@/lib/storage";
import { RotateCcw } from "lucide-react";

type Tile = {
  id: string;
  pairId: string;
  label: string;
  side: "sv" | "target";
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function MatchGame({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const [round, setRound] = React.useState(0);
  const tiles = React.useMemo<Tile[]>(() => {
    const vocab = shuffle(getVocab(lang)).slice(0, 8);
    const pairs: Tile[] = [];
    vocab.forEach((v) => {
      pairs.push({ id: `${v.id}-sv`, pairId: v.id, label: v.sv, side: "sv" });
      pairs.push({ id: `${v.id}-tgt`, pairId: v.id, label: v.word, side: "target" });
    });
    return shuffle(pairs);
    // Behöver round i deps så vi kan starta om
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, round]);

  const [selected, setSelected] = React.useState<Tile | null>(null);
  const [matched, setMatched] = React.useState<Set<string>>(new Set());
  const [wrong, setWrong] = React.useState<Set<string>>(new Set());
  const [moves, setMoves] = React.useState(0);

  React.useEffect(() => {
    setSelected(null);
    setMatched(new Set());
    setWrong(new Set());
    setMoves(0);
  }, [tiles]);

  function pick(tile: Tile) {
    if (matched.has(tile.id) || wrong.size > 0) return;
    if (!selected) {
      setSelected(tile);
      return;
    }
    if (selected.id === tile.id) return;
    setMoves((m) => m + 1);
    if (selected.pairId === tile.pairId && selected.side !== tile.side) {
      const newMatched = new Set(matched);
      newMatched.add(selected.id);
      newMatched.add(tile.id);
      setMatched(newMatched);
      setSelected(null);
      addXP(2);
      if (newMatched.size === tiles.length) addXP(10);
    } else {
      const w = new Set([selected.id, tile.id]);
      setWrong(w);
      setTimeout(() => {
        setWrong(new Set());
        setSelected(null);
      }, 700);
    }
  }

  const allDone = matched.size === tiles.length;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Drag: {moves}</Badge>
          <Button variant="ghost" size="sm" onClick={() => setRound((r) => r + 1)}>
            <RotateCcw className="h-4 w-4" /> Ny omgång
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {tiles.map((tile) => {
            const isMatched = matched.has(tile.id);
            const isWrong = wrong.has(tile.id);
            const isSelected = selected?.id === tile.id;
            return (
              <button
                key={tile.id}
                onClick={() => pick(tile)}
                disabled={isMatched}
                dir={tile.side === "target" ? language.dir : "ltr"}
                lang={tile.side === "target" ? lang : "sv"}
                className={`min-h-16 rounded-lg p-2 text-sm font-medium transition-colors border ${
                  isMatched
                    ? "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200 opacity-60"
                    : isWrong
                      ? "bg-red-100 border-red-300 text-red-800"
                      : isSelected
                        ? "bg-indigo-100 border-indigo-400 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                }`}
              >
                {tile.label}
              </button>
            );
          })}
        </div>

        {allDone && (
          <div className="text-center py-3 space-y-2">
            <p className="font-semibold">Klart! {moves} drag.</p>
            <Button onClick={() => setRound((r) => r + 1)}>Spela igen</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
