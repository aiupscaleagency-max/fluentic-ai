// Lyssna & repetera — 10 fraser per språk, vardagliga och nyttiga
import type { LangCode } from "./languages";

export interface Phrase {
  id: string;
  sv: string;
  text: Record<LangCode, string>;
}

export const PHRASES: Phrase[] = [
  {
    id: "p1",
    sv: "Hej, hur mår du?",
    text: {
      es: "Hola, ¿cómo estás?",
      en: "Hello, how are you?",
      fr: "Bonjour, comment ça va ?",
      ar: "مرحبا، كيف حالك؟",
    },
  },
  {
    id: "p2",
    sv: "Jag heter Mike.",
    text: {
      es: "Me llamo Mike.",
      en: "My name is Mike.",
      fr: "Je m'appelle Mike.",
      ar: "اسمي مايك.",
    },
  },
  {
    id: "p3",
    sv: "Jag förstår inte.",
    text: {
      es: "No entiendo.",
      en: "I don't understand.",
      fr: "Je ne comprends pas.",
      ar: "لا أفهم.",
    },
  },
  {
    id: "p4",
    sv: "Var ligger toaletten?",
    text: {
      es: "¿Dónde está el baño?",
      en: "Where is the bathroom?",
      fr: "Où sont les toilettes ?",
      ar: "أين الحمام؟",
    },
  },
  {
    id: "p5",
    sv: "Vad kostar det?",
    text: {
      es: "¿Cuánto cuesta?",
      en: "How much does it cost?",
      fr: "Combien ça coûte ?",
      ar: "كم يكلف؟",
    },
  },
  {
    id: "p6",
    sv: "Jag skulle vilja ha en kaffe, tack.",
    text: {
      es: "Quisiera un café, por favor.",
      en: "I would like a coffee, please.",
      fr: "Je voudrais un café, s'il vous plaît.",
      ar: "أريد قهوة من فضلك.",
    },
  },
  {
    id: "p7",
    sv: "Talar du engelska?",
    text: {
      es: "¿Hablas inglés?",
      en: "Do you speak English?",
      fr: "Parlez-vous anglais ?",
      ar: "هل تتحدث الإنجليزية؟",
    },
  },
  {
    id: "p8",
    sv: "Tack så mycket!",
    text: {
      es: "¡Muchas gracias!",
      en: "Thank you very much!",
      fr: "Merci beaucoup !",
      ar: "شكرا جزيلا!",
    },
  },
  {
    id: "p9",
    sv: "Vi ses imorgon.",
    text: {
      es: "Hasta mañana.",
      en: "See you tomorrow.",
      fr: "À demain.",
      ar: "أراك غدا.",
    },
  },
  {
    id: "p10",
    sv: "Jag är hungrig.",
    text: {
      es: "Tengo hambre.",
      en: "I am hungry.",
      fr: "J'ai faim.",
      ar: "أنا جائع.",
    },
  },
];
