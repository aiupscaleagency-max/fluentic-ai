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
  "learn.talk":              { sv: "Tala med Hectór",                  es: "Habla con Hectór",                 en: "Talk with Hectór" },
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
  "call.title":         { sv: "Tala med Hectór",                       es: "Habla con Hectór",                 en: "Talk with Hectór" },
  "call.subtitle":      { sv: "Tryck på mikrofonen och börja prata.",  es: "Pulsa el micro y empieza a hablar.", en: "Press the mic and start talking." },
  "call.free":          { sv: "Fri chatt",                             es: "Chat libre",                       en: "Free chat" },
  "call.scenario":      { sv: "Scenario",                              es: "Escenario",                        en: "Scenario" },

  // Onboarding
  "onb.welcome.title":     { sv: "Välkommen till",                       es: "Bienvenido a",                     en: "Welcome to" },
  "onb.welcome.cta":       { sv: "Sätt igång",                           es: "Empezar",                          en: "Get started" },
  "onb.persona.title":     { sv: "Vem ska din Hectór vara?",             es: "¿Quién será tu Hectór?",           en: "Who should your Hectór be?" },
  "onb.persona.subtitle":  { sv: "Din Hectór sätter tonen i samtalen. Du kan byta när som helst.",
                              es: "Tu Hectór marca el tono en las conversaciones. Puedes cambiarlo cuando quieras.",
                              en: "Your Hectór sets the tone in conversations. You can switch anytime." },

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

  // Lesson path
  "path.title":           { sv: "Din lärväg",         es: "Tu ruta",                en: "Your learning path" },
  "path.subtitle":        { sv: "Klara flashcards + lucka + lyssna för att markera lektionen som klar. +20 XP per lektion.",
                            es: "Completa flashcards + hueco + escucha para marcar la lección. +20 XP por lección.",
                            en: "Complete flashcards + cloze + listen to mark the lesson done. +20 XP per lesson." },
  "path.jumpto":          { sv: "Hoppa till",         es: "Saltar a",               en: "Jump to" },
  "path.lesson.done":     { sv: "Klar",               es: "Hecho",                  en: "Done" },
  "path.lesson.active":   { sv: "Aktiv",              es: "Activa",                 en: "Active" },
  "path.lesson.steps":    { sv: "steg",               es: "pasos",                  en: "steps" },
  "path.celebrate.title": { sv: "Lektion klar!",      es: "¡Lección completada!",   en: "Lesson done!" },
  "path.celebrate.body":  { sv: "Du klarade",         es: "Has completado",         en: "You completed" },
  "path.celebrate.unlock":{ sv: "Hjärtat är ifyllt och nästa lektion är upplåst. Bra jobbat!",
                            es: "El corazón está lleno y la siguiente lección desbloqueada. ¡Bien hecho!",
                            en: "The heart is filled and the next lesson is unlocked. Great job!" },
  "path.level":           { sv: "Nivå",               es: "Nivel",                  en: "Level" },

  // Daily challenge
  "daily.title":          { sv: "Dagens utmaning",    es: "Reto diario",            en: "Daily challenge" },
  "daily.kind.call":      { sv: "Dagens samtal",      es: "Conversación del día",   en: "Today's call" },
  "daily.kind.translate": { sv: "Dagens översättning",es: "Traducción del día",     en: "Today's translation" },
  "daily.kind.listen":    { sv: "Dagens lyssning",    es: "Escucha del día",        en: "Today's listening" },
  "daily.desc.call":      { sv: "Prata 5 minuter med Hectór på målspråket.",
                            es: "Habla 5 minutos con Hectór en el idioma meta.",
                            en: "Talk 5 minutes with Hectór in the target language." },
  "daily.desc.translate": { sv: "Översätt 5 fraser till målspråket.",
                            es: "Traduce 5 frases al idioma meta.",
                            en: "Translate 5 phrases to the target language." },
  "daily.desc.listen":    { sv: "Lyssna och välj rätt översättning för 5 fraser.",
                            es: "Escucha y elige la traducción correcta de 5 frases.",
                            en: "Listen and pick the correct translation for 5 phrases." },
  "daily.startCall":      { sv: "Starta samtal",      es: "Iniciar conversación",   en: "Start call" },
  "daily.startChallenge": { sv: "Starta utmaning",    es: "Iniciar reto",           en: "Start challenge" },
  "daily.claim":          { sv: "Hämta belöning",     es: "Reclamar premio",        en: "Claim reward" },
  "daily.claimed":        { sv: "Klar idag",          es: "Hecho hoy",              en: "Done today" },
  "daily.runner.q":       { sv: "Fråga",              es: "Pregunta",               en: "Question" },
  "daily.runner.right":   { sv: "Rätt",               es: "Correcto",               en: "Correct" },
  "daily.runner.translateTo": { sv: "Översätt till",  es: "Traduce a",              en: "Translate to" },
  "daily.runner.listenPick":  { sv: "Lyssna och välj",es: "Escucha y elige",        en: "Listen and pick" },
  "daily.runner.playAgain":   { sv: "Spela igen",     es: "Reproducir",             en: "Play again" },
  "daily.runner.placeholder": { sv: "Skriv översättningen", es: "Escribe la traducción", en: "Type the translation" },
  "daily.runner.check":   { sv: "Kontrollera",        es: "Comprobar",              en: "Check" },
  "daily.runner.correctAns":  { sv: "Rätt!",          es: "¡Correcto!",             en: "Correct!" },
  "daily.runner.wrongAns":    { sv: "Rätt svar:",     es: "Respuesta correcta:",    en: "Right answer:" },
  "daily.runner.gj":      { sv: "Bra jobbat!",        es: "¡Buen trabajo!",         en: "Good job!" },
  "daily.runner.gj.body": { sv: "Du klarade",         es: "Completaste",            en: "You completed" },
  "daily.runner.gj.of":   { sv: "av",                 es: "de",                     en: "of" },

  // Word of the day
  "wotd.title":           { sv: "Dagens ord",         es: "Palabra del día",        en: "Word of the day" },

  // XP boost
  "xp.boost.title":       { sv: "x XP-helg pågår",    es: "x fin de semana XP",     en: "x XP weekend live" },
  "xp.boost.body":        { sv: "All XP du tjänar i helgen dubblas automatiskt.",
                            es: "Todo el XP que ganes este fin de semana se duplica.",
                            en: "All XP you earn this weekend is doubled." },
  "xp.boost.left":        { sv: "h kvar",             es: "h restantes",            en: "h left" },

  // Progress / streak
  "prog.xp":              { sv: "XP",                 es: "XP",                     en: "XP" },
  "prog.day":             { sv: "dag",                es: "día",                    en: "day" },
  "prog.days":            { sv: "dagar",              es: "días",                   en: "days" },
  "prog.spoken":          { sv: "Talad",              es: "Hablado",                en: "Spoken" },
  "prog.min":             { sv: "min",                es: "min",                    en: "min" },
  "prog.xp.today":        { sv: "XP idag",            es: "XP hoy",                 en: "XP today" },

  // Achievements
  "ach.title":            { sv: "Achievements",       es: "Logros",                 en: "Achievements" },
  "ach.subtitle":         { sv: "Markera milestones på din språkresa.",
                            es: "Marca hitos en tu viaje lingüístico.",
                            en: "Mark milestones on your language journey." },
  "ach.home":             { sv: "Hem",                es: "Inicio",                 en: "Home" },
  "ach.done":             { sv: "Klar",               es: "Hecho",                  en: "Done" },
  "ach.unlocked":         { sv: "Achievement upplåst",es: "Logro desbloqueado",     en: "Achievement unlocked" },

  // Generated lesson content
  "gen.preparing":        { sv: "AI:n förbereder material för",
                            es: "La IA está preparando material para",
                            en: "AI is preparing material for" },
  "gen.empty":            { sv: "Välj en aktiv lektion i lärvägen för att se ord och fraser.",
                            es: "Elige una lección activa en tu ruta para ver palabras y frases.",
                            en: "Pick an active lesson in your path to see words and phrases." },
  "gen.aiCreated":        { sv: "AI-skapat",          es: "Creado por IA",          en: "AI-generated" },
  "gen.words":            { sv: "Ord",                es: "Palabras",               en: "Words" },
  "gen.phrases":          { sv: "Fraser",             es: "Phrases",                en: "Phrases" },
  "gen.error":            { sv: "Kunde inte hämta material:", es: "No se pudo cargar:", en: "Couldn't load material:" },

  // Sentence builder
  "sb.title":             { sv: "Bygg meningen",      es: "Construye la frase",     en: "Build the sentence" },
  "sb.translate":         { sv: "Översätt:",          es: "Traduce:",               en: "Translate:" },
  "sb.empty":             { sv: "Klicka på orden nedanför för att bygga meningen…",
                            es: "Haz clic en las palabras de abajo para construir la frase…",
                            en: "Click the words below to build the sentence…" },
  "sb.allRight":          { sv: "Helt rätt! +3 XP",   es: "¡Perfecto! +3 XP",       en: "All right! +3 XP" },
  "sb.correctOrder":      { sv: "Rätt ordning:",      es: "Orden correcto:",        en: "Correct order:" },
  "sb.reset":             { sv: "Återställ",          es: "Reiniciar",              en: "Reset" },

  // Mix / quick lesson
  "mix.title":            { sv: "Snabblektion",       es: "Lección rápida",         en: "Quick lesson" },
  "mix.subtitle":         { sv: "8 turer som skiftar mellan flashcards, lucka, par-match, översättning och lyssna.",
                            es: "8 turnos que rotan entre flashcards, hueco, empareja, traducción y escucha.",
                            en: "8 turns rotating between flashcards, cloze, match, translate and listen." },
  "mix.activeLesson":     { sv: "Aktiv lektion:",     es: "Lección activa:",        en: "Active lesson:" },
  "mix.countsTowards":    { sv: "räknas mot din lärväg.", es: "cuenta para tu ruta.", en: "counts toward your path." },
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
