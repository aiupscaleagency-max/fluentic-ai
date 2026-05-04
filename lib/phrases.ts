// Lyssna & repetera + uttalsövning — fraser per CEFR-nivå (4+ per nivå per språk)
import type { LangCode } from "./languages";
import type { CefrLevel } from "./level";

export interface Phrase {
  id: string;
  level: CefrLevel;
  sv: string;
  text: Record<LangCode, string>;
}

export const PHRASES: Phrase[] = [
  // ===== A1 =====
  {
    id: "a1-p1",
    level: "A1",
    sv: "Hej, hur mår du?",
    text: { es: "Hola, ¿cómo estás?", en: "Hello, how are you?", fr: "Bonjour, comment ça va ?", ar: "مرحبا، كيف حالك؟" },
  },
  {
    id: "a1-p2",
    level: "A1",
    sv: "Jag heter Mike.",
    text: { es: "Me llamo Mike.", en: "My name is Mike.", fr: "Je m'appelle Mike.", ar: "اسمي مايك." },
  },
  {
    id: "a1-p3",
    level: "A1",
    sv: "Tack så mycket!",
    text: { es: "¡Muchas gracias!", en: "Thank you very much!", fr: "Merci beaucoup !", ar: "شكرا جزيلا!" },
  },
  {
    id: "a1-p4",
    level: "A1",
    sv: "Jag är hungrig.",
    text: { es: "Tengo hambre.", en: "I am hungry.", fr: "J'ai faim.", ar: "أنا جائع." },
  },
  // ===== A2 =====
  {
    id: "a2-p1",
    level: "A2",
    sv: "Jag förstår inte.",
    text: { es: "No entiendo.", en: "I don't understand.", fr: "Je ne comprends pas.", ar: "لا أفهم." },
  },
  {
    id: "a2-p2",
    level: "A2",
    sv: "Var ligger toaletten?",
    text: { es: "¿Dónde está el baño?", en: "Where is the bathroom?", fr: "Où sont les toilettes ?", ar: "أين الحمام؟" },
  },
  {
    id: "a2-p3",
    level: "A2",
    sv: "Vad kostar det?",
    text: { es: "¿Cuánto cuesta?", en: "How much does it cost?", fr: "Combien ça coûte ?", ar: "كم يكلف؟" },
  },
  {
    id: "a2-p4",
    level: "A2",
    sv: "Vi ses imorgon.",
    text: { es: "Hasta mañana.", en: "See you tomorrow.", fr: "À demain.", ar: "أراك غدا." },
  },
  // ===== B1 =====
  {
    id: "b1-p1",
    level: "B1",
    sv: "Jag skulle vilja ha en kaffe, tack.",
    text: { es: "Quisiera un café, por favor.", en: "I would like a coffee, please.", fr: "Je voudrais un café, s'il vous plaît.", ar: "أريد قهوة من فضلك." },
  },
  {
    id: "b1-p2",
    level: "B1",
    sv: "Talar du engelska?",
    text: { es: "¿Hablas inglés?", en: "Do you speak English?", fr: "Parlez-vous anglais ?", ar: "هل تتحدث الإنجليزية؟" },
  },
  {
    id: "b1-p3",
    level: "B1",
    sv: "Igår åkte jag tåg till Madrid.",
    text: { es: "Ayer fui en tren a Madrid.", en: "Yesterday I took the train to Madrid.", fr: "Hier j'ai pris le train pour Madrid.", ar: "أمس ذهبت بالقطار إلى مدريد." },
  },
  {
    id: "b1-p4",
    level: "B1",
    sv: "Jag arbetar med marknadsföring.",
    text: { es: "Trabajo en marketing.", en: "I work in marketing.", fr: "Je travaille dans le marketing.", ar: "أعمل في التسويق." },
  },
  // ===== B2 =====
  {
    id: "b2-p1",
    level: "B2",
    sv: "Jag tycker att klimatförändringarna är vår tids största utmaning.",
    text: {
      es: "Creo que el cambio climático es el mayor desafío de nuestro tiempo.",
      en: "I think climate change is the biggest challenge of our time.",
      fr: "Je pense que le changement climatique est le plus grand défi de notre époque.",
      ar: "أعتقد أن تغير المناخ هو أكبر تحد في عصرنا.",
    },
  },
  {
    id: "b2-p2",
    level: "B2",
    sv: "Skulle du kunna förklara vad du menar?",
    text: {
      es: "¿Podrías explicar lo que quieres decir?",
      en: "Could you explain what you mean?",
      fr: "Pourrais-tu expliquer ce que tu veux dire ?",
      ar: "هل يمكنك أن تشرح ما تقصده؟",
    },
  },
  {
    id: "b2-p3",
    level: "B2",
    sv: "Det beror helt på sammanhanget.",
    text: {
      es: "Depende totalmente del contexto.",
      en: "It depends entirely on the context.",
      fr: "Cela dépend entièrement du contexte.",
      ar: "يعتمد ذلك كليا على السياق.",
    },
  },
  {
    id: "b2-p4",
    level: "B2",
    sv: "Trots att det regnade gick vi en lång promenad.",
    text: {
      es: "Aunque llovía, dimos un largo paseo.",
      en: "Although it was raining, we took a long walk.",
      fr: "Bien qu'il pleuvait, nous avons fait une longue promenade.",
      ar: "رغم أنها كانت تمطر، قمنا بنزهة طويلة.",
    },
  },
  // ===== C1 =====
  {
    id: "c1-p1",
    level: "C1",
    sv: "Det är inte någon dans på rosor men det är värt det.",
    text: {
      es: "No es un camino de rosas, pero vale la pena.",
      en: "It's no walk in the park, but it's worth it.",
      fr: "Ce n'est pas une partie de plaisir, mais ça en vaut la peine.",
      ar: "ليس الأمر سهلا، لكنه يستحق العناء.",
    },
  },
  {
    id: "c1-p2",
    level: "C1",
    sv: "Vi måste läsa mellan raderna för att förstå hans verkliga avsikt.",
    text: {
      es: "Tenemos que leer entre líneas para entender su verdadera intención.",
      en: "We have to read between the lines to understand his real intention.",
      fr: "Il faut lire entre les lignes pour comprendre sa véritable intention.",
      ar: "علينا أن نقرأ بين السطور لنفهم نيته الحقيقية.",
    },
  },
  {
    id: "c1-p3",
    level: "C1",
    sv: "Hans argument höll inte vid en närmare granskning.",
    text: {
      es: "Su argumento no se sostuvo tras un examen más detallado.",
      en: "His argument did not hold up under closer scrutiny.",
      fr: "Son argument n'a pas tenu face à un examen plus approfondi.",
      ar: "لم يصمد حجته أمام التدقيق.",
    },
  },
  {
    id: "c1-p4",
    level: "C1",
    sv: "Jag tar det med en nypa salt.",
    text: {
      es: "Lo tomo con pinzas.",
      en: "I take it with a grain of salt.",
      fr: "Je le prends avec des pincettes.",
      ar: "آخذ ذلك بحذر." ,
    },
  },
];

const ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export function getPhrases(level?: CefrLevel | null): Phrase[] {
  if (!level) return PHRASES;
  return PHRASES.filter((p) => ORDER.indexOf(p.level) <= ORDER.indexOf(level));
}

export function getPhrasesAtLevel(level: CefrLevel): Phrase[] {
  return PHRASES.filter((p) => p.level === level);
}
