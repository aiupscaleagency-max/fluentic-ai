// Språk-metadata för Fluentic AI MVP
export type LangCode = "es" | "en" | "fr" | "ar";

export interface Language {
  code: LangCode;
  name: string; // Svenskt namn
  native: string; // Egennamn på språket
  dir: "ltr" | "rtl";
  flag: string;
  bcp47: string; // Används av Web Speech API
}

export const LANGUAGES: Language[] = [
  { code: "es", name: "Spanska", native: "Español", dir: "ltr", flag: "🇪🇸", bcp47: "es-ES" },
  { code: "en", name: "Engelska", native: "English", dir: "ltr", flag: "🇬🇧", bcp47: "en-US" },
  { code: "fr", name: "Franska", native: "Français", dir: "ltr", flag: "🇫🇷", bcp47: "fr-FR" },
  { code: "ar", name: "Arabiska", native: "العربية", dir: "rtl", flag: "🇸🇦", bcp47: "ar-SA" },
];

export function getLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

export function isValidLangCode(code: string): code is LangCode {
  return LANGUAGES.some((l) => l.code === code);
}
