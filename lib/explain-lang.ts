// Förklaringsspråk per inlärningsspråk.
// Mike vill kunna lära sig t.ex. arabiska MED spanska förklaringar
// (träna sitt andraspråk samtidigt som han lär ett nytt).
// Sparas i localStorage som `fluentic.explain.{targetLang}`.
"use client";

import * as React from "react";
import type { LangCode } from "./languages";

export type ExplainLang = "sv" | "es" | "en";

export interface ExplainLangMeta {
  code: ExplainLang;
  label: string;   // svenskt UI-namn
  native: string;  // egennamn
  flag: string;
}

export const EXPLAIN_LANGS: ExplainLangMeta[] = [
  { code: "sv", label: "Svenska", native: "Svenska", flag: "🇸🇪" },
  { code: "es", label: "Spanska", native: "Español", flag: "🇪🇸" },
  { code: "en", label: "Engelska", native: "English", flag: "🇬🇧" },
];

const PREFIX = "fluentic.explain.";
const DEFAULT_EXPLAIN: ExplainLang = "sv";

function isExplainLang(v: string | null): v is ExplainLang {
  return v === "sv" || v === "es" || v === "en";
}

export function getExplainLang(targetLang: LangCode): ExplainLang {
  if (typeof window === "undefined") return DEFAULT_EXPLAIN;
  try {
    const v = window.localStorage.getItem(PREFIX + targetLang);
    return isExplainLang(v) ? v : DEFAULT_EXPLAIN;
  } catch {
    return DEFAULT_EXPLAIN;
  }
}

export function setExplainLang(targetLang: LangCode, explainLang: ExplainLang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + targetLang, explainLang);
    window.dispatchEvent(
      new CustomEvent("fluentic:explain-lang-changed", {
        detail: { lang: targetLang, explainLang },
      }),
    );
  } catch {
    // ignorera
  }
}

// Hjälpare för UI: hämta meta från kod
export function getExplainLangMeta(code: ExplainLang): ExplainLangMeta {
  return EXPLAIN_LANGS.find((l) => l.code === code) ?? EXPLAIN_LANGS[0];
}

// Namn på språket "skrivet på sig själv" — används i prompts till LLM.
export function explainLangName(code: ExplainLang): string {
  switch (code) {
    case "sv": return "svenska";
    case "es": return "español";
    case "en": return "English";
  }
}

// Hook så React-komponenter uppdateras direkt när användaren byter förklaringsspråk
export function useExplainLang(targetLang: LangCode): ExplainLang {
  const [explain, setExplain] = React.useState<ExplainLang>(DEFAULT_EXPLAIN);
  React.useEffect(() => {
    setExplain(getExplainLang(targetLang));
    function onChange(e: Event) {
      const detail = (e as CustomEvent<{ lang: string; explainLang: ExplainLang }>).detail;
      if (detail?.lang === targetLang) setExplain(detail.explainLang);
    }
    window.addEventListener("fluentic:explain-lang-changed", onChange);
    return () => window.removeEventListener("fluentic:explain-lang-changed", onChange);
  }, [targetLang]);
  return explain;
}
