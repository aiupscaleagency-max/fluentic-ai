"use client";

// UI-språk för hela appen — sv, es eller en. Skillnad från target-language
// (det språk man LÄR sig). Sparas globalt i localStorage så det följer med
// mellan språkkurser.
import * as React from "react";

export type UiLang = "sv" | "es" | "en";

export const UI_LANGS: { code: UiLang; flag: string; native: string }[] = [
  { code: "sv", flag: "🇸🇪", native: "Svenska" },
  { code: "es", flag: "🇪🇸", native: "Español" },
  { code: "en", flag: "🇬🇧", native: "English" },
];

const KEY = "fluentic.ui-lang";

export function getUiLang(): UiLang {
  if (typeof window === "undefined") return "sv";
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "sv" || v === "es" || v === "en") return v;
  } catch { /* tyst */ }
  return "sv";
}

export function setUiLang(lang: UiLang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, lang);
    window.dispatchEvent(new CustomEvent("fluentic:ui-lang-changed", { detail: { lang } }));
  } catch { /* tyst */ }
}

export function useUiLang(): UiLang {
  const [lang, setLang] = React.useState<UiLang>("sv");
  React.useEffect(() => {
    setLang(getUiLang());
    function onChange() { setLang(getUiLang()); }
    window.addEventListener("fluentic:ui-lang-changed", onChange);
    return () => window.removeEventListener("fluentic:ui-lang-changed", onChange);
  }, []);
  return lang;
}
