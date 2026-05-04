// Ordförråd uppdelat per CEFR-nivå. 60+ ord per språk: A1 (20) / A2 (15) / B1 (15) / B2 (10) / C1 (5)
import type { LangCode } from "./languages";
import type { CefrLevel } from "./level";

export type VocabCategory =
  | "greetings"
  | "food"
  | "travel"
  | "numbers"
  | "family"
  | "work"
  | "opinions"
  | "abstract"
  | "idioms";

export interface VocabEntry {
  id: string;
  category: VocabCategory;
  level: CefrLevel;
  sv: string;
  word: string;
}

interface RawEntry {
  id: string;
  category: VocabCategory;
  level: CefrLevel;
  sv: string;
  t: Record<LangCode, string>;
}

// A1 — 20 entries (greetings, numbers, family, food basics)
const A1: RawEntry[] = [
  { id: "a1-hello", category: "greetings", level: "A1", sv: "Hej", t: { es: "Hola", en: "Hello", fr: "Bonjour", ar: "مرحبا" } },
  { id: "a1-bye", category: "greetings", level: "A1", sv: "Hej då", t: { es: "Adiós", en: "Goodbye", fr: "Au revoir", ar: "وداعا" } },
  { id: "a1-thanks", category: "greetings", level: "A1", sv: "Tack", t: { es: "Gracias", en: "Thank you", fr: "Merci", ar: "شكرا" } },
  { id: "a1-please", category: "greetings", level: "A1", sv: "Snälla", t: { es: "Por favor", en: "Please", fr: "S'il vous plaît", ar: "من فضلك" } },
  { id: "a1-yes", category: "greetings", level: "A1", sv: "Ja", t: { es: "Sí", en: "Yes", fr: "Oui", ar: "نعم" } },
  { id: "a1-no", category: "greetings", level: "A1", sv: "Nej", t: { es: "No", en: "No", fr: "Non", ar: "لا" } },
  { id: "a1-sorry", category: "greetings", level: "A1", sv: "Förlåt", t: { es: "Lo siento", en: "Sorry", fr: "Désolé", ar: "آسف" } },
  { id: "a1-num1", category: "numbers", level: "A1", sv: "Ett", t: { es: "Uno", en: "One", fr: "Un", ar: "واحد" } },
  { id: "a1-num2", category: "numbers", level: "A1", sv: "Två", t: { es: "Dos", en: "Two", fr: "Deux", ar: "اثنان" } },
  { id: "a1-num3", category: "numbers", level: "A1", sv: "Tre", t: { es: "Tres", en: "Three", fr: "Trois", ar: "ثلاثة" } },
  { id: "a1-num4", category: "numbers", level: "A1", sv: "Fyra", t: { es: "Cuatro", en: "Four", fr: "Quatre", ar: "أربعة" } },
  { id: "a1-num5", category: "numbers", level: "A1", sv: "Fem", t: { es: "Cinco", en: "Five", fr: "Cinq", ar: "خمسة" } },
  { id: "a1-mother", category: "family", level: "A1", sv: "Mamma", t: { es: "Madre", en: "Mother", fr: "Mère", ar: "أم" } },
  { id: "a1-father", category: "family", level: "A1", sv: "Pappa", t: { es: "Padre", en: "Father", fr: "Père", ar: "أب" } },
  { id: "a1-child", category: "family", level: "A1", sv: "Barn", t: { es: "Niño", en: "Child", fr: "Enfant", ar: "طفل" } },
  { id: "a1-friend", category: "family", level: "A1", sv: "Vän", t: { es: "Amigo", en: "Friend", fr: "Ami", ar: "صديق" } },
  { id: "a1-water", category: "food", level: "A1", sv: "Vatten", t: { es: "Agua", en: "Water", fr: "Eau", ar: "ماء" } },
  { id: "a1-bread", category: "food", level: "A1", sv: "Bröd", t: { es: "Pan", en: "Bread", fr: "Pain", ar: "خبز" } },
  { id: "a1-coffee", category: "food", level: "A1", sv: "Kaffe", t: { es: "Café", en: "Coffee", fr: "Café", ar: "قهوة" } },
  { id: "a1-apple", category: "food", level: "A1", sv: "Äpple", t: { es: "Manzana", en: "Apple", fr: "Pomme", ar: "تفاحة" } },
];

// A2 — 15 entries (more food, family, numbers, simple travel)
const A2: RawEntry[] = [
  { id: "a2-tea", category: "food", level: "A2", sv: "Te", t: { es: "Té", en: "Tea", fr: "Thé", ar: "شاي" } },
  { id: "a2-rice", category: "food", level: "A2", sv: "Ris", t: { es: "Arroz", en: "Rice", fr: "Riz", ar: "أرز" } },
  { id: "a2-fish", category: "food", level: "A2", sv: "Fisk", t: { es: "Pescado", en: "Fish", fr: "Poisson", ar: "سمك" } },
  { id: "a2-meat", category: "food", level: "A2", sv: "Kött", t: { es: "Carne", en: "Meat", fr: "Viande", ar: "لحم" } },
  { id: "a2-sister", category: "family", level: "A2", sv: "Syster", t: { es: "Hermana", en: "Sister", fr: "Sœur", ar: "أخت" } },
  { id: "a2-brother", category: "family", level: "A2", sv: "Bror", t: { es: "Hermano", en: "Brother", fr: "Frère", ar: "أخ" } },
  { id: "a2-num10", category: "numbers", level: "A2", sv: "Tio", t: { es: "Diez", en: "Ten", fr: "Dix", ar: "عشرة" } },
  { id: "a2-num100", category: "numbers", level: "A2", sv: "Hundra", t: { es: "Cien", en: "Hundred", fr: "Cent", ar: "مئة" } },
  { id: "a2-house", category: "travel", level: "A2", sv: "Hus", t: { es: "Casa", en: "House", fr: "Maison", ar: "بيت" } },
  { id: "a2-car", category: "travel", level: "A2", sv: "Bil", t: { es: "Coche", en: "Car", fr: "Voiture", ar: "سيارة" } },
  { id: "a2-day", category: "greetings", level: "A2", sv: "Dag", t: { es: "Día", en: "Day", fr: "Jour", ar: "يوم" } },
  { id: "a2-night", category: "greetings", level: "A2", sv: "Natt", t: { es: "Noche", en: "Night", fr: "Nuit", ar: "ليل" } },
  { id: "a2-good", category: "opinions", level: "A2", sv: "Bra", t: { es: "Bueno", en: "Good", fr: "Bon", ar: "جيد" } },
  { id: "a2-bad", category: "opinions", level: "A2", sv: "Dålig", t: { es: "Malo", en: "Bad", fr: "Mauvais", ar: "سيئ" } },
  { id: "a2-big", category: "opinions", level: "A2", sv: "Stor", t: { es: "Grande", en: "Big", fr: "Grand", ar: "كبير" } },
];

// B1 — 15 entries (travel, work, opinions, past/future)
const B1: RawEntry[] = [
  { id: "b1-airport", category: "travel", level: "B1", sv: "Flygplats", t: { es: "Aeropuerto", en: "Airport", fr: "Aéroport", ar: "مطار" } },
  { id: "b1-hotel", category: "travel", level: "B1", sv: "Hotell", t: { es: "Hotel", en: "Hotel", fr: "Hôtel", ar: "فندق" } },
  { id: "b1-train", category: "travel", level: "B1", sv: "Tåg", t: { es: "Tren", en: "Train", fr: "Train", ar: "قطار" } },
  { id: "b1-ticket", category: "travel", level: "B1", sv: "Biljett", t: { es: "Billete", en: "Ticket", fr: "Billet", ar: "تذكرة" } },
  { id: "b1-passport", category: "travel", level: "B1", sv: "Pass", t: { es: "Pasaporte", en: "Passport", fr: "Passeport", ar: "جواز سفر" } },
  { id: "b1-meeting", category: "work", level: "B1", sv: "Möte", t: { es: "Reunión", en: "Meeting", fr: "Réunion", ar: "اجتماع" } },
  { id: "b1-job", category: "work", level: "B1", sv: "Jobb", t: { es: "Trabajo", en: "Job", fr: "Travail", ar: "عمل" } },
  { id: "b1-boss", category: "work", level: "B1", sv: "Chef", t: { es: "Jefe", en: "Boss", fr: "Patron", ar: "رئيس" } },
  { id: "b1-deadline", category: "work", level: "B1", sv: "Deadline", t: { es: "Plazo", en: "Deadline", fr: "Échéance", ar: "موعد نهائي" } },
  { id: "b1-think", category: "opinions", level: "B1", sv: "Tycka", t: { es: "Pensar", en: "Think", fr: "Penser", ar: "يعتقد" } },
  { id: "b1-believe", category: "opinions", level: "B1", sv: "Tro", t: { es: "Creer", en: "Believe", fr: "Croire", ar: "يصدق" } },
  { id: "b1-yesterday", category: "greetings", level: "B1", sv: "Igår", t: { es: "Ayer", en: "Yesterday", fr: "Hier", ar: "أمس" } },
  { id: "b1-tomorrow", category: "greetings", level: "B1", sv: "Imorgon", t: { es: "Mañana", en: "Tomorrow", fr: "Demain", ar: "غدا" } },
  { id: "b1-because", category: "opinions", level: "B1", sv: "Eftersom", t: { es: "Porque", en: "Because", fr: "Parce que", ar: "لأن" } },
  { id: "b1-although", category: "opinions", level: "B1", sv: "Fastän", t: { es: "Aunque", en: "Although", fr: "Bien que", ar: "رغم أن" } },
];

// B2 — 10 entries (complex topics, abstract)
const B2: RawEntry[] = [
  { id: "b2-experience", category: "abstract", level: "B2", sv: "Erfarenhet", t: { es: "Experiencia", en: "Experience", fr: "Expérience", ar: "خبرة" } },
  { id: "b2-society", category: "abstract", level: "B2", sv: "Samhälle", t: { es: "Sociedad", en: "Society", fr: "Société", ar: "مجتمع" } },
  { id: "b2-government", category: "abstract", level: "B2", sv: "Regering", t: { es: "Gobierno", en: "Government", fr: "Gouvernement", ar: "حكومة" } },
  { id: "b2-environment", category: "abstract", level: "B2", sv: "Miljö", t: { es: "Medio ambiente", en: "Environment", fr: "Environnement", ar: "بيئة" } },
  { id: "b2-economy", category: "abstract", level: "B2", sv: "Ekonomi", t: { es: "Economía", en: "Economy", fr: "Économie", ar: "اقتصاد" } },
  { id: "b2-research", category: "abstract", level: "B2", sv: "Forskning", t: { es: "Investigación", en: "Research", fr: "Recherche", ar: "بحث" } },
  { id: "b2-development", category: "abstract", level: "B2", sv: "Utveckling", t: { es: "Desarrollo", en: "Development", fr: "Développement", ar: "تطوير" } },
  { id: "b2-relationship", category: "abstract", level: "B2", sv: "Relation", t: { es: "Relación", en: "Relationship", fr: "Relation", ar: "علاقة" } },
  { id: "b2-influence", category: "abstract", level: "B2", sv: "Påverkan", t: { es: "Influencia", en: "Influence", fr: "Influence", ar: "تأثير" } },
  { id: "b2-opportunity", category: "abstract", level: "B2", sv: "Möjlighet", t: { es: "Oportunidad", en: "Opportunity", fr: "Opportunité", ar: "فرصة" } },
];

// C1 — 5 entries (idioms, abstract nuances)
const C1: RawEntry[] = [
  { id: "c1-piece-of-cake", category: "idioms", level: "C1", sv: "Lätt som en plätt", t: { es: "Pan comido", en: "A piece of cake", fr: "Du gâteau", ar: "أمر سهل" } },
  { id: "c1-spill-beans", category: "idioms", level: "C1", sv: "Avslöja en hemlighet", t: { es: "Irse de la lengua", en: "Spill the beans", fr: "Vendre la mèche", ar: "يفشي السر" } },
  { id: "c1-resilience", category: "abstract", level: "C1", sv: "Motståndskraft", t: { es: "Resiliencia", en: "Resilience", fr: "Résilience", ar: "صمود" } },
  { id: "c1-nuance", category: "abstract", level: "C1", sv: "Nyans", t: { es: "Matiz", en: "Nuance", fr: "Nuance", ar: "فارق دقيق" } },
  { id: "c1-leverage", category: "abstract", level: "C1", sv: "Hävstång (utnyttja)", t: { es: "Aprovechar", en: "Leverage", fr: "Exploiter", ar: "استغلال" } },
];

const ALL_RAW: RawEntry[] = [...A1, ...A2, ...B1, ...B2, ...C1];

export function getVocab(lang: LangCode, level?: CefrLevel | null): VocabEntry[] {
  const filtered = level ? ALL_RAW.filter((r) => isAtOrBelow(r.level, level)) : ALL_RAW;
  return filtered.map((r) => ({
    id: r.id,
    category: r.category,
    level: r.level,
    sv: r.sv,
    word: r.t[lang],
  }));
}

export function getVocabByLevel(lang: LangCode, level: CefrLevel): VocabEntry[] {
  return ALL_RAW.filter((r) => r.level === level).map((r) => ({
    id: r.id,
    category: r.category,
    level: r.level,
    sv: r.sv,
    word: r.t[lang],
  }));
}

const ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];
function isAtOrBelow(item: CefrLevel, max: CefrLevel): boolean {
  return ORDER.indexOf(item) <= ORDER.indexOf(max);
}
