// Track = vad användaren vill använda språket till. Per språk i localStorage.
// Påverkar vokabulär, scenarier och tutor-fokus.
"use client";

import * as React from "react";
import type { LangCode } from "./languages";

export type TrackId = "general" | "business" | "travel" | "academic" | "casual";

export interface Track {
  id: TrackId;
  label: string;       // svenskt UI-namn
  shortLabel: string;  // kort version till badges
  description: string; // svensk beskrivning
  emoji: string;
  // Engelsk fras som vi häller in i system-prompt:
  // "Focus vocabulary and examples on {focus} contexts."
  focus: string;
}

export const TRACKS: Track[] = [
  {
    id: "general",
    label: "Allmän",
    shortLabel: "Allmän",
    description: "Bred vardag — passar för alla situationer.",
    emoji: "🌐",
    focus: "general everyday",
  },
  {
    id: "business",
    label: "Business",
    shortLabel: "Business",
    description: "Möten, mejl, förhandling och jobb-jargong.",
    emoji: "💼",
    focus: "business and professional workplace",
  },
  {
    id: "travel",
    label: "Resa",
    shortLabel: "Resa",
    description: "Flyg, hotell, restaurang och navigering.",
    emoji: "✈️",
    focus: "travel and tourism",
  },
  {
    id: "academic",
    label: "Akademisk",
    shortLabel: "Akademisk",
    description: "Studier, forskning och formellt språk.",
    emoji: "🎓",
    focus: "academic and university",
  },
  {
    id: "casual",
    label: "Vardag",
    shortLabel: "Vardag",
    description: "Småprat, slang och avslappnade hangouts.",
    emoji: "💬",
    focus: "casual conversation and small talk",
  },
];

const TRACK_PREFIX = "fluentic.track.";
const DEFAULT_TRACK: TrackId = "general";

export function getTrack(lang: LangCode): TrackId {
  if (typeof window === "undefined") return DEFAULT_TRACK;
  try {
    const v = window.localStorage.getItem(TRACK_PREFIX + lang);
    if (v && TRACKS.some((t) => t.id === v)) return v as TrackId;
    return DEFAULT_TRACK;
  } catch {
    return DEFAULT_TRACK;
  }
}

export function setTrack(lang: LangCode, track: TrackId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRACK_PREFIX + lang, track);
    window.dispatchEvent(
      new CustomEvent("fluentic:track-changed", { detail: { lang, track } }),
    );
  } catch {
    // ignorera
  }
}

export function getTrackMeta(id: TrackId): Track {
  return TRACKS.find((t) => t.id === id) ?? TRACKS[0];
}

// Hook: lyssnar på track-changed så UI uppdateras direkt
export function useTrack(lang: LangCode): TrackId {
  const [track, setTrackState] = React.useState<TrackId>(DEFAULT_TRACK);
  React.useEffect(() => {
    setTrackState(getTrack(lang));
    function onChange(e: Event) {
      const detail = (e as CustomEvent<{ lang: string; track: TrackId }>).detail;
      if (detail?.lang === lang) setTrackState(detail.track);
    }
    window.addEventListener("fluentic:track-changed", onChange);
    return () => window.removeEventListener("fluentic:track-changed", onChange);
  }, [lang]);
  return track;
}
