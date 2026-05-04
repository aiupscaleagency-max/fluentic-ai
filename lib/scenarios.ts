// Roll-spel-scenarier — 6 st, samma över alla språk
import type { LangCode } from "./languages";
import { getLanguage } from "./languages";

export interface Scenario {
  id: string;
  title: string;        // svensk titel
  emoji: string;
  level: "A2" | "B1" | "B2";
  // Persona-prompt på engelska för Claude (lättare att styra)
  personaForLang: (lang: LangCode) => string;
  // Vad användaren ska försöka göra
  goalSv: string;
}

function langName(lang: LangCode): string {
  const l = getLanguage(lang);
  return l ? l.native : lang;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "cafe",
    title: "Beställa kaffe på café",
    emoji: "☕",
    level: "A2",
    goalSv: "Beställ en kaffe och något att äta. Fråga om priset.",
    personaForLang: (lang) =>
      `You are a friendly barista at a small café in a ${langName(lang)}-speaking city. Greet the user, ask what they want, suggest pastries, take their order, and tell them the price. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short (1-2 sentences) so the user gets to talk.`,
  },
  {
    id: "airport",
    title: "På flygplatsen / incheckning",
    emoji: "✈️",
    level: "B1",
    goalSv: "Checka in, lämna bagage och fråga om gate.",
    personaForLang: (lang) =>
      `You are a check-in agent at an international airport speaking ${langName(lang)}. Ask for passport and ticket, ask about luggage, give boarding info and gate. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short.`,
  },
  {
    id: "party",
    title: "Träffa någon ny på en fest",
    emoji: "🎉",
    level: "A2",
    goalSv: "Presentera dig och småprata om var ni kommer från, jobb och intressen.",
    personaForLang: (lang) =>
      `You are a friendly stranger at a casual party. Introduce yourself in ${langName(lang)}, ask the user where they're from, what they do, and chat naturally. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short and warm.`,
  },
  {
    id: "apartment",
    title: "Hyra en lägenhet",
    emoji: "🏠",
    level: "B1",
    goalSv: "Fråga om hyra, antal rum, depositionsavgift och visning.",
    personaForLang: (lang) =>
      `You are a landlord showing an apartment, speaking ${langName(lang)}. Greet the user, describe the apartment, answer questions about rent, deposit, and viewings. Stay in character. Speak ONLY ${langName(lang)}.`,
  },
  {
    id: "doctor",
    title: "Hos läkaren",
    emoji: "🩺",
    level: "B1",
    goalSv: "Beskriv dina symptom och svara på läkarens frågor.",
    personaForLang: (lang) =>
      `You are a calm general practitioner doctor speaking ${langName(lang)}. Greet the patient, ask what's wrong, ask follow-up questions about symptoms, and suggest next steps. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short.`,
  },
  {
    id: "interview",
    title: "Jobbintervju",
    emoji: "💼",
    level: "B2",
    goalSv: "Presentera dig professionellt och svara på intervjuarens frågor.",
    personaForLang: (lang) =>
      `You are a hiring manager conducting a job interview in ${langName(lang)}. Greet the candidate, ask about background, strengths, motivation and one challenging question. Stay in character. Speak ONLY ${langName(lang)}. Keep questions focused.`,
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
