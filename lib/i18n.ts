"use client";

// Enkel i18n-helper — översätter UI-strängar till sv/es/en baserat på UI-lang.
// Inte ämnad för djup typsäkerhet utan snarare snabbhet och iterations-vänlighet.
// Lägg till nya nycklar bara här så får du den i alla 3 språk.
import { useUiLang, type UiLang } from "./ui-language";

type Dict = Record<string, Record<UiLang, string>>;

export const STRINGS: Dict = {
  // Nav
  "nav.home":       { sv: "Hem",        es: "Inicio",     en: "Home" },
  "nav.translate":  { sv: "Tolk",       es: "Intérprete", en: "Interpreter" },
  "nav.schedule":   { sv: "Schema",     es: "Horario",    en: "Schedule" },
  "nav.settings":   { sv: "Inställningar", es: "Ajustes", en: "Settings" },

  // Allmänt
  "common.back":         { sv: "Tillbaka",  es: "Atrás",       en: "Back" },
  "common.next":         { sv: "Nästa",     es: "Siguiente",   en: "Next" },
  "common.continue":     { sv: "Fortsätt",  es: "Continuar",   en: "Continue" },
  "common.cancel":       { sv: "Avbryt",    es: "Cancelar",    en: "Cancel" },
  "common.save":         { sv: "Spara",     es: "Guardar",     en: "Save" },
  "common.start":        { sv: "Starta",    es: "Empezar",     en: "Start" },
  "common.close":        { sv: "Stäng",     es: "Cerrar",      en: "Close" },
  "common.send":         { sv: "Skicka",    es: "Enviar",      en: "Send" },
  "common.listen":       { sv: "Lyssna",    es: "Escuchar",    en: "Listen" },
  "common.loading":      { sv: "Laddar…",   es: "Cargando…",   en: "Loading…" },
  "common.welcome":      { sv: "Välkommen", es: "Bienvenido",  en: "Welcome" },

  // Learn-page
  "learn.title":             { sv: "Lär dig",                          es: "Aprende",                          en: "Learn" },
  "learn.talk":              { sv: "Tala med Hector",                  es: "Habla con Hector",                 en: "Talk with Hector" },
  "learn.achievements":      { sv: "Achievements",                     es: "Logros",                           en: "Achievements" },
  "learn.lessons.heading":   { sv: "Lektioner — följ din lärväg",     es: "Lecciones — sigue tu ruta",        en: "Lessons — follow your path" },
  "learn.lessons.subtitle":  { sv: "Lås upp nästa lektion genom att klara den föregående. Nivåerna går A1 → C1.",
                                es: "Desbloquea la siguiente lección al completar la anterior. Niveles A1 → C1.",
                                en: "Unlock the next lesson by completing the previous one. Levels A1 → C1." },
  "learn.practice.heading":  { sv: "Fri övning",                       es: "Práctica libre",                   en: "Free practice" },
  "learn.practice.subtitle": { sv: "Träna enskilda färdigheter när du vill — påverkar inte lärvägen.",
                                es: "Practica habilidades individuales cuando quieras — no afecta tu ruta.",
                                en: "Practice individual skills anytime — doesn't affect your path." },
  "learn.quicklesson":       { sv: "Snabblektion",                     es: "Lección rápida",                   en: "Quick lesson" },

  // Call-page
  "call.title":         { sv: "Tala med Hector",                       es: "Habla con Hector",                 en: "Talk with Hector" },
  "call.subtitle":      { sv: "Tryck på mikrofonen och börja prata.",  es: "Pulsa el micro y empieza a hablar.", en: "Press the mic and start talking." },
  "call.free":          { sv: "Fri chatt",                             es: "Chat libre",                       en: "Free chat" },
  "call.scenario":      { sv: "Scenario",                              es: "Escenario",                        en: "Scenario" },

  // Onboarding
  "onb.welcome.title":     { sv: "Välkommen till",                       es: "Bienvenido a",                     en: "Welcome to" },
  "onb.welcome.cta":       { sv: "Sätt igång",                           es: "Empezar",                          en: "Get started" },
  "onb.persona.title":     { sv: "Vem ska din Hector vara?",             es: "¿Quién será tu Hector?",           en: "Who should your Hector be?" },
  "onb.persona.subtitle":  { sv: "Din Hector sätter tonen i samtalen. Du kan byta när som helst.",
                              es: "Tu Hector marca el tono en las conversaciones. Puedes cambiarlo cuando quieras.",
                              en: "Your Hector sets the tone in conversations. You can switch anytime." },

  // Tabs
  "tab.lesson":         { sv: "Ord & fraser",     es: "Palabras y frases", en: "Words & phrases" },
  "tab.flashcards":     { sv: "Flashcards",       es: "Flashcards",        en: "Flashcards" },
  "tab.conversation":   { sv: "Konversation",     es: "Conversación",      en: "Conversation" },
  "tab.listen":         { sv: "Lyssna & repetera", es: "Escucha y repite", en: "Listen & repeat" },
  "tab.pron":           { sv: "Uttalsövning",     es: "Pronunciación",     en: "Pronunciation" },
  "tab.scenarios":      { sv: "Scenarier",        es: "Escenarios",        en: "Scenarios" },
  "tab.match":          { sv: "Match",            es: "Empareja",          en: "Match" },
  "tab.cloze":          { sv: "Lucka",            es: "Hueco",             en: "Cloze" },
  "tab.scramble":       { sv: "Ordpussel",        es: "Rompecabezas",      en: "Word puzzle" },
  "tab.builder":        { sv: "Bygg meningen",    es: "Construye la frase",en: "Build sentence" },
  "tab.listenpick":     { sv: "Lyssna & välj",    es: "Escucha y elige",   en: "Listen & pick" },

  // Maritza chat
  "maritza.title":       { sv: "Maritza – din lärare",                     es: "Maritza – tu profesora",         en: "Maritza – your teacher" },
  "maritza.greeting":    { sv: "Hej! Jag är Maritza. Fråga vad du vill om språket eller appen.",
                            es: "¡Hola! Soy Maritza. Pregúntame lo que quieras sobre el idioma o la app.",
                            en: "Hi! I'm Maritza. Ask me anything about the language or the app." },
  "maritza.placeholder": { sv: "Skriv en fråga…",                          es: "Escribe una pregunta…",          en: "Type a question…" },
  "maritza.empty":       { sv: "Ställ en fråga, så hjälper jag dig.",      es: "Hazme una pregunta y te ayudo.", en: "Ask me a question and I'll help." },

  // UI-lang picker
  "uilang.label":        { sv: "App-språk", es: "Idioma de la app", en: "App language" },
};

export function t(key: string, lang: UiLang): string {
  const dict = STRINGS[key];
  if (!dict) return key;
  return dict[lang] ?? dict.sv ?? key;
}

export function useT(): (key: string) => string {
  const lang = useUiLang();
  return (key: string) => t(key, lang);
}
