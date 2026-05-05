// Server-safe del av explain-lang — används i API-routes (utan "use client").
// Ger system-prompt-fragment per förklaringsspråk.

export type ExplainLang = "sv" | "es" | "en";

export function isExplainLang(v: unknown): v is ExplainLang {
  return v === "sv" || v === "es" || v === "en";
}

export interface ExplainGuidance {
  langName: string;     // "svenska" | "español" | "English"
  italicLabel: string;  // rubrik på den kursiva översättningsraden i chat
  correctVerb: string;  // hur tutorn ska "rätta vänligt" på rätt språk
  // Engelska bitar som ligger i system-prompts (för voice + role-play): vilket språk förklaringar ska skrivas på
  englishName: string;
}

export function explainGuidance(explainLang: ExplainLang): ExplainGuidance {
  switch (explainLang) {
    case "es":
      return {
        langName: "español",
        italicLabel: "Traducción en español",
        correctVerb: "corrige amablemente en español",
        englishName: "Spanish",
      };
    case "en":
      return {
        langName: "English",
        italicLabel: "English translation",
        correctVerb: "kindly correct in English",
        englishName: "English",
      };
    case "sv":
    default:
      return {
        langName: "svenska",
        italicLabel: "Svensk översättning",
        correctVerb: "rätta vänligt på svenska",
        englishName: "Swedish",
      };
  }
}
