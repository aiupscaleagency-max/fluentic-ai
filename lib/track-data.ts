// Server-safe del av track — bara data + ren funktioner.
// Importeras både från client (lib/track.ts) och server (api routes).
// INTE "use client" — för då blir TRACKS en client-reference på serversidan
// och TRACKS.some etc. krashar.

export type TrackId = "general" | "business" | "travel" | "academic" | "casual";

export interface Track {
  id: TrackId;
  label: string;
  shortLabel: string;
  description: string;
  emoji: string;
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

export function getTrackMeta(id: TrackId): Track {
  return TRACKS.find((t) => t.id === id) ?? TRACKS[0];
}

// Bygger en sammanfattande "focus"-fras för system-prompt baserat på flera tracks
export function tracksFocusLine(tracks: TrackId[]): string {
  const real = tracks.filter((t) => t !== "general");
  if (real.length === 0) return "";
  const focuses = real.map((t) => getTrackMeta(t).focus);
  if (focuses.length === 1) return `Focus vocabulary and examples on ${focuses[0]} contexts.`;
  const last = focuses.pop();
  return `Focus vocabulary and examples on ${focuses.join(", ")}, and ${last} contexts.`;
}
