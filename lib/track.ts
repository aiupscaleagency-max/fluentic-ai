// Track = vad användaren vill använda språket till. Per språk i localStorage.
// Påverkar vokabulär, scenarier och tutor-fokus.
//
// Multi-select: Mike vill kunna välja flera tracks per språk. Vi har därför både
// single-track-API (legacy) och nya multi-track-API. Bakåtkompat: om gammalt
// single-värde finns men inget nytt array — tolka som [det värdet].
//
// OBS: Datan + rena funktioner ligger i track-data.ts (server-safe). Den här filen
// är "use client" eftersom hooks + localStorage-API kräver det. Vi RE-EXPORTERAR
// data så befintliga importer (TRACKS, type TrackId, getTrackMeta, tracksFocusLine)
// fortsätter funka. Server-routes ska importera från ./track-data direkt.
"use client";

import * as React from "react";
import type { LangCode } from "./languages";
import {
  TRACKS,
  type Track,
  type TrackId,
  getTrackMeta,
  tracksFocusLine,
} from "./track-data";

// Re-export så befintlig kod inte går sönder
export { TRACKS, getTrackMeta, tracksFocusLine };
export type { Track, TrackId };

const TRACK_PREFIX = "fluentic.track.";              // legacy single
const TRACKS_PREFIX = "fluentic.tracks.";            // new multi (JSON-array)
const DEFAULT_TRACK: TrackId = "general";
const DEFAULT_TRACKS: TrackId[] = ["general"];

function isTrackId(v: unknown): v is TrackId {
  return TRACKS.some((t) => t.id === v);
}

// ===== Legacy single-track-API (behålls för bakåtkompat) =====

export function getTrack(lang: LangCode): TrackId {
  // Vi returnerar första track:en i multi-listan så befintliga komponenter
  // som ännu inte uppgraderats fortfarande får en vettig "primär" track.
  const list = getTracks(lang);
  return list[0] ?? DEFAULT_TRACK;
}

export function setTrack(lang: LangCode, track: TrackId): void {
  // Skriver både legacy-nyckeln OCH multi-array (med ett enda värde).
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRACK_PREFIX + lang, track);
    window.localStorage.setItem(TRACKS_PREFIX + lang, JSON.stringify([track]));
    window.dispatchEvent(
      new CustomEvent("fluentic:track-changed", { detail: { lang, track, tracks: [track] } }),
    );
  } catch {
    // ignorera
  }
}

// ===== Nya multi-track-API =====

export function getTracks(lang: LangCode): TrackId[] {
  if (typeof window === "undefined") return DEFAULT_TRACKS;
  try {
    const raw = window.localStorage.getItem(TRACKS_PREFIX + lang);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter(isTrackId) as TrackId[];
        if (filtered.length > 0) return filtered;
      }
    }
    // Fallback: läs legacy single-värde
    const legacy = window.localStorage.getItem(TRACK_PREFIX + lang);
    if (isTrackId(legacy)) return [legacy];
    return DEFAULT_TRACKS;
  } catch {
    return DEFAULT_TRACKS;
  }
}

export function setTracks(lang: LangCode, tracks: TrackId[]): void {
  if (typeof window === "undefined") return;
  // Tom lista är inte vettigt — defaulta till general.
  const safe = tracks.filter(isTrackId);
  const final = safe.length > 0 ? safe : DEFAULT_TRACKS;
  try {
    window.localStorage.setItem(TRACKS_PREFIX + lang, JSON.stringify(final));
    // Spegla första värdet till legacy så gammal kod inte ger fel-track
    window.localStorage.setItem(TRACK_PREFIX + lang, final[0]);
    window.dispatchEvent(
      new CustomEvent("fluentic:track-changed", {
        detail: { lang, track: final[0], tracks: final },
      }),
    );
  } catch {
    // ignorera
  }
}

// Alias för tydlighet i prompts/server-routes (på client)
export function getActiveTracks(lang: LangCode): TrackId[] {
  return getTracks(lang);
}

// Hook: lyssnar på track-changed så UI uppdateras direkt (single — legacy)
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

// Multi-hook: returnerar full lista
export function useTracks(lang: LangCode): TrackId[] {
  const [tracks, setTracksState] = React.useState<TrackId[]>(DEFAULT_TRACKS);
  React.useEffect(() => {
    setTracksState(getTracks(lang));
    function onChange(e: Event) {
      const detail = (e as CustomEvent<{ lang: string; tracks: TrackId[] }>).detail;
      if (detail?.lang === lang && Array.isArray(detail.tracks)) {
        setTracksState(detail.tracks);
      }
    }
    window.addEventListener("fluentic:track-changed", onChange);
    return () => window.removeEventListener("fluentic:track-changed", onChange);
  }, [lang]);
  return tracks;
}
