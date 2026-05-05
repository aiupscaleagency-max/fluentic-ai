"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import {
  getTracks,
  setTracks,
  TRACKS,
  type TrackId,
  getTrackMeta,
} from "@/lib/track";
import { Badge } from "./ui/badge";
import { Target, Check } from "lucide-react";

// Multi-select dropdown bredvid level-badge — toggle per track.
// Mike-feedback: man ska kunna kombinera flera tracks (ex: business + travel).
export function TrackPicker({ lang }: { lang: LangCode }) {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<TrackId[]>(["general"]);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setCurrent(getTracks(lang));
  }, [lang]);

  // Stäng dropdown vid klick utanför
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function toggle(id: TrackId) {
    let next: TrackId[];
    if (current.includes(id)) {
      next = current.filter((t) => t !== id);
    } else {
      next = [...current, id];
    }
    if (next.length === 0) next = ["general"]; // måste finnas minst en
    setTracks(lang, next);
    setCurrent(next);
  }

  // Visa första valda i badge + +N om fler
  const meta = getTrackMeta(current[0]);
  const extra = current.length > 1 ? ` +${current.length - 1}` : "";

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
          {meta.emoji} {meta.shortLabel}{extra}
        </Badge>
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-1">
          <div className="px-3 pt-2 pb-1 text-[11px] text-slate-500">
            Välj ett eller flera mål
          </div>
          {TRACKS.map((t) => {
            const isSel = current.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  isSel ? "bg-indigo-50 dark:bg-indigo-950/40" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{t.emoji}</span>
                  <span className="font-medium">{t.label}</span>
                  {isSel && <Check className="ml-auto h-4 w-4 text-indigo-500" />}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
