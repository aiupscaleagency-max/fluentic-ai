// CEFR-nivåer (A1–C1) per språk. Lagras separat per språk i localStorage.
import type { LangCode } from "./languages";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export const CEFR_DESCRIPTIONS: Record<CefrLevel, string> = {
  A1: "Nybörjare — enkla fraser, presentation, vardagsord",
  A2: "Grundläggande — korta dialoger, beställa, beskriva enkelt",
  B1: "Mellannivå — resa, jobb, åsikter, dåtid och framtid",
  B2: "Övre mellan — komplexa diskussioner, nyheter, abstrakta ämnen",
  C1: "Avancerad — flytande, idiom, nyanser och ironi",
};

const LEVEL_PREFIX = "fluentic.level.";

export function getLevel(lang: LangCode): CefrLevel | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(LEVEL_PREFIX + lang);
    if (!v) return null;
    if ((CEFR_LEVELS as string[]).includes(v)) return v as CefrLevel;
    return null;
  } catch {
    return null;
  }
}

export function setLevel(lang: LangCode, level: CefrLevel): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEVEL_PREFIX + lang, level);
    // Skicka eget event så badges/ringar uppdateras direkt utan att vänta på poll
    window.dispatchEvent(new CustomEvent("fluentic:level-changed", { detail: { lang, level } }));
  } catch {
    // ignorera
  }
}

// Sätter nivån OCH justerar lärvägens startpunkt — markerar lägre nivåer som klara
// och sätter första olästa på vald nivå som aktiv. Använd denna i LevelPicker och
// VoiceLevelTest så användaren hamnar på rätt plats utan att behöva klicka manuellt.
export async function setLevelAndApplyStartingPoint(lang: LangCode, level: CefrLevel): Promise<void> {
  setLevel(lang, level);
  // Lazy-imports för att undvika cirkulära beroenden vid build-tid
  const [{ getLessons }, { applyLevelStartingPoint }] = await Promise.all([
    import("./lessons"),
    import("./storage"),
  ]);
  applyLevelStartingPoint(lang, level, getLessons(lang));
}

export function levelGuidance(level: CefrLevel): string {
  // Konkret stilanvisning som vi häller in i system prompts
  switch (level) {
    case "A1":
      return "Use only the simplest A1 vocabulary. Sentences must be 3-6 words. Present tense only. Avoid idioms.";
    case "A2":
      return "Use A2 vocabulary. Short sentences (max 8 words). Simple past and present. Common everyday topics.";
    case "B1":
      return "Use B1 vocabulary. Sentences up to 12 words. Past, present and future tenses. Travel, work, opinions.";
    case "B2":
      return "Use B2 vocabulary. Complex sentences allowed. Abstract topics and nuance ok. Some idioms.";
    case "C1":
      return "Use rich C1 vocabulary. Idioms, irony and nuance encouraged. Complex grammar fine.";
  }
}
