// Definierar 5 lektioner per språk — varje lektion knyter ihop flashcards, cloze och listen
import type { LangCode } from "./languages";
import type { CefrLevel } from "./level";
import type { VocabCategory } from "./vocab";

export interface Lesson {
  id: string;       // ex "lesson-1"
  number: number;
  title: string;
  emoji: string;
  level: CefrLevel;
  category: VocabCategory;
  goalSv: string;
}

export const LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    number: 1,
    title: "Hälsningar",
    emoji: "👋",
    level: "A1",
    category: "greetings",
    goalSv: "Lär dig hej, tack och presentera dig.",
  },
  {
    id: "lesson-2",
    number: 2,
    title: "Mat & dryck",
    emoji: "🍞",
    level: "A1",
    category: "food",
    goalSv: "Vatten, bröd, kaffe — beställ enkelt.",
  },
  {
    id: "lesson-3",
    number: 3,
    title: "Familj & vänner",
    emoji: "👨‍👩‍👧",
    level: "A2",
    category: "family",
    goalSv: "Berätta om mamma, pappa, syskon och vänner.",
  },
  {
    id: "lesson-4",
    number: 4,
    title: "Resor",
    emoji: "✈️",
    level: "B1",
    category: "travel",
    goalSv: "Flygplats, biljett, tåg och pass.",
  },
  {
    id: "lesson-5",
    number: 5,
    title: "Jobb & åsikter",
    emoji: "💼",
    level: "B1",
    category: "work",
    goalSv: "Prata jobb, möten och vad du tycker.",
  },
];

export function getLessons(_lang: LangCode): Lesson[] {
  // Just nu samma uppsättning för alla språk — tar lang för framtida bruk
  return LESSONS;
}
