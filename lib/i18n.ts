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

  // Tolk-FAB
  "interp.title":         { sv: "Tolk",                es: "Intérprete",             en: "Interpreter" },
  "interp.subtitle":      { sv: "Live-översättning under samtal", es: "Traducción en vivo en llamadas", en: "Live translation during calls" },
  "interp.openFull":      { sv: "Öppna full tolk",     es: "Abrir intérprete",       en: "Open full interpreter" },
  "interp.always":        { sv: "Alltid tillgänglig",  es: "Siempre disponible",     en: "Always available" },

  // Learn-page hero
  "learn.continue":       { sv: "Fortsätt din lektion",es: "Continúa tu lección",    en: "Continue your lesson" },
  "learn.startFirst":     { sv: "Starta din första lektion", es: "Empieza tu primera lección", en: "Start your first lesson" },
  "learn.lessonsHeader":  { sv: "Lektioner",           es: "Lecciones",              en: "Lessons" },

  // Landing page
  "landing.login":        { sv: "Logga in",            es: "Iniciar sesión",         en: "Log in" },
  "landing.signup":       { sv: "Skapa konto",         es: "Crear cuenta",           en: "Sign up" },
  "landing.hero.title":   { sv: "Lär dig språk på det",es: "Aprende idiomas de la",  en: "Learn languages the" },
  "landing.hero.highlight":{sv: "roliga sättet",       es: "manera divertida",       en: "fun way" },
  "landing.hero.subtitle":{ sv: "AI-tutor Hectór, snabb-stöd Maritza, live-tolk Adison och daglig träning. Spanska, engelska, franska och arabiska.",
                            es: "Tutor IA Hectór, ayuda rápida Maritza, intérprete en vivo Adison y práctica diaria. Español, inglés, francés y árabe.",
                            en: "AI tutor Hectór, quick-helper Maritza, live interpreter Adison and daily practice. Spanish, English, French and Arabic." },
  "landing.hero.cta":     { sv: "Kom igång gratis",    es: "Empieza gratis",         en: "Get started free" },
  "landing.hero.social":  { sv: "Talad av tusentals användare", es: "Hablado por miles de usuarios", en: "Spoken by thousands of users" },

  "landing.features.title":   { sv: "Allt du behöver för att bli flytande", es: "Todo lo que necesitas para ser fluido", en: "Everything you need to get fluent" },
  "landing.features.subtitle":{ sv: "Praktika-style lärning, men på svenska och med personliga AI-lärare.",
                                es: "Aprendizaje al estilo Praktika, pero en tu idioma con tutores IA personales.",
                                en: "Praktika-style learning, but with personal AI tutors in your language." },
  "landing.feat1.title":  { sv: "Tala med Hectór",     es: "Habla con Hectór",       en: "Talk with Hectór" },
  "landing.feat1.body":   { sv: "Riktiga röst-samtal med din AI-tutor. Han rättar dig på direkten och svarar naturligt.",
                            es: "Conversaciones reales por voz con tu tutor IA. Te corrige al instante y responde con naturalidad.",
                            en: "Real voice calls with your AI tutor. He corrects you on the spot and replies naturally." },
  "landing.feat2.title":  { sv: "Live-tolk Adison",    es: "Intérprete en vivo Adison", en: "Live interpreter Adison" },
  "landing.feat2.body":   { sv: "Översätter under riktiga samtal — funkar lika bra på resa som hemma.",
                            es: "Traduce durante conversaciones reales — perfecto en viajes y en casa.",
                            en: "Translates during real calls — works just as well travelling or at home." },
  "landing.feat3.title":  { sv: "40 lektioner CEFR A1–C1", es: "40 lecciones CEFR A1–C1", en: "40 lessons CEFR A1–C1" },
  "landing.feat3.body":   { sv: "Strukturerad lärväg från nybörjare till flytande, baserad på Cambridge-standarder.",
                            es: "Camino estructurado de principiante a fluido, basado en estándares de Cambridge.",
                            en: "Structured path from beginner to fluent, based on Cambridge standards." },
  "landing.feat4.title":  { sv: "Achievements & XP",   es: "Logros y XP",            en: "Achievements & XP" },
  "landing.feat4.body":   { sv: "12 låsbara badges, daglig utmaning och 2x XP-helger. Håll motivationen uppe.",
                            es: "12 logros desbloqueables, reto diario y fin de semana 2x XP. Mantente motivado.",
                            en: "12 unlockable badges, daily challenge and 2x XP weekends. Stay motivated." },
  "landing.feat5.title":  { sv: "Snabb-stöd Maritza",  es: "Ayuda rápida Maritza",   en: "Quick-help Maritza" },
  "landing.feat5.body":   { sv: "Mamma-figuren som svarar direkt när du fastnar — på ditt eget språk.",
                            es: "La figura materna que responde al instante cuando te bloqueas — en tu idioma.",
                            en: "The mother figure who answers instantly when you get stuck — in your own language." },
  "landing.feat6.title":  { sv: "För hela familjen",   es: "Para toda la familia",   en: "For the whole family" },
  "landing.feat6.body":   { sv: "Family-medlemskap för upp till 5 personer. Alla får sina egna profiler och tutorer.",
                            es: "Membresía Family para hasta 5 personas. Cada uno con su perfil y tutor.",
                            en: "Family plan for up to 5 people. Everyone gets their own profile and tutor." },

  "landing.how.title":    { sv: "Så funkar det",       es: "Cómo funciona",          en: "How it works" },
  "landing.how.subtitle": { sv: "3 steg till ditt första samtal på spanska.", es: "3 pasos hasta tu primera conversación.", en: "3 steps to your first conversation." },
  "landing.step1.title":  { sv: "Skapa konto",         es: "Crea tu cuenta",         en: "Create account" },
  "landing.step1.body":   { sv: "Sätter upp profil, väljer språk och nivå på under 1 minut.", es: "Configuras perfil, idioma y nivel en menos de 1 minuto.", en: "Set up profile, language and level in under a minute." },
  "landing.step2.title":  { sv: "Möt Hectór",          es: "Conoce a Hectór",        en: "Meet Hectór" },
  "landing.step2.body":   { sv: "Röst-test bedömer din nivå automatiskt. Sen är du igång.", es: "Una prueba de voz evalúa tu nivel automáticamente. Ya estás listo.", en: "A voice test rates your level automatically. You're ready to go." },
  "landing.step3.title":  { sv: "Träna varje dag",     es: "Practica cada día",      en: "Practice every day" },
  "landing.step3.body":   { sv: "5 min/dag räcker. Daily challenge, lektioner och röstsamtal.", es: "Bastan 5 min/día. Reto diario, lecciones y llamadas de voz.", en: "5 min/day is enough. Daily challenge, lessons and voice calls." },

  "landing.pricing.title":   { sv: "Välj plan som passar dig", es: "Elige el plan que te conviene", en: "Pick a plan that fits you" },
  "landing.pricing.subtitle":{ sv: "Free fungerar för att testa. Pro öppnar alla lektioner. Family delar med 5.",
                              es: "Free para probar. Pro desbloquea todo. Family para 5 personas.",
                              en: "Free to try. Pro unlocks everything. Family covers 5 people." },
  "landing.pricing.cta":     { sv: "Se priser",        es: "Ver precios",            en: "View pricing" },

  "landing.finalcta.title":  { sv: "Redo att börja prata?", es: "¿Listo para empezar a hablar?", en: "Ready to start talking?" },
  "landing.finalcta.body":   { sv: "Skapa ett gratis konto, möt Hectór, och börja din första lektion på 60 sekunder.",
                              es: "Crea una cuenta gratis, conoce a Hectór y empieza tu primera lección en 60 segundos.",
                              en: "Create a free account, meet Hectór, and start your first lesson in 60 seconds." },
  "landing.finalcta.cta":    { sv: "Skapa gratis konto", es: "Crear cuenta gratis", en: "Create free account" },
  "landing.footer.tag":      { sv: "Bygg flytande språk på det roliga sättet.", es: "Construye fluidez de la manera divertida.", en: "Build fluency the fun way." },

  // Auth pages
  "auth.login.title":     { sv: "Välkommen tillbaka",  es: "Bienvenido de nuevo",    en: "Welcome back" },
  "auth.login.subtitle":  { sv: "Logga in på ditt Fluentic-konto", es: "Inicia sesión en tu cuenta Fluentic", en: "Log in to your Fluentic account" },
  "auth.login.cta":       { sv: "Logga in",            es: "Iniciar sesión",         en: "Log in" },
  "auth.signup.title":    { sv: "Skapa ditt konto",    es: "Crea tu cuenta",         en: "Create your account" },
  "auth.signup.subtitle": { sv: "Gratis i 7 dagar — inga kortuppgifter krävs.", es: "Gratis 7 días — sin tarjeta de crédito.", en: "Free for 7 days — no credit card required." },
  "auth.signup.cta":      { sv: "Skapa konto",         es: "Crear cuenta",           en: "Sign up" },
  "auth.signup.perk1":    { sv: "Tillgång till alla 40 lektioner", es: "Acceso a las 40 lecciones", en: "Access to all 40 lessons" },
  "auth.signup.perk2":    { sv: "Möt Hectór, Maritza & Adison", es: "Conoce a Hectór, Maritza y Adison", en: "Meet Hectór, Maritza & Adison" },
  "auth.signup.perk3":    { sv: "Inga kortuppgifter krävs", es: "Sin datos de tarjeta", en: "No credit card needed" },
  "auth.signup.terms":    { sv: "Genom att skapa konto godkänner du våra villkor.", es: "Al crear una cuenta aceptas nuestros términos.", en: "By signing up you agree to our terms." },
  "auth.email":           { sv: "E-post",              es: "Correo electrónico",     en: "Email" },
  "auth.password":        { sv: "Lösenord",            es: "Contraseña",             en: "Password" },
  "auth.password.hint":   { sv: "Minst 6 tecken",      es: "Mínimo 6 caracteres",    en: "Minimum 6 characters" },
  "auth.name":            { sv: "Namn",                es: "Nombre",                 en: "Name" },
  "auth.noAccount":       { sv: "Har du inget konto?", es: "¿No tienes cuenta?",     en: "Don't have an account?" },
  "auth.haveAccount":     { sv: "Har du redan konto?", es: "¿Ya tienes cuenta?",     en: "Already have an account?" },

  // Pricing
  "pricing.title":        { sv: "Enkla priser, kraftfullt resultat", es: "Precios simples, resultados potentes", en: "Simple pricing, powerful results" },
  "pricing.subtitle":     { sv: "Avbryt när du vill. Inget krångel.", es: "Cancela cuando quieras. Sin complicaciones.", en: "Cancel anytime. No fuss." },
  "pricing.month":        { sv: "mån",                 es: "mes",                    en: "mo" },
  "pricing.popular":      { sv: "Populärast",          es: "Más popular",            en: "Most popular" },
  "pricing.current":      { sv: "Nuvarande",           es: "Actual",                 en: "Current" },
  "pricing.notActive":    { sv: "Betalning aktiveras snart",      es: "Los pagos se activan pronto", en: "Payments activate soon" },
  "pricing.comingSoon":   { sv: "Betalning aktiveras snart — du kommer kunna uppgradera om kort.", es: "Los pagos se activan pronto — podrás actualizar en breve.", en: "Payments activate soon — you'll be able to upgrade shortly." },

  "pricing.free.name":    { sv: "Gratis",              es: "Gratis",                 en: "Free" },
  "pricing.free.price":   { sv: "0 kr",                es: "0 €",                    en: "$0" },
  "pricing.free.cta":     { sv: "Kör gratis",          es: "Empezar gratis",         en: "Start free" },
  "pricing.free.f1":      { sv: "5 lektioner / vecka", es: "5 lecciones / semana",   en: "5 lessons / week" },
  "pricing.free.f2":      { sv: "1 språk att lära dig",es: "1 idioma para aprender", en: "1 language to learn" },
  "pricing.free.f3":      { sv: "Daglig utmaning",     es: "Reto diario",            en: "Daily challenge" },
  "pricing.free.f4":      { sv: "Maritza & Adison",    es: "Maritza y Adison",       en: "Maritza & Adison" },

  "pricing.pro.name":     { sv: "Pro",                 es: "Pro",                    en: "Pro" },
  "pricing.pro.price":    { sv: "149 kr",              es: "14,99 €",                en: "$15" },
  "pricing.pro.cta":      { sv: "Uppgradera till Pro", es: "Actualizar a Pro",       en: "Upgrade to Pro" },
  "pricing.pro.f1":       { sv: "ALLA 40 lektioner upplåsta", es: "Las 40 lecciones desbloqueadas", en: "All 40 lessons unlocked" },
  "pricing.pro.f2":       { sv: "Alla 4 språk (es/en/fr/ar)", es: "Los 4 idiomas (es/en/fr/ar)", en: "All 4 languages" },
  "pricing.pro.f3":       { sv: "Obegränsad röst-tid med Hectór", es: "Tiempo de voz ilimitado con Hectór", en: "Unlimited voice time with Hectór" },
  "pricing.pro.f4":       { sv: "Telegram-tolk-bot (Adison)", es: "Bot de Telegram (Adison)", en: "Telegram interpreter bot (Adison)" },
  "pricing.pro.f5":       { sv: "AI-genererat material per lektion", es: "Material IA por lección", en: "AI-generated material per lesson" },
  "pricing.pro.f6":       { sv: "Achievements & priority-support", es: "Logros y soporte prioritario", en: "Achievements & priority support" },

  "pricing.family.name":  { sv: "Family",              es: "Family",                 en: "Family" },
  "pricing.family.price": { sv: "299 kr",              es: "29,99 €",                en: "$29" },
  "pricing.family.cta":   { sv: "Välj Family",         es: "Elegir Family",          en: "Choose Family" },
  "pricing.family.f1":    { sv: "Allt från Pro × 5 personer", es: "Todo de Pro × 5 personas", en: "Everything in Pro × 5 people" },
  "pricing.family.f2":    { sv: "Eget login per familjemedlem", es: "Login propio por miembro", en: "Own login per family member" },
  "pricing.family.f3":    { sv: "Egna profiler och tutorer", es: "Perfiles y tutores propios", en: "Individual profiles and tutors" },
  "pricing.family.f4":    { sv: "Delad streak-bonus", es: "Bonus de racha compartida", en: "Shared streak bonus" },
  "pricing.family.f5":    { sv: "Familje-leaderboard",es: "Tabla familiar",         en: "Family leaderboard" },

  "pricing.faq.q1":       { sv: "Kan jag avbryta?",    es: "¿Puedo cancelar?",       en: "Can I cancel?" },
  "pricing.faq.a1":       { sv: "Ja, när som helst — inga frågor. Du behåller åtkomst tills perioden går ut.", es: "Sí, cuando quieras — sin preguntas. Mantienes el acceso hasta que termine el periodo.", en: "Yes, anytime — no questions asked. You keep access until your period ends." },

  // Account
  "account.logout":       { sv: "Logga ut",            es: "Cerrar sesión",          en: "Log out" },
  "account.tier":         { sv: "Medlemskap:",         es: "Membresía:",             en: "Membership:" },
  "account.upgrade":      { sv: "Uppgradera",          es: "Actualizar",             en: "Upgrade" },
  "account.changeTier":   { sv: "Byt plan",            es: "Cambiar plan",           en: "Change plan" },
  "account.memberSince":  { sv: "Medlem sedan",        es: "Miembro desde",          en: "Member since" },
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
