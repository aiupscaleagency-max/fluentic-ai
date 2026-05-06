// 40 lektioner per språk — CEFR can-do-statements som mall (Cambridge / Council of Europe).
// Kopplas till vocab.ts via category-fältet och phrases.ts via lessonId.
// Titel + goal har översättningar för UI-språken sv/es/en. Hjälper getLessonTitleI18n().
import type { LangCode } from "./languages";
import type { CefrLevel } from "./level";
import type { VocabCategory } from "./vocab";

type UiLang = "sv" | "es" | "en";

export interface Lesson {
  id: string;
  number: number;
  title: string;                              // Bakåtkompat (sv)
  emoji: string;
  level: CefrLevel;
  category: VocabCategory;
  goalSv: string;                             // Bakåtkompat (sv)
  // Per-UI-språk
  i18nTitle?: Record<UiLang, string>;
  i18nGoal?: Record<UiLang, string>;
}

// Hjälpare för att förkorta deklarationerna nedan
function L(
  id: string, number: number, level: CefrLevel, category: VocabCategory, emoji: string,
  titles: Record<UiLang, string>, goals: Record<UiLang, string>,
): Lesson {
  return {
    id, number, level, category, emoji,
    title: titles.sv,
    goalSv: goals.sv,
    i18nTitle: titles,
    i18nGoal: goals,
  };
}

export const LESSONS: Lesson[] = [
  // ======= A1 =======
  L("lesson-1", 1, "A1", "greetings", "👋",
    { sv: "Hälsningar", es: "Saludos", en: "Greetings" },
    { sv: "Hej, hej då, tack och presentera dig.", es: "Hola, adiós, gracias y presentarte.", en: "Hi, bye, thanks and introducing yourself." }),
  L("lesson-2", 2, "A1", "food", "🍞",
    { sv: "Mat & dryck", es: "Comida y bebida", en: "Food & drink" },
    { sv: "Vatten, bröd, kaffe — beställ enkelt.", es: "Agua, pan, café — pedir lo básico.", en: "Water, bread, coffee — order the basics." }),
  L("lesson-3", 3, "A1", "numbers", "🔢",
    { sv: "Siffror & tid", es: "Números y hora", en: "Numbers & time" },
    { sv: "Räkna 1–100 och säg vad klockan är.", es: "Contar 1–100 y decir la hora.", en: "Count 1–100 and tell the time." }),
  L("lesson-4", 4, "A1", "family", "👨‍👩‍👧",
    { sv: "Familj & vänner", es: "Familia y amigos", en: "Family & friends" },
    { sv: "Berätta om mamma, pappa, syskon och vänner.", es: "Hablar de mamá, papá, hermanos y amigos.", en: "Talk about mom, dad, siblings and friends." }),
  L("lesson-5", 5, "A1", "colors", "🎨",
    { sv: "Färger & former", es: "Colores y formas", en: "Colors & shapes" },
    { sv: "Beskriv saker med färg och form.", es: "Describir cosas por color y forma.", en: "Describe things by color and shape." }),
  L("lesson-6", 6, "A1", "body", "🧍",
    { sv: "Kroppen", es: "El cuerpo", en: "The body" },
    { sv: "Huvud, hand, fot — säg var det gör ont.", es: "Cabeza, mano, pie — decir dónde duele.", en: "Head, hand, foot — say where it hurts." }),
  L("lesson-7", 7, "A1", "home", "🏠",
    { sv: "Hemma", es: "En casa", en: "At home" },
    { sv: "Kök, sovrum, badrum — beskriv ditt hem.", es: "Cocina, dormitorio, baño — describir tu casa.", en: "Kitchen, bedroom, bathroom — describe your home." }),
  L("lesson-8", 8, "A1", "weather", "🌤️",
    { sv: "Vädret", es: "El tiempo", en: "Weather" },
    { sv: "Sol, regn, snö — prata om dagens väder.", es: "Sol, lluvia, nieve — hablar del tiempo de hoy.", en: "Sun, rain, snow — talk about today's weather." }),
  L("lesson-9", 9, "A1", "clothing", "👕",
    { sv: "Kläder", es: "Ropa", en: "Clothes" },
    { sv: "T-shirt, byxor, skor — vad har du på dig?", es: "Camiseta, pantalones, zapatos — ¿qué llevas puesto?", en: "T-shirt, pants, shoes — what are you wearing?" }),
  L("lesson-10", 10, "A1", "hobbies", "🎯",
    { sv: "Hobbys", es: "Pasatiempos", en: "Hobbies" },
    { sv: "Berätta vad du tycker om att göra.", es: "Contar qué te gusta hacer.", en: "Talk about what you like to do." }),

  // ======= A2 =======
  L("lesson-11", 11, "A2", "food", "☕",
    { sv: "På café", es: "En la cafetería", en: "At the café" },
    { sv: "Beställ kaffe, fika och betala.", es: "Pedir café, merienda y pagar.", en: "Order coffee, snacks and pay." }),
  L("lesson-12", 12, "A2", "shopping", "🛒",
    { sv: "Att handla", es: "Ir de compras", en: "Shopping" },
    { sv: "Pris, storlek, betalning — handla i butik.", es: "Precio, talla, pago — comprar en tienda.", en: "Price, size, payment — shopping in stores." }),
  L("lesson-13", 13, "A2", "directions", "🗺️",
    { sv: "Vägbeskrivning", es: "Cómo llegar", en: "Directions" },
    { sv: "Fråga och förklara vägen någonstans.", es: "Preguntar y explicar cómo llegar a un sitio.", en: "Ask and give directions." }),
  L("lesson-14", 14, "A2", "health", "🩺",
    { sv: "Hos doktorn", es: "En el médico", en: "At the doctor" },
    { sv: "Beskriv symptom och förstå råd.", es: "Describir síntomas y entender consejos.", en: "Describe symptoms and understand advice." }),
  L("lesson-15", 15, "A2", "transport", "🚆",
    { sv: "Transport & resa", es: "Transporte y viaje", en: "Transport & travel" },
    { sv: "Tåg, buss, taxi och tidtabeller.", es: "Tren, autobús, taxi y horarios.", en: "Train, bus, taxi and schedules." }),
  L("lesson-16", 16, "A2", "technology", "📱",
    { sv: "Telefon & sms", es: "Teléfono y mensajes", en: "Phone & texts" },
    { sv: "Ringa, lämna meddelande, sms:a.", es: "Llamar, dejar mensaje, enviar texto.", en: "Call, leave a message, send a text." }),
  L("lesson-17", 17, "A2", "food", "🍽️",
    { sv: "Restaurang", es: "Restaurante", en: "Restaurant" },
    { sv: "Boka bord, beställ flerrätters, betala.", es: "Reservar mesa, pedir platos, pagar.", en: "Book a table, order courses, pay." }),
  L("lesson-18", 18, "A2", "time", "📅",
    { sv: "Datum & månader", es: "Fechas y meses", en: "Dates & months" },
    { sv: "Säg datum, planera möten och händelser.", es: "Decir fechas, planear citas y eventos.", en: "Say dates, plan meetings and events." }),
  L("lesson-19", 19, "A2", "hobbies", "⚽",
    { sv: "Fritid & sport", es: "Tiempo libre y deporte", en: "Leisure & sports" },
    { sv: "Träna, sporta, hänga med vänner.", es: "Entrenar, hacer deporte, salir con amigos.", en: "Work out, do sports, hang with friends." }),
  L("lesson-20", 20, "A2", "casual", "💬",
    { sv: "Småprat", es: "Charla informal", en: "Small talk" },
    { sv: "Bryt isen och prata vardagligt.", es: "Romper el hielo y hablar de lo cotidiano.", en: "Break the ice and chat casually." }),

  // ======= B1 =======
  L("lesson-21", 21, "B1", "travel", "✈️",
    { sv: "Resa & turism", es: "Viajes y turismo", en: "Travel & tourism" },
    { sv: "Flygplats, hotell, biljett, pass.", es: "Aeropuerto, hotel, billete, pasaporte.", en: "Airport, hotel, ticket, passport." }),
  L("lesson-22", 22, "B1", "business", "💼",
    { sv: "Jobbmöten", es: "Reuniones de trabajo", en: "Work meetings" },
    { sv: "Möten, agenda, presentation.", es: "Reuniones, agenda, presentación.", en: "Meetings, agenda, presentation." }),
  L("lesson-23", 23, "B1", "opinions", "⚖️",
    { sv: "Åsikter & jämförelser", es: "Opiniones y comparaciones", en: "Opinions & comparisons" },
    { sv: "Säg vad du tycker och jämför saker.", es: "Decir qué piensas y comparar cosas.", en: "Say what you think and compare things." }),
  L("lesson-24", 24, "B1", "casual", "📖",
    { sv: "Berätta historier", es: "Contar historias", en: "Tell stories" },
    { sv: "Berätta något som hände — i dåtid.", es: "Contar algo que pasó — en pasado.", en: "Tell what happened — in the past." }),
  L("lesson-25", 25, "B1", "health", "🏃",
    { sv: "Hälsa & livsstil", es: "Salud y estilo de vida", en: "Health & lifestyle" },
    { sv: "Träning, mat, sömn och välmående.", es: "Ejercicio, comida, sueño y bienestar.", en: "Exercise, food, sleep and well-being." }),
  L("lesson-26", 26, "B1", "technology", "💻",
    { sv: "Internet & teknik", es: "Internet y tecnología", en: "Internet & tech" },
    { sv: "Appar, e-post, online-tjänster.", es: "Apps, correo, servicios online.", en: "Apps, email, online services." }),
  L("lesson-27", 27, "B1", "money", "💰",
    { sv: "Pengar & ekonomi", es: "Dinero y economía", en: "Money & finance" },
    { sv: "Bank, lön, sparande, kvitton.", es: "Banco, sueldo, ahorro, recibos.", en: "Bank, salary, savings, receipts." }),
  L("lesson-28", 28, "B1", "culture", "🎭",
    { sv: "Kultur & traditioner", es: "Cultura y tradiciones", en: "Culture & traditions" },
    { sv: "Helger, mat, musik, traditioner.", es: "Fiestas, comida, música, tradiciones.", en: "Holidays, food, music, traditions." }),

  // ======= B2 =======
  L("lesson-29", 29, "B2", "abstract", "🧠",
    { sv: "Diskussioner & debatt", es: "Discusiones y debate", en: "Discussions & debate" },
    { sv: "Argumentera för och emot en åsikt.", es: "Argumentar a favor y en contra.", en: "Argue for and against a view." }),
  L("lesson-30", 30, "B2", "abstract", "📰",
    { sv: "Nyheter & politik", es: "Noticias y política", en: "News & politics" },
    { sv: "Förstå nyheter och kommentera samhälle.", es: "Entender noticias y comentar la sociedad.", en: "Understand news and comment on society." }),
  L("lesson-31", 31, "B2", "business", "🎯",
    { sv: "Karriär & ambition", es: "Carrera y ambición", en: "Career & ambition" },
    { sv: "Karriärväg, intervju, mål och drömmar.", es: "Trayectoria, entrevista, metas y sueños.", en: "Career path, interview, goals and dreams." }),
  L("lesson-32", 32, "B2", "business", "🤝",
    { sv: "Förhandling", es: "Negociación", en: "Negotiation" },
    { sv: "Förhandla pris, villkor och avtal.", es: "Negociar precio, condiciones y acuerdos.", en: "Negotiate price, terms and contracts." }),
  L("lesson-33", 33, "B2", "casual", "❤️",
    { sv: "Personliga relationer", es: "Relaciones personales", en: "Personal relationships" },
    { sv: "Vänskap, kärlek, konflikter och försoning.", es: "Amistad, amor, conflictos y reconciliación.", en: "Friendship, love, conflict and making up." }),
  L("lesson-34", 34, "B2", "academic", "🎓",
    { sv: "Akademiska samtal", es: "Conversaciones académicas", en: "Academic talks" },
    { sv: "Föreläsning, uppsats, källor och citat.", es: "Conferencia, ensayo, fuentes y citas.", en: "Lecture, essay, sources and citations." }),

  // ======= C1 =======
  L("lesson-35", 35, "C1", "idioms", "🎨",
    { sv: "Idiom & uttryck", es: "Modismos y expresiones", en: "Idioms & expressions" },
    { sv: "Använd idiom som infödd talare.", es: "Usar modismos como un nativo.", en: "Use idioms like a native speaker." }),
  L("lesson-36", 36, "C1", "idioms", "😏",
    { sv: "Ironi & humor", es: "Ironía y humor", en: "Irony & humor" },
    { sv: "Förstå ironi, sarkasm och skämt.", es: "Entender ironía, sarcasmo y bromas.", en: "Get irony, sarcasm and jokes." }),
  L("lesson-37", 37, "C1", "academic", "📚",
    { sv: "Litterärt språk", es: "Lenguaje literario", en: "Literary language" },
    { sv: "Läs prosa, dikt och tolka nyanser.", es: "Leer prosa, poesía e interpretar matices.", en: "Read prose, poetry and interpret nuance." }),
  L("lesson-38", 38, "C1", "business", "💼",
    { sv: "Affärsförhandling", es: "Negociación de negocios", en: "Business negotiation" },
    { sv: "Avancerad business på målspråket.", es: "Negocios avanzados en el idioma meta.", en: "Advanced business in the target language." }),
  L("lesson-39", 39, "C1", "abstract", "🤔",
    { sv: "Filosofi & idéer", es: "Filosofía e ideas", en: "Philosophy & ideas" },
    { sv: "Diskutera abstrakta filosofiska idéer.", es: "Discutir ideas filosóficas abstractas.", en: "Discuss abstract philosophical ideas." }),
  L("lesson-40", 40, "C1", "casual", "⚡",
    { sv: "Snabbt vardagsspråk", es: "Habla cotidiana rápida", en: "Fast casual speech" },
    { sv: "Hänga som med en native — slang och flow.", es: "Hablar como un nativo — slang y flow.", en: "Speak like a native — slang and flow." }),
];

export function getLessons(_lang: LangCode): Lesson[] {
  return LESSONS;
}

// Hämta lektionstitel + mål på UI-språk. Fallback: sv.
export function getLessonI18n(lesson: Lesson, uiLang: UiLang): { title: string; goal: string } {
  return {
    title: lesson.i18nTitle?.[uiLang] ?? lesson.title,
    goal: lesson.i18nGoal?.[uiLang] ?? lesson.goalSv,
  };
}
