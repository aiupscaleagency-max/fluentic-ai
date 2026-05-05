"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getTrack, setTrack, TRACKS, type TrackId, getTrackMeta } from "@/lib/track";
import { Badge } from "./ui/badge";
import { Target } from "lucide-react";

// Dropdown bredvid level-badge — direktbyte utan reload.
export function TrackPicker({ lang }: { lang: LangCode }) {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<TrackId>("general");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setCurrent(getTrack(lang));
  }, [lang]);

  // Stäng dropdown vid klick utanför
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function pick(id: TrackId) {
    setTrack(lang, id);
    setCurrent(id);
    setOpen(false);
  }

  const meta = getTrackMeta(current);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex"
        aria-label="Byt fokus / track"
      >
        <Badge
          variant="outline"
          className="gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Target className="h-3 w-3" />
          {meta.emoji} {meta.shortLabel}
        </Badge>
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-1">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => pick(t.id)}
              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                current === t.id ? "bg-indigo-50 dark:bg-indigo-950/40" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{t.emoji}</span>
                <span className="font-medium">{t.label}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
