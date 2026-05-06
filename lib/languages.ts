// Språk-metadata för Fluentic AI MVP
export type LangCode = "es" | "en" | "fr" | "ar";
type UiLang = "sv" | "es" | "en";

export interface Language {
  code: LangCode;
  name: string;            // Svenskt namn (bakåtkompat default)
  native: string;          // Egennamn på språket
  dir: "ltr" | "rtl";
  flag: string;
  bcp47: string;
  // Namn per UI-språk för komponenter som vill visa rätt — använd
  // langNameI18n(code, uiLang) hellre än att läsa direkt
  i18nName?: Record<UiLang, string>;
}

export const LANGUAGES: Language[] = [
  { code: "es", name: "Spanska",  native: "Español",   dir: "ltr", flag: "🇪🇸", bcp47: "es-ES",
    i18nName: { sv: "Spanska",  es: "español",  en: "Spanish" } },
  { code: "en", name: "Engelska", native: "English",   dir: "ltr", flag: "🇬🇧", bcp47: "en-US",
    i18nName: { sv: "Engelska", es: "inglés",   en: "English" } },
  { code: "fr", name: "Franska",  native: "Français",  dir: "ltr", flag: "🇫🇷", bcp47: "fr-FR",
    i18nName: { sv: "Franska",  es: "francés",  en: "French" } },
  { code: "ar", name: "Arabiska", native: "العربية", dir: "rtl", flag: "🇸🇦", bcp47: "ar-SA",
    i18nName: { sv: "Arabiska", es: "árabe",    en: "Arabic" } },
];

export function getLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

export function isValidLangCode(code: string): code is LangCode {
  return LANGUAGES.some((l) => l.code === code);
}

// Returnera språkets namn på given UI-lang. Fallback: svenskt namn.
export function langNameI18n(code: string, uiLang: UiLang): string {
  const l = LANGUAGES.find((lang) => lang.code === code);
  if (!l) return code;
  return l.i18nName?.[uiLang] ?? l.name;
}
