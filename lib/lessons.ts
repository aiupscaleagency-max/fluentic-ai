// 40 lektioner per språk — CEFR can-do-statements som mall (Cambridge / Council of Europe).
// Kopplas till vocab.ts via category-fältet och phrases.ts via lessonId.
import type { LangCode } from "./languages";
import type { CefrLevel } from "./level";
import type { VocabCategory } from "./vocab";

export interface Lesson {
  id: string;
  number: number;
  title: string;
  emoji: string;
  level: CefrLevel;
  category: VocabCategory;
  goalSv: string;
}

export const LESSONS: Lesson[] = [
  // ======= A1 — 10 lektioner — Survival language =======
  { id: "lesson-1",  number: 1,  title: "Hälsningar",          emoji: "👋", level: "A1", category: "greetings", goalSv: "Hej, hej då, tack och presentera dig." },
  { id: "lesson-2",  number: 2,  title: "Mat & dryck",         emoji: "🍞", level: "A1", category: "food",      goalSv: "Vatten, bröd, kaffe — beställ enkelt." },
  { id: "lesson-3",  number: 3,  title: "Siffror & tid",       emoji: "🔢", level: "A1", category: "numbers",   goalSv: "Räkna 1–100 och säg vad klockan är." },
  { id: "lesson-4",  number: 4,  title: "Familj & vänner",     emoji: "👨‍👩‍👧", level: "A1", category: "family",  goalSv: "Berätta om mamma, pappa, syskon och vänner." },
  { id: "lesson-5",  number: 5,  title: "Färger & former",     emoji: "🎨", level: "A1", category: "colors",    goalSv: "Beskriv saker med färg och form." },
  { id: "lesson-6",  number: 6,  title: "Kroppen",             emoji: "🧍", level: "A1", category: "body",      goalSv: "Huvud, hand, fot — säg var det gör ont." },
  { id: "lesson-7",  number: 7,  title: "Hemma",               emoji: "🏠", level: "A1", category: "home",      goalSv: "Kök, sovrum, badrum — beskriv ditt hem." },
  { id: "lesson-8",  number: 8,  title: "Vädret",              emoji: "🌤️", level: "A1", category: "weather",   goalSv: "Sol, regn, snö — prata om dagens väder." },
  { id: "lesson-9",  number: 9,  title: "Kläder",              emoji: "👕", level: "A1", category: "clothing",  goalSv: "T-shirt, byxor, skor — vad har du på dig?" },
  { id: "lesson-10", number: 10, title: "Hobbys",              emoji: "🎯", level: "A1", category: "hobbies",   goalSv: "Berätta vad du tycker om att göra." },

  // ======= A2 — 10 lektioner — Daily situations =======
  { id: "lesson-11", number: 11, title: "På café",             emoji: "☕", level: "A2", category: "food",         goalSv: "Beställ kaffe, fika och betala." },
  { id: "lesson-12", number: 12, title: "Att handla",          emoji: "🛒", level: "A2", category: "shopping",     goalSv: "Pris, storlek, betalning — handla i butik." },
  { id: "lesson-13", number: 13, title: "Vägbeskrivning",      emoji: "🗺️", level: "A2", category: "directions",   goalSv: "Fråga och förklara vägen någonstans." },
  { id: "lesson-14", number: 14, title: "Hos doktorn",         emoji: "🩺", level: "A2", category: "health",       goalSv: "Beskriv symptom och förstå råd." },
  { id: "lesson-15", number: 15, title: "Transport & resa",    emoji: "🚆", level: "A2", category: "transport",    goalSv: "Tåg, buss, taxi och tidtabeller." },
  { id: "lesson-16", number: 16, title: "Telefon & sms",       emoji: "📱", level: "A2", category: "technology",   goalSv: "Ringa, lämna meddelande, sms:a." },
  { id: "lesson-17", number: 17, title: "Restaurang",          emoji: "🍽️", level: "A2", category: "food",         goalSv: "Boka bord, beställ flerrätters, betala." },
  { id: "lesson-18", number: 18, title: "Datum & månader",     emoji: "📅", level: "A2", category: "time",         goalSv: "Säg datum, planera möten och händelser." },
  { id: "lesson-19", number: 19, title: "Fritid & sport",      emoji: "⚽", level: "A2", category: "hobbies",      goalSv: "Träna, sporta, hänga med vänner." },
  { id: "lesson-20", number: 20, title: "Småprat",             emoji: "💬", level: "A2", category: "casual",       goalSv: "Bryt isen och prata vardagligt." },

  // ======= B1 — 8 lektioner — Travel, work, opinions =======
  { id: "lesson-21", number: 21, title: "Resa & turism",       emoji: "✈️", level: "B1", category: "travel",      goalSv: "Flygplats, hotell, biljett, pass." },
  { id: "lesson-22", number: 22, title: "Jobbmöten",           emoji: "💼", level: "B1", category: "business",    goalSv: "Möten, agenda, presentation." },
  { id: "lesson-23", number: 23, title: "Åsikter & jämförelser", emoji: "⚖️", level: "B1", category: "opinions",  goalSv: "Säg vad du tycker och jämför saker." },
  { id: "lesson-24", number: 24, title: "Berätta historier",   emoji: "📖", level: "B1", category: "casual",      goalSv: "Berätta något som hände — i dåtid." },
  { id: "lesson-25", number: 25, title: "Hälsa & livsstil",    emoji: "🏃", level: "B1", category: "health",      goalSv: "Träning, mat, sömn och välmående." },
  { id: "lesson-26", number: 26, title: "Internet & teknik",   emoji: "💻", level: "B1", category: "technology",  goalSv: "Appar, e-post, online-tjänster." },
  { id: "lesson-27", number: 27, title: "Pengar & ekonomi",    emoji: "💰", level: "B1", category: "money",       goalSv: "Bank, lön, sparande, kvitton." },
  { id: "lesson-28", number: 28, title: "Kultur & traditioner", emoji: "🎭", level: "B1", category: "culture",    goalSv: "Helger, mat, musik, traditioner." },

  // ======= B2 — 6 lektioner — Complex, abstract =======
  { id: "lesson-29", number: 29, title: "Diskussioner & debatt", emoji: "🧠", level: "B2", category: "abstract",  goalSv: "Argumentera för och emot en åsikt." },
  { id: "lesson-30", number: 30, title: "Nyheter & politik",   emoji: "📰", level: "B2", category: "abstract",   goalSv: "Förstå nyheter och kommentera samhälle." },
  { id: "lesson-31", number: 31, title: "Karriär & ambition",  emoji: "🎯", level: "B2", category: "business",   goalSv: "Karriärväg, intervju, mål och drömmar." },
  { id: "lesson-32", number: 32, title: "Förhandling",         emoji: "🤝", level: "B2", category: "business",   goalSv: "Förhandla pris, villkor och avtal." },
  { id: "lesson-33", number: 33, title: "Personliga relationer", emoji: "❤️", level: "B2", category: "casual",   goalSv: "Vänskap, kärlek, konflikter och försoning." },
  { id: "lesson-34", number: 34, title: "Akademiska samtal",   emoji: "🎓", level: "B2", category: "academic",   goalSv: "Föreläsning, uppsats, källor och citat." },

  // ======= C1 — 6 lektioner — Native fluency =======
  { id: "lesson-35", number: 35, title: "Idiom & uttryck",     emoji: "🎨", level: "C1", category: "idioms",     goalSv: "Använd idiom som infödd talare." },
  { id: "lesson-36", number: 36, title: "Ironi & humor",       emoji: "😏", level: "C1", category: "idioms",     goalSv: "Förstå ironi, sarkasm och skämt." },
  { id: "lesson-37", number: 37, title: "Litterärt språk",     emoji: "📚", level: "C1", category: "academic",   goalSv: "Läs prosa, dikt och tolka nyanser." },
  { id: "lesson-38", number: 38, title: "Affärsförhandling",   emoji: "💼", level: "C1", category: "business",   goalSv: "Avancerad business-engelska/spanska." },
  { id: "lesson-39", number: 39, title: "Filosofi & idéer",    emoji: "🤔", level: "C1", category: "abstract",   goalSv: "Diskutera abstrakta filosofiska idéer." },
  { id: "lesson-40", number: 40, title: "Snabbt vardagsspråk", emoji: "⚡", level: "C1", category: "casual",     goalSv: "Hänga som med en native — slang och flow." },
];

export function getLessons(_lang: LangCode): Lesson[] {
  return LESSONS;
}
