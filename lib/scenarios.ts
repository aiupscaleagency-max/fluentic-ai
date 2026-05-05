// Roll-spel-scenarier — 10 st, samma över alla språk
import type { LangCode } from "./languages";
import { getLanguage } from "./languages";
import type { TrackId } from "./track";

export interface Scenario {
  id: string;
  title: string;        // svensk titel
  emoji: string;
  // Kort svensk beskrivning som visas i listan
  descriptionSv: string;
  level: "A2" | "B1" | "B2";
  // Persona-prompt på engelska för LLM (lättare att styra på engelska)
  personaForLang: (lang: LangCode) => string;
  // Öppningsreplik på målspråket — skickas in som första AI-meddelandet i röstsamtalet
  openingForLang: (lang: LangCode) => string;
  // Vad användaren ska försöka göra
  goalSv: string;
  // Lärandemål på svenska — visas som checklist innan/efter
  learningGoalsSv: string[];
  // Vilka tracks scenariot främst hör hemma i — används för att sortera scenarier-tab
  tracks: TrackId[];
}

function langName(lang: LangCode): string {
  const l = getLanguage(lang);
  return l ? l.native : lang;
}

// Per-språk öppningsrepliker. Vi mappar varje scenario till en kort hälsning.
type Openings = Record<LangCode, string>;

function pick(o: Openings, lang: LangCode): string {
  return o[lang] ?? o.en;
}

const OPEN_CAFE: Openings = {
  es: "¡Hola! Bienvenido al café. ¿Qué te apetece tomar?",
  en: "Hi there! Welcome in. What can I get you today?",
  fr: "Bonjour ! Bienvenue au café. Qu'est-ce que vous prenez ?",
  ar: "مرحبا! أهلا بك في المقهى. ماذا تحب أن تشرب؟",
};

const OPEN_AIRPORT: Openings = {
  es: "Buenos días, ¿pasaporte y billete, por favor?",
  en: "Good morning. Passport and ticket, please?",
  fr: "Bonjour, votre passeport et votre billet, s'il vous plaît ?",
  ar: "صباح الخير، جواز السفر والتذكرة من فضلك.",
};

const OPEN_PARTY: Openings = {
  es: "¡Hola! No nos conocemos, ¿verdad? Soy Alex.",
  en: "Hey! I don't think we've met — I'm Alex.",
  fr: "Salut ! On ne s'est pas encore rencontrés, je crois. Moi c'est Alex.",
  ar: "مرحبا! لا أعتقد أننا التقينا من قبل. أنا أليكس.",
};

const OPEN_APARTMENT: Openings = {
  es: "Hola, bienvenido. ¿Lista para ver el apartamento?",
  en: "Hi, welcome. Ready to take a look at the apartment?",
  fr: "Bonjour, bienvenue. Prêt à visiter l'appartement ?",
  ar: "مرحبا، أهلا بك. هل أنت مستعد لرؤية الشقة؟",
};

const OPEN_DOCTOR: Openings = {
  es: "Hola, soy el doctor. ¿Qué le trae hoy?",
  en: "Hello, I'm the doctor. What brings you in today?",
  fr: "Bonjour, je suis le médecin. Qu'est-ce qui vous amène aujourd'hui ?",
  ar: "مرحبا، أنا الطبيب. ما الذي أتى بك اليوم؟",
};

const OPEN_INTERVIEW: Openings = {
  es: "Buenos días, gracias por venir. Cuénteme un poco sobre usted.",
  en: "Good morning, thanks for coming in. Tell me a bit about yourself.",
  fr: "Bonjour, merci d'être venu. Parlez-moi un peu de vous.",
  ar: "صباح الخير، شكرا لحضورك. أخبرني قليلا عن نفسك.",
};

const OPEN_RESTAURANT: Openings = {
  es: "Buenas noches, ¿una mesa para cuántos? Aquí tiene la carta.",
  en: "Good evening! Table for how many? Here's our menu.",
  fr: "Bonsoir, une table pour combien de personnes ? Voici la carte.",
  ar: "مساء الخير، طاولة لكم شخصا؟ هذه قائمة الطعام.",
};

const OPEN_PHARMACY: Openings = {
  es: "Hola, ¿en qué puedo ayudarle hoy?",
  en: "Hi there, how can I help you today?",
  fr: "Bonjour, comment puis-je vous aider aujourd'hui ?",
  ar: "مرحبا، كيف يمكنني مساعدتك اليوم؟",
};

const OPEN_HOTEL: Openings = {
  es: "Buenas tardes, bienvenido. ¿Tiene una reserva a su nombre?",
  en: "Good afternoon, welcome. Do you have a reservation under your name?",
  fr: "Bonjour, bienvenue. Avez-vous une réservation à votre nom ?",
  ar: "مساء الخير، أهلا بك. هل لديك حجز باسمك؟",
};

const OPEN_COWORKER: Openings = {
  es: "¡Hola! Vaya tiempo hoy, ¿eh? ¿Qué tal tu fin de semana?",
  en: "Hey! Crazy weather today, huh? How was your weekend?",
  fr: "Salut ! Quel temps aujourd'hui, hein ! Tu as passé un bon week-end ?",
  ar: "مرحبا! طقس غريب اليوم، أليس كذلك؟ كيف كانت عطلتك؟",
};

export const SCENARIOS: Scenario[] = [
  {
    id: "cafe",
    title: "Beställa kaffe på café",
    emoji: "☕",
    descriptionSv: "Beställ dryck och bakverk över disk.",
    level: "A2",
    goalSv: "Beställ en kaffe och något att äta. Fråga om priset.",
    learningGoalsSv: [
      "Hälsa och beställa artigt",
      "Fråga om pris",
      "Be om något att äta till",
    ],
    personaForLang: (lang) =>
      `You are a friendly barista at a small café in a ${langName(lang)}-speaking city. Greet the user, ask what they want, suggest pastries, take their order, and tell them the price. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short (1-2 sentences) so the user gets to talk.`,
    openingForLang: (lang) => pick(OPEN_CAFE, lang),
    tracks: ["casual", "travel"],
  },
  {
    id: "airport",
    title: "På flygplatsen / incheckning",
    emoji: "✈️",
    descriptionSv: "Checka in inför en flygresa.",
    level: "B1",
    goalSv: "Checka in, lämna bagage och fråga om gate.",
    learningGoalsSv: [
      "Visa pass och biljett",
      "Lämna in bagage",
      "Fråga om gate och boarding-tid",
    ],
    personaForLang: (lang) =>
      `You are a check-in agent at an international airport speaking ${langName(lang)}. Ask for passport and ticket, ask about luggage, give boarding info and gate. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short.`,
    openingForLang: (lang) => pick(OPEN_AIRPORT, lang),
    tracks: ["travel"],
  },
  {
    id: "party",
    title: "Träffa någon ny på en fest",
    emoji: "🎉",
    descriptionSv: "Småprata och presentera dig själv.",
    level: "A2",
    goalSv: "Presentera dig och småprata om var ni kommer från, jobb och intressen.",
    learningGoalsSv: [
      "Presentera dig själv",
      "Berätta var du kommer ifrån",
      "Ställ följdfrågor om jobb och intressen",
    ],
    personaForLang: (lang) =>
      `You are a friendly stranger at a casual party. Introduce yourself in ${langName(lang)}, ask the user where they're from, what they do, and chat naturally. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short and warm.`,
    openingForLang: (lang) => pick(OPEN_PARTY, lang),
    tracks: ["casual"],
  },
  {
    id: "apartment",
    title: "Hyra en lägenhet",
    emoji: "🏠",
    descriptionSv: "Visning hos hyresvärden.",
    level: "B1",
    goalSv: "Fråga om hyra, antal rum, depositionsavgift och visning.",
    learningGoalsSv: [
      "Fråga om hyra och deposition",
      "Be om beskrivning av rummen",
      "Boka en visning",
    ],
    personaForLang: (lang) =>
      `You are a landlord showing an apartment, speaking ${langName(lang)}. Greet the user, describe the apartment, answer questions about rent, deposit, and viewings. Stay in character. Speak ONLY ${langName(lang)}.`,
    openingForLang: (lang) => pick(OPEN_APARTMENT, lang),
    tracks: ["general", "travel"],
  },
  {
    id: "doctor",
    title: "Hos läkaren",
    emoji: "🩺",
    descriptionSv: "Beskriv symptom och få råd.",
    level: "B1",
    goalSv: "Beskriv dina symptom och svara på läkarens frågor.",
    learningGoalsSv: [
      "Beskriv smärta och symptom",
      "Svara på följdfrågor om hälsa",
      "Förstå nästa steg",
    ],
    personaForLang: (lang) =>
      `You are a calm general practitioner doctor speaking ${langName(lang)}. Greet the patient, ask what's wrong, ask follow-up questions about symptoms, and suggest next steps. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short.`,
    openingForLang: (lang) => pick(OPEN_DOCTOR, lang),
    tracks: ["general", "travel"],
  },
  {
    id: "interview",
    title: "Jobbintervju",
    emoji: "💼",
    descriptionSv: "Presentera dig professionellt.",
    level: "B2",
    goalSv: "Presentera dig professionellt och svara på intervjuarens frågor.",
    learningGoalsSv: [
      "Presentera bakgrund och styrkor",
      "Förklara varför du söker tjänsten",
      "Hantera en svår fråga lugnt",
    ],
    personaForLang: (lang) =>
      `You are a hiring manager conducting a job interview in ${langName(lang)}. Greet the candidate, ask about background, strengths, motivation and one challenging question. Stay in character. Speak ONLY ${langName(lang)}. Keep questions focused.`,
    openingForLang: (lang) => pick(OPEN_INTERVIEW, lang),
    tracks: ["business"],
  },
  {
    id: "restaurant",
    title: "På restaurang",
    emoji: "🍽️",
    descriptionSv: "Beställ middag och be om notan.",
    level: "A2",
    goalSv: "Beställ middag, fråga om allergener och be om notan.",
    learningGoalsSv: [
      "Beställa förrätt, huvudrätt och dryck",
      "Fråga om allergener",
      "Be om notan artigt",
    ],
    personaForLang: (lang) =>
      `You are a polite waiter at a popular restaurant, speaking ${langName(lang)}. Welcome the user, take their order step by step (drinks, starter, main), answer questions about allergens (gluten, lactose, nuts), and bring the bill when asked. Stay in character. Speak ONLY ${langName(lang)}. Keep replies to 1-2 short sentences so the user gets to practice.`,
    openingForLang: (lang) => pick(OPEN_RESTAURANT, lang),
    tracks: ["travel", "casual"],
  },
  {
    id: "pharmacy",
    title: "På apoteket",
    emoji: "💊",
    descriptionSv: "Beskriv symptom och köp medicin.",
    level: "A2",
    goalSv: "Beskriv ett symptom och fråga efter receptfri medicin.",
    learningGoalsSv: [
      "Beskriva ett vardagligt symptom",
      "Fråga efter receptfri medicin",
      "Förstå dosering",
    ],
    personaForLang: (lang) =>
      `You are a helpful pharmacist behind the counter, speaking ${langName(lang)}. Ask the user what symptoms they have, suggest a suitable over-the-counter medicine, explain the dosage briefly, and ask if they have allergies. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short.`,
    openingForLang: (lang) => pick(OPEN_PHARMACY, lang),
    tracks: ["travel", "general"],
  },
  {
    id: "hotel",
    title: "Hotell-incheckning",
    emoji: "🛎️",
    descriptionSv: "Checka in och fråga om hotellet.",
    level: "B1",
    goalSv: "Checka in, fråga om wifi och be eventuellt om annat rum.",
    learningGoalsSv: [
      "Bekräfta en bokning",
      "Fråga om wifi och frukost",
      "Be artigt om ett annat rum",
    ],
    personaForLang: (lang) =>
      `You are a hotel receptionist checking in a guest, speaking ${langName(lang)}. Confirm the reservation, ask for ID, give them their room number, explain wifi and breakfast, and politely handle a request for a different room. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short and helpful.`,
    openingForLang: (lang) => pick(OPEN_HOTEL, lang),
    tracks: ["travel", "business"],
  },
  {
    id: "coworker",
    title: "Småprata med kollega",
    emoji: "💬",
    descriptionSv: "Lättsamt snack vid kaffemaskinen.",
    level: "B1",
    goalSv: "Småprata om vädret, helgen och kommande projekt.",
    learningGoalsSv: [
      "Inleda småprat naturligt",
      "Berätta om helgen",
      "Reagera på det kollegan säger",
    ],
    personaForLang: (lang) =>
      `You are a friendly coworker chatting by the office coffee machine, speaking ${langName(lang)}. Make small talk about the weather, ask about the user's weekend, and mention an upcoming project at work. Stay in character. Speak ONLY ${langName(lang)}. Keep replies short and casual.`,
    openingForLang: (lang) => pick(OPEN_COWORKER, lang),
    tracks: ["business", "casual"],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
