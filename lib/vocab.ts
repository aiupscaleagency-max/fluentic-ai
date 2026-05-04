// Startordförråd: 30+ ord per språk över kategorierna hälsningar, mat, resor, siffror, familj
import type { LangCode } from "./languages";

export type VocabCategory = "greetings" | "food" | "travel" | "numbers" | "family";

export interface VocabEntry {
  id: string; // Stabilt id, t.ex. "greet-hello"
  category: VocabCategory;
  sv: string; // Svenska (källspråk för UI)
  word: string; // Ord på målspråk
}

const greetings: { id: string; sv: string; t: Record<LangCode, string> }[] = [
  { id: "greet-hello", sv: "Hej", t: { es: "Hola", en: "Hello", fr: "Bonjour", ar: "مرحبا" } },
  { id: "greet-goodbye", sv: "Hej då", t: { es: "Adiós", en: "Goodbye", fr: "Au revoir", ar: "وداعا" } },
  { id: "greet-thanks", sv: "Tack", t: { es: "Gracias", en: "Thank you", fr: "Merci", ar: "شكرا" } },
  { id: "greet-please", sv: "Snälla", t: { es: "Por favor", en: "Please", fr: "S'il vous plaît", ar: "من فضلك" } },
  { id: "greet-yes", sv: "Ja", t: { es: "Sí", en: "Yes", fr: "Oui", ar: "نعم" } },
  { id: "greet-no", sv: "Nej", t: { es: "No", en: "No", fr: "Non", ar: "لا" } },
  { id: "greet-sorry", sv: "Förlåt", t: { es: "Lo siento", en: "Sorry", fr: "Désolé", ar: "آسف" } },
];

const food: { id: string; sv: string; t: Record<LangCode, string> }[] = [
  { id: "food-water", sv: "Vatten", t: { es: "Agua", en: "Water", fr: "Eau", ar: "ماء" } },
  { id: "food-bread", sv: "Bröd", t: { es: "Pan", en: "Bread", fr: "Pain", ar: "خبز" } },
  { id: "food-coffee", sv: "Kaffe", t: { es: "Café", en: "Coffee", fr: "Café", ar: "قهوة" } },
  { id: "food-tea", sv: "Te", t: { es: "Té", en: "Tea", fr: "Thé", ar: "شاي" } },
  { id: "food-apple", sv: "Äpple", t: { es: "Manzana", en: "Apple", fr: "Pomme", ar: "تفاحة" } },
  { id: "food-rice", sv: "Ris", t: { es: "Arroz", en: "Rice", fr: "Riz", ar: "أرز" } },
  { id: "food-fish", sv: "Fisk", t: { es: "Pescado", en: "Fish", fr: "Poisson", ar: "سمك" } },
  { id: "food-meat", sv: "Kött", t: { es: "Carne", en: "Meat", fr: "Viande", ar: "لحم" } },
];

const travel: { id: string; sv: string; t: Record<LangCode, string> }[] = [
  { id: "travel-airport", sv: "Flygplats", t: { es: "Aeropuerto", en: "Airport", fr: "Aéroport", ar: "مطار" } },
  { id: "travel-hotel", sv: "Hotell", t: { es: "Hotel", en: "Hotel", fr: "Hôtel", ar: "فندق" } },
  { id: "travel-train", sv: "Tåg", t: { es: "Tren", en: "Train", fr: "Train", ar: "قطار" } },
  { id: "travel-ticket", sv: "Biljett", t: { es: "Billete", en: "Ticket", fr: "Billet", ar: "تذكرة" } },
  { id: "travel-passport", sv: "Pass", t: { es: "Pasaporte", en: "Passport", fr: "Passeport", ar: "جواز سفر" } },
  { id: "travel-map", sv: "Karta", t: { es: "Mapa", en: "Map", fr: "Carte", ar: "خريطة" } },
  { id: "travel-left", sv: "Vänster", t: { es: "Izquierda", en: "Left", fr: "Gauche", ar: "يسار" } },
  { id: "travel-right", sv: "Höger", t: { es: "Derecha", en: "Right", fr: "Droite", ar: "يمين" } },
];

const numbers: { id: string; sv: string; t: Record<LangCode, string> }[] = [
  { id: "num-1", sv: "Ett", t: { es: "Uno", en: "One", fr: "Un", ar: "واحد" } },
  { id: "num-2", sv: "Två", t: { es: "Dos", en: "Two", fr: "Deux", ar: "اثنان" } },
  { id: "num-3", sv: "Tre", t: { es: "Tres", en: "Three", fr: "Trois", ar: "ثلاثة" } },
  { id: "num-4", sv: "Fyra", t: { es: "Cuatro", en: "Four", fr: "Quatre", ar: "أربعة" } },
  { id: "num-5", sv: "Fem", t: { es: "Cinco", en: "Five", fr: "Cinq", ar: "خمسة" } },
  { id: "num-10", sv: "Tio", t: { es: "Diez", en: "Ten", fr: "Dix", ar: "عشرة" } },
  { id: "num-100", sv: "Hundra", t: { es: "Cien", en: "Hundred", fr: "Cent", ar: "مئة" } },
];

const family: { id: string; sv: string; t: Record<LangCode, string> }[] = [
  { id: "fam-mother", sv: "Mamma", t: { es: "Madre", en: "Mother", fr: "Mère", ar: "أم" } },
  { id: "fam-father", sv: "Pappa", t: { es: "Padre", en: "Father", fr: "Père", ar: "أب" } },
  { id: "fam-sister", sv: "Syster", t: { es: "Hermana", en: "Sister", fr: "Sœur", ar: "أخت" } },
  { id: "fam-brother", sv: "Bror", t: { es: "Hermano", en: "Brother", fr: "Frère", ar: "أخ" } },
  { id: "fam-child", sv: "Barn", t: { es: "Niño", en: "Child", fr: "Enfant", ar: "طفل" } },
  { id: "fam-friend", sv: "Vän", t: { es: "Amigo", en: "Friend", fr: "Ami", ar: "صديق" } },
];

const ALL_GROUPS: Record<VocabCategory, { id: string; sv: string; t: Record<LangCode, string> }[]> = {
  greetings,
  food,
  travel,
  numbers,
  family,
};

export function getVocab(lang: LangCode): VocabEntry[] {
  const out: VocabEntry[] = [];
  (Object.keys(ALL_GROUPS) as VocabCategory[]).forEach((cat) => {
    ALL_GROUPS[cat].forEach((row) => {
      out.push({ id: row.id, category: cat, sv: row.sv, word: row.t[lang] });
    });
  });
  return out;
}
