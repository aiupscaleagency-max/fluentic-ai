"use client";

// Klient-helper för Gemini TTS — ersätter Web Speech API på alla ställen där
// vi spelar tal. Cachar audio i sessionStorage som blob-URLs så samma fras inte
// triggar fetch igen inom samma session.
//
// Fallback: om /api/tts failar (offline, rate-limit, etc) — använder Web Speech API.

import type { LangCode } from "./languages";
import type { PersonaId } from "./personas";

// Prebuilt-röster i Gemini TTS som låter naturliga och passar olika språk.
// Samma röst kan användas för alla språk (Gemini hanterar accent automatiskt),
// men vi mappar till specifika röster per språk + persona för konsistent karaktär.
const VOICE_BY_LANG: Record<LangCode, string> = {
  es: "Aoede",       // varm, naturligt mjuk — passar latinska språk
  en: "Charon",      // tydlig, neutral engelska
  fr: "Leda",        // mjuk feminin franska
  ar: "Algenib",     // tydlig, fungerar bra för arabiska
};

// Persona-specifika röster — Hectór, Maritza, Adison har egna identiteter
const PERSONA_VOICES: Partial<Record<PersonaId, string>> = {
  sofia: "Aoede",      // varm, vänlig
  marco: "Iapetus",    // strängare, manlig
  luna: "Puck",        // peppig, lekfull
  diego: "Charon",     // lugn, akademisk
};

// Maritza & Adison har fasta röster
export const MARITZA_VOICE = "Kore";    // varm, professionell
export const ADISON_VOICE = "Orus";     // tydlig, neutral (live-tolk)

export interface SpeakOpts {
  /** Persona som pratar (Hectór's varianter) — väljs framför lang-default */
  personaId?: PersonaId;
  /** Språk för fallback-Web-Speech BCP47 (sv-SE, es-ES osv) */
  bcp47?: string;
  /** Specifik voice-id (övergrupperar allt) */
  voice?: string;
  /** Stil-instruktion till modellen ("Säg detta peppigt och varmt:") */
  styleHint?: string;
  /** Callback när uppspelning faktiskt börjar */
  onStart?: () => void;
  /** Callback när uppspelning är klar */
  onEnd?: () => void;
  /** Callback vid fel (t.ex. rate-limit) — fall tillbaka till Web Speech */
  onError?: () => void;
}

// Vi håller ETT aktivt audio-element så vi alltid kan stoppa pågående uppspelning
let currentAudio: HTMLAudioElement | null = null;

export function stopSpeaking(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = "";
    } catch { /* tyst */ }
    currentAudio = null;
  }
  // Stoppa även Web Speech om den används som fallback
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function pickVoice(lang: LangCode, opts: SpeakOpts | undefined): string {
  if (opts?.voice) return opts.voice;
  if (opts?.personaId && PERSONA_VOICES[opts.personaId]) {
    return PERSONA_VOICES[opts.personaId]!;
  }
  return VOICE_BY_LANG[lang] ?? "Kore";
}

function fallbackWebSpeech(text: string, opts: SpeakOpts | undefined): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts?.onEnd?.();
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  if (opts?.bcp47) utter.lang = opts.bcp47;
  utter.onstart = () => opts?.onStart?.();
  utter.onend = () => opts?.onEnd?.();
  utter.onerror = () => opts?.onEnd?.();
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

/**
 * Spela tal via Gemini TTS API. Caching och fallback-logik inkluderad.
 * Returns: cleanup-funktion som stoppar uppspelningen om man kallar den.
 */
export async function speakAi(text: string, lang: LangCode, opts?: SpeakOpts): Promise<() => void> {
  if (!text || typeof window === "undefined") {
    opts?.onEnd?.();
    return () => undefined;
  }

  // Stoppa eventuell pågående uppspelning först
  stopSpeaking();

  const voice = pickVoice(lang, opts);
  const cacheKey = `tts:${voice}|${opts?.styleHint ?? ""}|${text}`;

  // Försök hämta från sessionStorage — annars hämta från API
  let blobUrl: string | null = null;
  try {
    blobUrl = window.sessionStorage.getItem(cacheKey);
  } catch { /* tyst */ }

  if (!blobUrl) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, styleHint: opts?.styleHint }),
      });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);
      try {
        window.sessionStorage.setItem(cacheKey, blobUrl);
      } catch { /* quota — best-effort */ }
    } catch (e) {
      // Fallback till Web Speech vid API-fel
      console.warn("Gemini TTS failade, faller tillbaka till Web Speech:", e);
      opts?.onError?.();
      fallbackWebSpeech(text, opts);
      return stopSpeaking;
    }
  }

  // Spela upp via <audio>-element
  const audio = new Audio(blobUrl);
  currentAudio = audio;
  audio.onplay = () => opts?.onStart?.();
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
    opts?.onEnd?.();
  };
  audio.onerror = () => {
    if (currentAudio === audio) currentAudio = null;
    // Fallback till Web Speech om browser inte kan spela WAV (sällsynt)
    opts?.onError?.();
    fallbackWebSpeech(text, opts);
  };
  try {
    await audio.play();
  } catch {
    // Autoplay-block etc → fallback
    fallbackWebSpeech(text, opts);
  }
  return stopSpeaking;
}
