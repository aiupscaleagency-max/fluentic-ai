// Ordförråd uppdelat per CEFR-nivå + track. Ett ord kan tillhöra flera tracks.
// Alla "general"-ord visas alltid; track-specifika ord visas bara om matchar aktiv track.
import type { LangCode } from "./languages";
import type { CefrLevel } from "./level";
import type { TrackId } from "./track";

export type VocabCategory =
  | "greetings"
  | "food"
  | "travel"
  | "numbers"
  | "family"
  | "work"
  | "opinions"
  | "abstract"
  | "idioms"
  | "business"
  | "academic"
  | "casual"
  // Praktika-style — vardagsbredd för 40-lektions-curriculum
  | "colors"
  | "body"
  | "home"
  | "weather"
  | "clothing"
  | "hobbies"
  | "shopping"
  | "directions"
  | "health"
  | "transport"
  | "technology"
  | "time"
  | "money"
  | "culture";

export interface VocabEntry {
  id: string;
  category: VocabCategory;
  level: CefrLevel;
  sv: string;
  word: string;
  tracks: TrackId[];
}

interface RawEntry {
  id: string;
  category: VocabCategory;
  level: CefrLevel;
  sv: string;
  t: Record<LangCode, string>;
  tracks: TrackId[];
}

// A1 — 20 entries (greetings, numbers, family, food basics) — alla "general"
const A1: RawEntry[] = [
  { id: "a1-hello", category: "greetings", level: "A1", sv: "Hej", t: { es: "Hola", en: "Hello", fr: "Bonjour", ar: "مرحبا" }, tracks: ["general"] },
  { id: "a1-bye", category: "greetings", level: "A1", sv: "Hej då", t: { es: "Adiós", en: "Goodbye", fr: "Au revoir", ar: "وداعا" }, tracks: ["general"] },
  { id: "a1-thanks", category: "greetings", level: "A1", sv: "Tack", t: { es: "Gracias", en: "Thank you", fr: "Merci", ar: "شكرا" }, tracks: ["general"] },
  { id: "a1-please", category: "greetings", level: "A1", sv: "Snälla", t: { es: "Por favor", en: "Please", fr: "S'il vous plaît", ar: "من فضلك" }, tracks: ["general"] },
  { id: "a1-yes", category: "greetings", level: "A1", sv: "Ja", t: { es: "Sí", en: "Yes", fr: "Oui", ar: "نعم" }, tracks: ["general"] },
  { id: "a1-no", category: "greetings", level: "A1", sv: "Nej", t: { es: "No", en: "No", fr: "Non", ar: "لا" }, tracks: ["general"] },
  { id: "a1-sorry", category: "greetings", level: "A1", sv: "Förlåt", t: { es: "Lo siento", en: "Sorry", fr: "Désolé", ar: "آسف" }, tracks: ["general"] },
  { id: "a1-num1", category: "numbers", level: "A1", sv: "Ett", t: { es: "Uno", en: "One", fr: "Un", ar: "واحد" }, tracks: ["general"] },
  { id: "a1-num2", category: "numbers", level: "A1", sv: "Två", t: { es: "Dos", en: "Two", fr: "Deux", ar: "اثنان" }, tracks: ["general"] },
  { id: "a1-num3", category: "numbers", level: "A1", sv: "Tre", t: { es: "Tres", en: "Three", fr: "Trois", ar: "ثلاثة" }, tracks: ["general"] },
  { id: "a1-num4", category: "numbers", level: "A1", sv: "Fyra", t: { es: "Cuatro", en: "Four", fr: "Quatre", ar: "أربعة" }, tracks: ["general"] },
  { id: "a1-num5", category: "numbers", level: "A1", sv: "Fem", t: { es: "Cinco", en: "Five", fr: "Cinq", ar: "خمسة" }, tracks: ["general"] },
  { id: "a1-mother", category: "family", level: "A1", sv: "Mamma", t: { es: "Madre", en: "Mother", fr: "Mère", ar: "أم" }, tracks: ["general"] },
  { id: "a1-father", category: "family", level: "A1", sv: "Pappa", t: { es: "Padre", en: "Father", fr: "Père", ar: "أب" }, tracks: ["general"] },
  { id: "a1-child", category: "family", level: "A1", sv: "Barn", t: { es: "Niño", en: "Child", fr: "Enfant", ar: "طفل" }, tracks: ["general"] },
  { id: "a1-friend", category: "family", level: "A1", sv: "Vän", t: { es: "Amigo", en: "Friend", fr: "Ami", ar: "صديق" }, tracks: ["general", "casual"] },
  { id: "a1-water", category: "food", level: "A1", sv: "Vatten", t: { es: "Agua", en: "Water", fr: "Eau", ar: "ماء" }, tracks: ["general"] },
  { id: "a1-bread", category: "food", level: "A1", sv: "Bröd", t: { es: "Pan", en: "Bread", fr: "Pain", ar: "خبز" }, tracks: ["general"] },
  { id: "a1-coffee", category: "food", level: "A1", sv: "Kaffe", t: { es: "Café", en: "Coffee", fr: "Café", ar: "قهوة" }, tracks: ["general"] },
  { id: "a1-apple", category: "food", level: "A1", sv: "Äpple", t: { es: "Manzana", en: "Apple", fr: "Pomme", ar: "تفاحة" }, tracks: ["general"] },
];

// A2 — 15 entries
const A2: RawEntry[] = [
  { id: "a2-tea", category: "food", level: "A2", sv: "Te", t: { es: "Té", en: "Tea", fr: "Thé", ar: "شاي" }, tracks: ["general"] },
  { id: "a2-rice", category: "food", level: "A2", sv: "Ris", t: { es: "Arroz", en: "Rice", fr: "Riz", ar: "أرز" }, tracks: ["general"] },
  { id: "a2-fish", category: "food", level: "A2", sv: "Fisk", t: { es: "Pescado", en: "Fish", fr: "Poisson", ar: "سمك" }, tracks: ["general"] },
  { id: "a2-meat", category: "food", level: "A2", sv: "Kött", t: { es: "Carne", en: "Meat", fr: "Viande", ar: "لحم" }, tracks: ["general"] },
  { id: "a2-sister", category: "family", level: "A2", sv: "Syster", t: { es: "Hermana", en: "Sister", fr: "Sœur", ar: "أخت" }, tracks: ["general"] },
  { id: "a2-brother", category: "family", level: "A2", sv: "Bror", t: { es: "Hermano", en: "Brother", fr: "Frère", ar: "أخ" }, tracks: ["general"] },
  { id: "a2-num10", category: "numbers", level: "A2", sv: "Tio", t: { es: "Diez", en: "Ten", fr: "Dix", ar: "عشرة" }, tracks: ["general"] },
  { id: "a2-num100", category: "numbers", level: "A2", sv: "Hundra", t: { es: "Cien", en: "Hundred", fr: "Cent", ar: "مئة" }, tracks: ["general"] },
  { id: "a2-house", category: "travel", level: "A2", sv: "Hus", t: { es: "Casa", en: "House", fr: "Maison", ar: "بيت" }, tracks: ["general"] },
  { id: "a2-car", category: "travel", level: "A2", sv: "Bil", t: { es: "Coche", en: "Car", fr: "Voiture", ar: "سيارة" }, tracks: ["general", "travel"] },
  { id: "a2-day", category: "greetings", level: "A2", sv: "Dag", t: { es: "Día", en: "Day", fr: "Jour", ar: "يوم" }, tracks: ["general"] },
  { id: "a2-night", category: "greetings", level: "A2", sv: "Natt", t: { es: "Noche", en: "Night", fr: "Nuit", ar: "ليلة" }, tracks: ["general"] },
  { id: "a2-good", category: "opinions", level: "A2", sv: "Bra", t: { es: "Bueno", en: "Good", fr: "Bon", ar: "جيد" }, tracks: ["general"] },
  { id: "a2-bad", category: "opinions", level: "A2", sv: "Dålig", t: { es: "Malo", en: "Bad", fr: "Mauvais", ar: "سيئ" }, tracks: ["general"] },
  { id: "a2-big", category: "opinions", level: "A2", sv: "Stor", t: { es: "Grande", en: "Big", fr: "Grand", ar: "كبير" }, tracks: ["general"] },
];

// B1 — 15 entries
const B1: RawEntry[] = [
  { id: "b1-airport", category: "travel", level: "B1", sv: "Flygplats", t: { es: "Aeropuerto", en: "Airport", fr: "Aéroport", ar: "مطار" }, tracks: ["general", "travel"] },
  { id: "b1-hotel", category: "travel", level: "B1", sv: "Hotell", t: { es: "Hotel", en: "Hotel", fr: "Hôtel", ar: "فندق" }, tracks: ["general", "travel"] },
  { id: "b1-train", category: "travel", level: "B1", sv: "Tåg", t: { es: "Tren", en: "Train", fr: "Train", ar: "قطار" }, tracks: ["general", "travel"] },
  { id: "b1-ticket", category: "travel", level: "B1", sv: "Biljett", t: { es: "Billete", en: "Ticket", fr: "Billet", ar: "تذكرة" }, tracks: ["general", "travel"] },
  { id: "b1-passport", category: "travel", level: "B1", sv: "Pass", t: { es: "Pasaporte", en: "Passport", fr: "Passeport", ar: "جواز سفر" }, tracks: ["general", "travel"] },
  { id: "b1-meeting", category: "work", level: "B1", sv: "Möte", t: { es: "Reunión", en: "Meeting", fr: "Réunion", ar: "اجتماع" }, tracks: ["general", "business"] },
  { id: "b1-job", category: "work", level: "B1", sv: "Jobb", t: { es: "Trabajo", en: "Job", fr: "Travail", ar: "عمل" }, tracks: ["general", "business"] },
  { id: "b1-boss", category: "work", level: "B1", sv: "Chef", t: { es: "Jefe", en: "Boss", fr: "Patron", ar: "رئيس" }, tracks: ["general", "business"] },
  { id: "b1-deadline", category: "work", level: "B1", sv: "Deadline", t: { es: "Plazo", en: "Deadline", fr: "Échéance", ar: "موعد نهائي" }, tracks: ["general", "business", "academic"] },
  { id: "b1-think", category: "opinions", level: "B1", sv: "Tycka", t: { es: "Pensar", en: "Think", fr: "Penser", ar: "يرى" }, tracks: ["general"] },
  { id: "b1-believe", category: "opinions", level: "B1", sv: "Tro", t: { es: "Creer", en: "Believe", fr: "Croire", ar: "يعتقد" }, tracks: ["general"] },
  { id: "b1-yesterday", category: "greetings", level: "B1", sv: "Igår", t: { es: "Ayer", en: "Yesterday", fr: "Hier", ar: "أمس" }, tracks: ["general"] },
  { id: "b1-tomorrow", category: "greetings", level: "B1", sv: "Imorgon", t: { es: "Mañana", en: "Tomorrow", fr: "Demain", ar: "غدا" }, tracks: ["general"] },
  { id: "b1-because", category: "opinions", level: "B1", sv: "Eftersom", t: { es: "Porque", en: "Because", fr: "Parce que", ar: "لأن" }, tracks: ["general"] },
  { id: "b1-although", category: "opinions", level: "B1", sv: "Fastän", t: { es: "Aunque", en: "Although", fr: "Bien que", ar: "رغم أن" }, tracks: ["general"] },
];

// B2 — 10 entries
const B2: RawEntry[] = [
  { id: "b2-experience", category: "abstract", level: "B2", sv: "Erfarenhet", t: { es: "Experiencia", en: "Experience", fr: "Expérience", ar: "خبرة" }, tracks: ["general", "business"] },
  { id: "b2-society", category: "abstract", level: "B2", sv: "Samhälle", t: { es: "Sociedad", en: "Society", fr: "Société", ar: "مجتمع" }, tracks: ["general", "academic"] },
  { id: "b2-government", category: "abstract", level: "B2", sv: "Regering", t: { es: "Gobierno", en: "Government", fr: "Gouvernement", ar: "حكومة" }, tracks: ["general", "academic"] },
  { id: "b2-environment", category: "abstract", level: "B2", sv: "Miljö", t: { es: "Medio ambiente", en: "Environment", fr: "Environnement", ar: "بيئة" }, tracks: ["general", "academic"] },
  { id: "b2-economy", category: "abstract", level: "B2", sv: "Ekonomi", t: { es: "Economía", en: "Economy", fr: "Économie", ar: "اقتصاد" }, tracks: ["general", "business", "academic"] },
  { id: "b2-research", category: "abstract", level: "B2", sv: "Forskning", t: { es: "Investigación", en: "Research", fr: "Recherche", ar: "بحث" }, tracks: ["general", "academic"] },
  { id: "b2-development", category: "abstract", level: "B2", sv: "Utveckling", t: { es: "Desarrollo", en: "Development", fr: "Développement", ar: "تطوير" }, tracks: ["general", "business"] },
  { id: "b2-relationship", category: "abstract", level: "B2", sv: "Relation", t: { es: "Relación", en: "Relationship", fr: "Relation", ar: "علاقة" }, tracks: ["general"] },
  { id: "b2-influence", category: "abstract", level: "B2", sv: "Påverkan", t: { es: "Influencia", en: "Influence", fr: "Influence", ar: "تأثير" }, tracks: ["general", "business"] },
  { id: "b2-opportunity", category: "abstract", level: "B2", sv: "Möjlighet", t: { es: "Oportunidad", en: "Opportunity", fr: "Opportunité", ar: "فرصة" }, tracks: ["general", "business"] },
];

// C1 — 5 entries
const C1: RawEntry[] = [
  { id: "c1-piece-of-cake", category: "idioms", level: "C1", sv: "Lätt som en plätt", t: { es: "Pan comido", en: "A piece of cake", fr: "Du gâteau", ar: "أمر سهل" }, tracks: ["general", "casual"] },
  { id: "c1-spill-beans", category: "idioms", level: "C1", sv: "Avslöja en hemlighet", t: { es: "Irse de la lengua", en: "Spill the beans", fr: "Vendre la mèche", ar: "يفشي السر" }, tracks: ["general", "casual"] },
  { id: "c1-resilience", category: "abstract", level: "C1", sv: "Motståndskraft", t: { es: "Resiliencia", en: "Resilience", fr: "Résilience", ar: "صمود" }, tracks: ["general", "business", "academic"] },
  { id: "c1-nuance", category: "abstract", level: "C1", sv: "Nyans", t: { es: "Matiz", en: "Nuance", fr: "Nuance", ar: "فارق دقيق" }, tracks: ["general", "academic"] },
  { id: "c1-leverage", category: "abstract", level: "C1", sv: "Hävstång (utnyttja)", t: { es: "Aprovechar", en: "Leverage", fr: "Exploiter", ar: "استغلال" }, tracks: ["general", "business"] },
];

// ===== Track-specifika tilläggspaket =====
// 8-12 entries per språk per icke-general track. Spridda på A2/B1/B2.

// --- BUSINESS ---
const BUSINESS: RawEntry[] = [
  { id: "biz-invoice", category: "business", level: "B1", sv: "Faktura", t: { es: "Factura", en: "Invoice", fr: "Facture", ar: "فاتورة" }, tracks: ["business"] },
  { id: "biz-client", category: "business", level: "A2", sv: "Kund", t: { es: "Cliente", en: "Client", fr: "Client", ar: "عميل" }, tracks: ["business"] },
  { id: "biz-contract", category: "business", level: "B1", sv: "Avtal", t: { es: "Contrato", en: "Contract", fr: "Contrat", ar: "عقد" }, tracks: ["business"] },
  { id: "biz-presentation", category: "business", level: "B1", sv: "Presentation", t: { es: "Presentación", en: "Presentation", fr: "Présentation", ar: "عرض تقديمي" }, tracks: ["business", "academic"] },
  { id: "biz-deliverable", category: "business", level: "B2", sv: "Leverabel", t: { es: "Entregable", en: "Deliverable", fr: "Livrable", ar: "مُخرَج" }, tracks: ["business"] },
  { id: "biz-stakeholder", category: "business", level: "B2", sv: "Intressent", t: { es: "Parte interesada", en: "Stakeholder", fr: "Partie prenante", ar: "صاحب مصلحة" }, tracks: ["business"] },
  { id: "biz-budget", category: "business", level: "B1", sv: "Budget", t: { es: "Presupuesto", en: "Budget", fr: "Budget", ar: "ميزانية" }, tracks: ["business"] },
  { id: "biz-proposal", category: "business", level: "B1", sv: "Förslag", t: { es: "Propuesta", en: "Proposal", fr: "Proposition", ar: "اقتراح" }, tracks: ["business"] },
  { id: "biz-kpi", category: "business", level: "B2", sv: "Nyckeltal (KPI)", t: { es: "Indicador clave (KPI)", en: "KPI", fr: "Indicateur clé (KPI)", ar: "مؤشر أداء (KPI)" }, tracks: ["business"] },
  { id: "biz-hire", category: "business", level: "B1", sv: "Anställa", t: { es: "Contratar", en: "Hire", fr: "Embaucher", ar: "يوظف" }, tracks: ["business"] },
  { id: "biz-revenue", category: "business", level: "B2", sv: "Omsättning", t: { es: "Ingresos", en: "Revenue", fr: "Chiffre d'affaires", ar: "إيرادات" }, tracks: ["business"] },
  { id: "biz-pitch", category: "business", level: "B2", sv: "Pitch", t: { es: "Pitch", en: "Pitch", fr: "Argumentaire", ar: "عرض" }, tracks: ["business"] },
];

// --- TRAVEL ---
const TRAVEL: RawEntry[] = [
  { id: "trv-customs", category: "travel", level: "B1", sv: "Tull", t: { es: "Aduana", en: "Customs", fr: "Douane", ar: "جمارك" }, tracks: ["travel"] },
  { id: "trv-departure", category: "travel", level: "A2", sv: "Avgång", t: { es: "Salida", en: "Departure", fr: "Départ", ar: "مغادرة" }, tracks: ["travel"] },
  { id: "trv-suitcase", category: "travel", level: "A2", sv: "Resväska", t: { es: "Maleta", en: "Suitcase", fr: "Valise", ar: "حقيبة سفر" }, tracks: ["travel"] },
  { id: "trv-reservation", category: "travel", level: "B1", sv: "Bokning", t: { es: "Reserva", en: "Reservation", fr: "Réservation", ar: "حجز" }, tracks: ["travel"] },
  { id: "trv-itinerary", category: "travel", level: "B2", sv: "Resplan", t: { es: "Itinerario", en: "Itinerary", fr: "Itinéraire", ar: "خط سير" }, tracks: ["travel"] },
  { id: "trv-currency", category: "travel", level: "B1", sv: "Valuta", t: { es: "Moneda", en: "Currency", fr: "Devise", ar: "عملة" }, tracks: ["travel"] },
  { id: "trv-sunscreen", category: "travel", level: "A2", sv: "Solskydd", t: { es: "Protector solar", en: "Sunscreen", fr: "Crème solaire", ar: "واقي شمس" }, tracks: ["travel"] },
  { id: "trv-layover", category: "travel", level: "B2", sv: "Mellanlandning", t: { es: "Escala", en: "Layover", fr: "Escale", ar: "توقف" }, tracks: ["travel"] },
  { id: "trv-gate", category: "travel", level: "A2", sv: "Gate", t: { es: "Puerta", en: "Gate", fr: "Porte", ar: "بوابة" }, tracks: ["travel"] },
  { id: "trv-embassy", category: "travel", level: "B2", sv: "Ambassad", t: { es: "Embajada", en: "Embassy", fr: "Ambassade", ar: "سفارة" }, tracks: ["travel"] },
  { id: "trv-refund", category: "travel", level: "B1", sv: "Återbetalning", t: { es: "Reembolso", en: "Refund", fr: "Remboursement", ar: "استرداد" }, tracks: ["travel"] },
  { id: "trv-luggage", category: "travel", level: "A2", sv: "Bagage", t: { es: "Equipaje", en: "Luggage", fr: "Bagages", ar: "أمتعة" }, tracks: ["travel"] },
];

// --- ACADEMIC ---
const ACADEMIC: RawEntry[] = [
  { id: "ac-thesis", category: "academic", level: "B2", sv: "Avhandling", t: { es: "Tesis", en: "Thesis", fr: "Thèse", ar: "أطروحة" }, tracks: ["academic"] },
  { id: "ac-hypothesis", category: "academic", level: "B2", sv: "Hypotes", t: { es: "Hipótesis", en: "Hypothesis", fr: "Hypothèse", ar: "فرضية" }, tracks: ["academic"] },
  { id: "ac-citation", category: "academic", level: "B2", sv: "Citat / källhänvisning", t: { es: "Cita", en: "Citation", fr: "Citation", ar: "اقتباس" }, tracks: ["academic"] },
  { id: "ac-lecture", category: "academic", level: "B1", sv: "Föreläsning", t: { es: "Conferencia", en: "Lecture", fr: "Cours magistral", ar: "محاضرة" }, tracks: ["academic"] },
  { id: "ac-peer-review", category: "academic", level: "B2", sv: "Kollegial granskning", t: { es: "Revisión por pares", en: "Peer review", fr: "Évaluation par les pairs", ar: "مراجعة الأقران" }, tracks: ["academic"] },
  { id: "ac-syllabus", category: "academic", level: "B1", sv: "Kursplan", t: { es: "Plan de estudios", en: "Syllabus", fr: "Programme", ar: "منهج دراسي" }, tracks: ["academic"] },
  { id: "ac-undergraduate", category: "academic", level: "B2", sv: "Grundutbildningsstudent", t: { es: "Estudiante de grado", en: "Undergraduate", fr: "Étudiant de licence", ar: "طالب جامعي" }, tracks: ["academic"] },
  { id: "ac-footnote", category: "academic", level: "B2", sv: "Fotnot", t: { es: "Nota al pie", en: "Footnote", fr: "Note de bas de page", ar: "حاشية" }, tracks: ["academic"] },
  { id: "ac-abstract", category: "academic", level: "B2", sv: "Sammanfattning (abstract)", t: { es: "Resumen", en: "Abstract", fr: "Résumé", ar: "ملخص" }, tracks: ["academic"] },
  { id: "ac-plagiarism", category: "academic", level: "B2", sv: "Plagiat", t: { es: "Plagio", en: "Plagiarism", fr: "Plagiat", ar: "انتحال" }, tracks: ["academic"] },
  { id: "ac-defense", category: "academic", level: "B2", sv: "Disputation", t: { es: "Defensa", en: "Defense", fr: "Soutenance", ar: "مناقشة" }, tracks: ["academic"] },
];

// --- CASUAL ---
const CASUAL: RawEntry[] = [
  { id: "cas-gossip", category: "casual", level: "B1", sv: "Skvaller", t: { es: "Chismes", en: "Gossip", fr: "Potins", ar: "نميمة" }, tracks: ["casual"] },
  { id: "cas-weekend", category: "casual", level: "A2", sv: "Helg", t: { es: "Fin de semana", en: "Weekend", fr: "Week-end", ar: "عطلة نهاية الأسبوع" }, tracks: ["casual"] },
  { id: "cas-vibe", category: "casual", level: "B2", sv: "Vibe / känsla", t: { es: "Vibra", en: "Vibe", fr: "Ambiance", ar: "أجواء" }, tracks: ["casual"] },
  { id: "cas-hangout", category: "casual", level: "B1", sv: "Hänga (umgås)", t: { es: "Quedar", en: "Hang out", fr: "Traîner", ar: "يخرج مع" }, tracks: ["casual"] },
  { id: "cas-chill", category: "casual", level: "B1", sv: "Chilla", t: { es: "Relajarse", en: "Chill", fr: "Se détendre", ar: "يسترخي" }, tracks: ["casual"] },
  { id: "cas-weather", category: "casual", level: "A2", sv: "Väder", t: { es: "Tiempo", en: "Weather", fr: "Temps", ar: "طقس" }, tracks: ["casual"] },
  { id: "cas-joke", category: "casual", level: "A2", sv: "Skämt", t: { es: "Chiste", en: "Joke", fr: "Blague", ar: "نكتة" }, tracks: ["casual"] },
  { id: "cas-party", category: "casual", level: "A2", sv: "Fest", t: { es: "Fiesta", en: "Party", fr: "Fête", ar: "حفلة" }, tracks: ["casual"] },
  { id: "cas-mood", category: "casual", level: "B1", sv: "Humör", t: { es: "Humor", en: "Mood", fr: "Humeur", ar: "مزاج" }, tracks: ["casual"] },
  { id: "cas-snack", category: "casual", level: "A2", sv: "Mellanmål", t: { es: "Tentempié", en: "Snack", fr: "En-cas", ar: "وجبة خفيفة" }, tracks: ["casual"] },
  { id: "cas-binge", category: "casual", level: "B2", sv: "Maratontitta", t: { es: "Maratonear", en: "Binge-watch", fr: "Binge-watcher", ar: "مشاهدة متواصلة" }, tracks: ["casual"] },
];

// ============================================================
// Praktika-style breddpaket — täcker A1-B1-vardagsord per kategori.
// Fokus: spanska + engelska + franska. Arabiska har rimlig grund-översättning
// men bör reviewas av native speaker innan ar-launch.
// ============================================================

// --- COLORS (A1) ---
const COLORS: RawEntry[] = [
  { id: "col-red", category: "colors", level: "A1", sv: "Röd", t: { es: "Rojo", en: "Red", fr: "Rouge", ar: "أحمر" }, tracks: ["general"] },
  { id: "col-blue", category: "colors", level: "A1", sv: "Blå", t: { es: "Azul", en: "Blue", fr: "Bleu", ar: "أزرق" }, tracks: ["general"] },
  { id: "col-green", category: "colors", level: "A1", sv: "Grön", t: { es: "Verde", en: "Green", fr: "Vert", ar: "أخضر" }, tracks: ["general"] },
  { id: "col-yellow", category: "colors", level: "A1", sv: "Gul", t: { es: "Amarillo", en: "Yellow", fr: "Jaune", ar: "أصفر" }, tracks: ["general"] },
  { id: "col-black", category: "colors", level: "A1", sv: "Svart", t: { es: "Negro", en: "Black", fr: "Noir", ar: "أسود" }, tracks: ["general"] },
  { id: "col-white", category: "colors", level: "A1", sv: "Vit", t: { es: "Blanco", en: "White", fr: "Blanc", ar: "أبيض" }, tracks: ["general"] },
  { id: "col-pink", category: "colors", level: "A1", sv: "Rosa", t: { es: "Rosa", en: "Pink", fr: "Rose", ar: "وردي" }, tracks: ["general"] },
  { id: "col-orange", category: "colors", level: "A1", sv: "Orange", t: { es: "Naranja", en: "Orange", fr: "Orange", ar: "برتقالي" }, tracks: ["general"] },
  { id: "col-purple", category: "colors", level: "A2", sv: "Lila", t: { es: "Morado", en: "Purple", fr: "Violet", ar: "بنفسجي" }, tracks: ["general"] },
  { id: "col-grey", category: "colors", level: "A2", sv: "Grå", t: { es: "Gris", en: "Grey", fr: "Gris", ar: "رمادي" }, tracks: ["general"] },
];

// --- BODY (A1) ---
const BODY: RawEntry[] = [
  { id: "bdy-head", category: "body", level: "A1", sv: "Huvud", t: { es: "Cabeza", en: "Head", fr: "Tête", ar: "رأس" }, tracks: ["general"] },
  { id: "bdy-eye", category: "body", level: "A1", sv: "Öga", t: { es: "Ojo", en: "Eye", fr: "Œil", ar: "عين" }, tracks: ["general"] },
  { id: "bdy-mouth", category: "body", level: "A1", sv: "Mun", t: { es: "Boca", en: "Mouth", fr: "Bouche", ar: "فم" }, tracks: ["general"] },
  { id: "bdy-hand", category: "body", level: "A1", sv: "Hand", t: { es: "Mano", en: "Hand", fr: "Main", ar: "يد" }, tracks: ["general"] },
  { id: "bdy-foot", category: "body", level: "A1", sv: "Fot", t: { es: "Pie", en: "Foot", fr: "Pied", ar: "قدم" }, tracks: ["general"] },
  { id: "bdy-arm", category: "body", level: "A1", sv: "Arm", t: { es: "Brazo", en: "Arm", fr: "Bras", ar: "ذراع" }, tracks: ["general"] },
  { id: "bdy-leg", category: "body", level: "A1", sv: "Ben", t: { es: "Pierna", en: "Leg", fr: "Jambe", ar: "ساق" }, tracks: ["general"] },
  { id: "bdy-stomach", category: "body", level: "A2", sv: "Mage", t: { es: "Estómago", en: "Stomach", fr: "Estomac", ar: "معدة" }, tracks: ["general"] },
  { id: "bdy-back", category: "body", level: "A2", sv: "Rygg", t: { es: "Espalda", en: "Back", fr: "Dos", ar: "ظهر" }, tracks: ["general"] },
  { id: "bdy-heart", category: "body", level: "A2", sv: "Hjärta", t: { es: "Corazón", en: "Heart", fr: "Cœur", ar: "قلب" }, tracks: ["general"] },
];

// --- HOME (A1) ---
const HOME: RawEntry[] = [
  { id: "hom-kitchen", category: "home", level: "A1", sv: "Kök", t: { es: "Cocina", en: "Kitchen", fr: "Cuisine", ar: "مطبخ" }, tracks: ["general"] },
  { id: "hom-bedroom", category: "home", level: "A1", sv: "Sovrum", t: { es: "Dormitorio", en: "Bedroom", fr: "Chambre", ar: "غرفة نوم" }, tracks: ["general"] },
  { id: "hom-bathroom", category: "home", level: "A1", sv: "Badrum", t: { es: "Baño", en: "Bathroom", fr: "Salle de bain", ar: "حمام" }, tracks: ["general"] },
  { id: "hom-livingroom", category: "home", level: "A1", sv: "Vardagsrum", t: { es: "Sala", en: "Living room", fr: "Salon", ar: "غرفة معيشة" }, tracks: ["general"] },
  { id: "hom-table", category: "home", level: "A1", sv: "Bord", t: { es: "Mesa", en: "Table", fr: "Table", ar: "طاولة" }, tracks: ["general"] },
  { id: "hom-chair", category: "home", level: "A1", sv: "Stol", t: { es: "Silla", en: "Chair", fr: "Chaise", ar: "كرسي" }, tracks: ["general"] },
  { id: "hom-bed", category: "home", level: "A1", sv: "Säng", t: { es: "Cama", en: "Bed", fr: "Lit", ar: "سرير" }, tracks: ["general"] },
  { id: "hom-door", category: "home", level: "A1", sv: "Dörr", t: { es: "Puerta", en: "Door", fr: "Porte", ar: "باب" }, tracks: ["general"] },
  { id: "hom-window", category: "home", level: "A1", sv: "Fönster", t: { es: "Ventana", en: "Window", fr: "Fenêtre", ar: "نافذة" }, tracks: ["general"] },
  { id: "hom-key", category: "home", level: "A2", sv: "Nyckel", t: { es: "Llave", en: "Key", fr: "Clé", ar: "مفتاح" }, tracks: ["general"] },
];

// --- WEATHER (A1) ---
const WEATHER: RawEntry[] = [
  { id: "wth-sun", category: "weather", level: "A1", sv: "Sol", t: { es: "Sol", en: "Sun", fr: "Soleil", ar: "شمس" }, tracks: ["general"] },
  { id: "wth-rain", category: "weather", level: "A1", sv: "Regn", t: { es: "Lluvia", en: "Rain", fr: "Pluie", ar: "مطر" }, tracks: ["general"] },
  { id: "wth-snow", category: "weather", level: "A1", sv: "Snö", t: { es: "Nieve", en: "Snow", fr: "Neige", ar: "ثلج" }, tracks: ["general"] },
  { id: "wth-wind", category: "weather", level: "A2", sv: "Vind", t: { es: "Viento", en: "Wind", fr: "Vent", ar: "ريح" }, tracks: ["general"] },
  { id: "wth-cloud", category: "weather", level: "A2", sv: "Moln", t: { es: "Nube", en: "Cloud", fr: "Nuage", ar: "غيمة" }, tracks: ["general"] },
  { id: "wth-cold", category: "weather", level: "A1", sv: "Kallt", t: { es: "Frío", en: "Cold", fr: "Froid", ar: "بارد" }, tracks: ["general"] },
  { id: "wth-hot", category: "weather", level: "A1", sv: "Varmt", t: { es: "Calor", en: "Hot", fr: "Chaud", ar: "حار" }, tracks: ["general"] },
  { id: "wth-storm", category: "weather", level: "B1", sv: "Storm", t: { es: "Tormenta", en: "Storm", fr: "Tempête", ar: "عاصفة" }, tracks: ["general"] },
];

// --- CLOTHING (A1) ---
const CLOTHING: RawEntry[] = [
  { id: "clo-shirt", category: "clothing", level: "A1", sv: "Skjorta", t: { es: "Camisa", en: "Shirt", fr: "Chemise", ar: "قميص" }, tracks: ["general"] },
  { id: "clo-tshirt", category: "clothing", level: "A1", sv: "T-shirt", t: { es: "Camiseta", en: "T-shirt", fr: "T-shirt", ar: "تي شيرت" }, tracks: ["general"] },
  { id: "clo-pants", category: "clothing", level: "A1", sv: "Byxor", t: { es: "Pantalones", en: "Pants", fr: "Pantalon", ar: "بنطلون" }, tracks: ["general"] },
  { id: "clo-shoes", category: "clothing", level: "A1", sv: "Skor", t: { es: "Zapatos", en: "Shoes", fr: "Chaussures", ar: "حذاء" }, tracks: ["general"] },
  { id: "clo-jacket", category: "clothing", level: "A1", sv: "Jacka", t: { es: "Chaqueta", en: "Jacket", fr: "Veste", ar: "سترة" }, tracks: ["general"] },
  { id: "clo-dress", category: "clothing", level: "A2", sv: "Klänning", t: { es: "Vestido", en: "Dress", fr: "Robe", ar: "فستان" }, tracks: ["general"] },
  { id: "clo-hat", category: "clothing", level: "A2", sv: "Hatt", t: { es: "Sombrero", en: "Hat", fr: "Chapeau", ar: "قبعة" }, tracks: ["general"] },
  { id: "clo-socks", category: "clothing", level: "A2", sv: "Strumpor", t: { es: "Calcetines", en: "Socks", fr: "Chaussettes", ar: "جوارب" }, tracks: ["general"] },
];

// --- HOBBIES (A1-B1) ---
const HOBBIES: RawEntry[] = [
  { id: "hob-music", category: "hobbies", level: "A1", sv: "Musik", t: { es: "Música", en: "Music", fr: "Musique", ar: "موسيقى" }, tracks: ["general", "casual"] },
  { id: "hob-movie", category: "hobbies", level: "A1", sv: "Film", t: { es: "Película", en: "Movie", fr: "Film", ar: "فيلم" }, tracks: ["general", "casual"] },
  { id: "hob-book", category: "hobbies", level: "A1", sv: "Bok", t: { es: "Libro", en: "Book", fr: "Livre", ar: "كتاب" }, tracks: ["general", "academic"] },
  { id: "hob-game", category: "hobbies", level: "A2", sv: "Spel", t: { es: "Juego", en: "Game", fr: "Jeu", ar: "لعبة" }, tracks: ["general", "casual"] },
  { id: "hob-soccer", category: "hobbies", level: "A2", sv: "Fotboll", t: { es: "Fútbol", en: "Football", fr: "Football", ar: "كرة قدم" }, tracks: ["general", "casual"] },
  { id: "hob-yoga", category: "hobbies", level: "A2", sv: "Yoga", t: { es: "Yoga", en: "Yoga", fr: "Yoga", ar: "يوغا" }, tracks: ["general", "casual"] },
  { id: "hob-running", category: "hobbies", level: "A2", sv: "Löpning", t: { es: "Correr", en: "Running", fr: "Course", ar: "ركض" }, tracks: ["general", "casual"] },
  { id: "hob-cooking", category: "hobbies", level: "A2", sv: "Matlagning", t: { es: "Cocinar", en: "Cooking", fr: "Cuisine", ar: "طبخ" }, tracks: ["general", "casual"] },
  { id: "hob-painting", category: "hobbies", level: "B1", sv: "Måleri", t: { es: "Pintura", en: "Painting", fr: "Peinture", ar: "رسم" }, tracks: ["general", "casual"] },
  { id: "hob-photo", category: "hobbies", level: "B1", sv: "Fotografering", t: { es: "Fotografía", en: "Photography", fr: "Photographie", ar: "تصوير" }, tracks: ["general", "casual"] },
];

// --- SHOPPING (A2) ---
const SHOPPING: RawEntry[] = [
  { id: "shp-store", category: "shopping", level: "A1", sv: "Butik", t: { es: "Tienda", en: "Store", fr: "Magasin", ar: "متجر" }, tracks: ["general"] },
  { id: "shp-price", category: "shopping", level: "A2", sv: "Pris", t: { es: "Precio", en: "Price", fr: "Prix", ar: "سعر" }, tracks: ["general"] },
  { id: "shp-cheap", category: "shopping", level: "A2", sv: "Billigt", t: { es: "Barato", en: "Cheap", fr: "Bon marché", ar: "رخيص" }, tracks: ["general"] },
  { id: "shp-expensive", category: "shopping", level: "A2", sv: "Dyrt", t: { es: "Caro", en: "Expensive", fr: "Cher", ar: "غالي" }, tracks: ["general"] },
  { id: "shp-receipt", category: "shopping", level: "A2", sv: "Kvitto", t: { es: "Recibo", en: "Receipt", fr: "Reçu", ar: "إيصال" }, tracks: ["general"] },
  { id: "shp-cash", category: "shopping", level: "A2", sv: "Kontanter", t: { es: "Efectivo", en: "Cash", fr: "Espèces", ar: "نقد" }, tracks: ["general"] },
  { id: "shp-card", category: "shopping", level: "A2", sv: "Kort", t: { es: "Tarjeta", en: "Card", fr: "Carte", ar: "بطاقة" }, tracks: ["general"] },
  { id: "shp-discount", category: "shopping", level: "B1", sv: "Rabatt", t: { es: "Descuento", en: "Discount", fr: "Remise", ar: "خصم" }, tracks: ["general"] },
  { id: "shp-size", category: "shopping", level: "A2", sv: "Storlek", t: { es: "Talla", en: "Size", fr: "Taille", ar: "مقاس" }, tracks: ["general"] },
  { id: "shp-tryon", category: "shopping", level: "B1", sv: "Prova på", t: { es: "Probarse", en: "Try on", fr: "Essayer", ar: "يجرب" }, tracks: ["general"] },
];

// --- DIRECTIONS (A2) ---
const DIRECTIONS: RawEntry[] = [
  { id: "dir-left", category: "directions", level: "A2", sv: "Vänster", t: { es: "Izquierda", en: "Left", fr: "Gauche", ar: "يسار" }, tracks: ["general"] },
  { id: "dir-right", category: "directions", level: "A2", sv: "Höger", t: { es: "Derecha", en: "Right", fr: "Droite", ar: "يمين" }, tracks: ["general"] },
  { id: "dir-straight", category: "directions", level: "A2", sv: "Rakt fram", t: { es: "Recto", en: "Straight", fr: "Tout droit", ar: "مباشرة" }, tracks: ["general"] },
  { id: "dir-corner", category: "directions", level: "A2", sv: "Hörn", t: { es: "Esquina", en: "Corner", fr: "Coin", ar: "زاوية" }, tracks: ["general"] },
  { id: "dir-near", category: "directions", level: "A2", sv: "Nära", t: { es: "Cerca", en: "Near", fr: "Près", ar: "قريب" }, tracks: ["general"] },
  { id: "dir-far", category: "directions", level: "A2", sv: "Långt bort", t: { es: "Lejos", en: "Far", fr: "Loin", ar: "بعيد" }, tracks: ["general"] },
  { id: "dir-stop", category: "directions", level: "A2", sv: "Stanna", t: { es: "Pare", en: "Stop", fr: "Arrêt", ar: "توقف" }, tracks: ["general"] },
  { id: "dir-cross", category: "directions", level: "B1", sv: "Korsning", t: { es: "Cruce", en: "Crossing", fr: "Carrefour", ar: "تقاطع" }, tracks: ["general"] },
];

// --- HEALTH (A2-B1) ---
const HEALTH: RawEntry[] = [
  { id: "hlt-doctor", category: "health", level: "A2", sv: "Läkare", t: { es: "Médico", en: "Doctor", fr: "Médecin", ar: "طبيب" }, tracks: ["general"] },
  { id: "hlt-medicine", category: "health", level: "A2", sv: "Medicin", t: { es: "Medicina", en: "Medicine", fr: "Médicament", ar: "دواء" }, tracks: ["general"] },
  { id: "hlt-pain", category: "health", level: "A2", sv: "Smärta", t: { es: "Dolor", en: "Pain", fr: "Douleur", ar: "ألم" }, tracks: ["general"] },
  { id: "hlt-fever", category: "health", level: "A2", sv: "Feber", t: { es: "Fiebre", en: "Fever", fr: "Fièvre", ar: "حمى" }, tracks: ["general"] },
  { id: "hlt-cough", category: "health", level: "A2", sv: "Hosta", t: { es: "Tos", en: "Cough", fr: "Toux", ar: "سعال" }, tracks: ["general"] },
  { id: "hlt-pharmacy", category: "health", level: "A2", sv: "Apotek", t: { es: "Farmacia", en: "Pharmacy", fr: "Pharmacie", ar: "صيدلية" }, tracks: ["general"] },
  { id: "hlt-hospital", category: "health", level: "A2", sv: "Sjukhus", t: { es: "Hospital", en: "Hospital", fr: "Hôpital", ar: "مستشفى" }, tracks: ["general"] },
  { id: "hlt-allergy", category: "health", level: "B1", sv: "Allergi", t: { es: "Alergia", en: "Allergy", fr: "Allergie", ar: "حساسية" }, tracks: ["general"] },
  { id: "hlt-insurance", category: "health", level: "B1", sv: "Försäkring", t: { es: "Seguro", en: "Insurance", fr: "Assurance", ar: "تأمين" }, tracks: ["general"] },
  { id: "hlt-symptom", category: "health", level: "B1", sv: "Symptom", t: { es: "Síntoma", en: "Symptom", fr: "Symptôme", ar: "عرض" }, tracks: ["general"] },
];

// --- TRANSPORT (A2-B1) ---
const TRANSPORT: RawEntry[] = [
  { id: "trn-bus", category: "transport", level: "A2", sv: "Buss", t: { es: "Autobús", en: "Bus", fr: "Bus", ar: "حافلة" }, tracks: ["general", "travel"] },
  { id: "trn-taxi", category: "transport", level: "A2", sv: "Taxi", t: { es: "Taxi", en: "Taxi", fr: "Taxi", ar: "تاكسي" }, tracks: ["general", "travel"] },
  { id: "trn-bike", category: "transport", level: "A2", sv: "Cykel", t: { es: "Bicicleta", en: "Bicycle", fr: "Vélo", ar: "دراجة" }, tracks: ["general"] },
  { id: "trn-metro", category: "transport", level: "A2", sv: "Tunnelbana", t: { es: "Metro", en: "Subway", fr: "Métro", ar: "مترو" }, tracks: ["general", "travel"] },
  { id: "trn-station", category: "transport", level: "A2", sv: "Station", t: { es: "Estación", en: "Station", fr: "Gare", ar: "محطة" }, tracks: ["general", "travel"] },
  { id: "trn-schedule", category: "transport", level: "B1", sv: "Tidtabell", t: { es: "Horario", en: "Schedule", fr: "Horaire", ar: "جدول مواعيد" }, tracks: ["general", "travel"] },
  { id: "trn-platform", category: "transport", level: "B1", sv: "Perrong", t: { es: "Andén", en: "Platform", fr: "Quai", ar: "رصيف" }, tracks: ["general", "travel"] },
  { id: "trn-delay", category: "transport", level: "B1", sv: "Förseningar", t: { es: "Retraso", en: "Delay", fr: "Retard", ar: "تأخير" }, tracks: ["general", "travel"] },
];

// --- TECHNOLOGY (A2-B1) ---
const TECHNOLOGY: RawEntry[] = [
  { id: "tec-phone", category: "technology", level: "A1", sv: "Telefon", t: { es: "Teléfono", en: "Phone", fr: "Téléphone", ar: "هاتف" }, tracks: ["general"] },
  { id: "tec-computer", category: "technology", level: "A2", sv: "Dator", t: { es: "Ordenador", en: "Computer", fr: "Ordinateur", ar: "حاسوب" }, tracks: ["general"] },
  { id: "tec-internet", category: "technology", level: "A2", sv: "Internet", t: { es: "Internet", en: "Internet", fr: "Internet", ar: "إنترنت" }, tracks: ["general"] },
  { id: "tec-email", category: "technology", level: "A2", sv: "E-post", t: { es: "Correo", en: "Email", fr: "E-mail", ar: "بريد إلكتروني" }, tracks: ["general", "business"] },
  { id: "tec-app", category: "technology", level: "A2", sv: "App", t: { es: "Aplicación", en: "App", fr: "Application", ar: "تطبيق" }, tracks: ["general"] },
  { id: "tec-message", category: "technology", level: "A2", sv: "Meddelande", t: { es: "Mensaje", en: "Message", fr: "Message", ar: "رسالة" }, tracks: ["general"] },
  { id: "tec-screen", category: "technology", level: "A2", sv: "Skärm", t: { es: "Pantalla", en: "Screen", fr: "Écran", ar: "شاشة" }, tracks: ["general"] },
  { id: "tec-password", category: "technology", level: "B1", sv: "Lösenord", t: { es: "Contraseña", en: "Password", fr: "Mot de passe", ar: "كلمة سر" }, tracks: ["general", "business"] },
  { id: "tec-update", category: "technology", level: "B1", sv: "Uppdatering", t: { es: "Actualización", en: "Update", fr: "Mise à jour", ar: "تحديث" }, tracks: ["general"] },
  { id: "tec-cloud", category: "technology", level: "B1", sv: "Moln (cloud)", t: { es: "Nube", en: "Cloud", fr: "Cloud", ar: "سحابة" }, tracks: ["general", "business"] },
];

// --- TIME (A1-A2) ---
const TIME: RawEntry[] = [
  { id: "tim-monday", category: "time", level: "A1", sv: "Måndag", t: { es: "Lunes", en: "Monday", fr: "Lundi", ar: "الإثنين" }, tracks: ["general"] },
  { id: "tim-friday", category: "time", level: "A1", sv: "Fredag", t: { es: "Viernes", en: "Friday", fr: "Vendredi", ar: "الجمعة" }, tracks: ["general"] },
  { id: "tim-sunday", category: "time", level: "A1", sv: "Söndag", t: { es: "Domingo", en: "Sunday", fr: "Dimanche", ar: "الأحد" }, tracks: ["general"] },
  { id: "tim-january", category: "time", level: "A2", sv: "Januari", t: { es: "Enero", en: "January", fr: "Janvier", ar: "يناير" }, tracks: ["general"] },
  { id: "tim-summer", category: "time", level: "A1", sv: "Sommar", t: { es: "Verano", en: "Summer", fr: "Été", ar: "صيف" }, tracks: ["general"] },
  { id: "tim-winter", category: "time", level: "A1", sv: "Vinter", t: { es: "Invierno", en: "Winter", fr: "Hiver", ar: "شتاء" }, tracks: ["general"] },
  { id: "tim-hour", category: "time", level: "A1", sv: "Timme", t: { es: "Hora", en: "Hour", fr: "Heure", ar: "ساعة" }, tracks: ["general"] },
  { id: "tim-minute", category: "time", level: "A1", sv: "Minut", t: { es: "Minuto", en: "Minute", fr: "Minute", ar: "دقيقة" }, tracks: ["general"] },
  { id: "tim-week", category: "time", level: "A1", sv: "Vecka", t: { es: "Semana", en: "Week", fr: "Semaine", ar: "أسبوع" }, tracks: ["general"] },
  { id: "tim-month", category: "time", level: "A2", sv: "Månad", t: { es: "Mes", en: "Month", fr: "Mois", ar: "شهر" }, tracks: ["general"] },
  { id: "tim-year", category: "time", level: "A2", sv: "År", t: { es: "Año", en: "Year", fr: "Année", ar: "سنة" }, tracks: ["general"] },
  { id: "tim-today", category: "time", level: "A1", sv: "Idag", t: { es: "Hoy", en: "Today", fr: "Aujourd'hui", ar: "اليوم" }, tracks: ["general"] },
];

// --- MONEY (B1) ---
const MONEY: RawEntry[] = [
  { id: "mon-money", category: "money", level: "A2", sv: "Pengar", t: { es: "Dinero", en: "Money", fr: "Argent", ar: "نقود" }, tracks: ["general", "business"] },
  { id: "mon-bank", category: "money", level: "A2", sv: "Bank", t: { es: "Banco", en: "Bank", fr: "Banque", ar: "بنك" }, tracks: ["general", "business"] },
  { id: "mon-salary", category: "money", level: "B1", sv: "Lön", t: { es: "Sueldo", en: "Salary", fr: "Salaire", ar: "راتب" }, tracks: ["general", "business"] },
  { id: "mon-savings", category: "money", level: "B1", sv: "Sparande", t: { es: "Ahorros", en: "Savings", fr: "Épargne", ar: "ادخار" }, tracks: ["general", "business"] },
  { id: "mon-loan", category: "money", level: "B1", sv: "Lån", t: { es: "Préstamo", en: "Loan", fr: "Prêt", ar: "قرض" }, tracks: ["general", "business"] },
  { id: "mon-tax", category: "money", level: "B1", sv: "Skatt", t: { es: "Impuesto", en: "Tax", fr: "Impôt", ar: "ضريبة" }, tracks: ["general", "business"] },
  { id: "mon-bill", category: "money", level: "A2", sv: "Räkning", t: { es: "Factura", en: "Bill", fr: "Facture", ar: "فاتورة" }, tracks: ["general"] },
  { id: "mon-tip", category: "money", level: "A2", sv: "Dricks", t: { es: "Propina", en: "Tip", fr: "Pourboire", ar: "بقشيش" }, tracks: ["general"] },
  { id: "mon-account", category: "money", level: "B1", sv: "Konto", t: { es: "Cuenta", en: "Account", fr: "Compte", ar: "حساب" }, tracks: ["general", "business"] },
];

// --- CULTURE (B1) ---
const CULTURE: RawEntry[] = [
  { id: "cul-tradition", category: "culture", level: "B1", sv: "Tradition", t: { es: "Tradición", en: "Tradition", fr: "Tradition", ar: "تقليد" }, tracks: ["general"] },
  { id: "cul-holiday", category: "culture", level: "A2", sv: "Helgdag", t: { es: "Festividad", en: "Holiday", fr: "Fête", ar: "عيد" }, tracks: ["general"] },
  { id: "cul-festival", category: "culture", level: "B1", sv: "Festival", t: { es: "Festival", en: "Festival", fr: "Festival", ar: "مهرجان" }, tracks: ["general", "casual"] },
  { id: "cul-museum", category: "culture", level: "A2", sv: "Museum", t: { es: "Museo", en: "Museum", fr: "Musée", ar: "متحف" }, tracks: ["general", "travel"] },
  { id: "cul-history", category: "culture", level: "B1", sv: "Historia", t: { es: "Historia", en: "History", fr: "Histoire", ar: "تاريخ" }, tracks: ["general", "academic"] },
  { id: "cul-art", category: "culture", level: "B1", sv: "Konst", t: { es: "Arte", en: "Art", fr: "Art", ar: "فن" }, tracks: ["general"] },
  { id: "cul-religion", category: "culture", level: "B2", sv: "Religion", t: { es: "Religión", en: "Religion", fr: "Religion", ar: "دين" }, tracks: ["general", "academic"] },
  { id: "cul-language", category: "culture", level: "B1", sv: "Språk", t: { es: "Idioma", en: "Language", fr: "Langue", ar: "لغة" }, tracks: ["general", "academic"] },
];

// --- B2/C1 utbyggnad — abstract & news/politics ---
const ADVANCED: RawEntry[] = [
  { id: "adv-debate", category: "abstract", level: "B2", sv: "Debatt", t: { es: "Debate", en: "Debate", fr: "Débat", ar: "نقاش" }, tracks: ["general", "academic"] },
  { id: "adv-argument", category: "abstract", level: "B2", sv: "Argument", t: { es: "Argumento", en: "Argument", fr: "Argument", ar: "حجة" }, tracks: ["general", "academic"] },
  { id: "adv-evidence", category: "abstract", level: "B2", sv: "Bevis", t: { es: "Prueba", en: "Evidence", fr: "Preuve", ar: "دليل" }, tracks: ["general", "academic"] },
  { id: "adv-perspective", category: "abstract", level: "B2", sv: "Perspektiv", t: { es: "Perspectiva", en: "Perspective", fr: "Perspective", ar: "منظور" }, tracks: ["general", "academic", "business"] },
  { id: "adv-policy", category: "abstract", level: "B2", sv: "Policy", t: { es: "Política", en: "Policy", fr: "Politique", ar: "سياسة" }, tracks: ["general", "business", "academic"] },
  { id: "adv-election", category: "abstract", level: "B2", sv: "Val", t: { es: "Elección", en: "Election", fr: "Élection", ar: "انتخابات" }, tracks: ["general", "academic"] },
  { id: "adv-climate", category: "abstract", level: "B2", sv: "Klimat", t: { es: "Clima", en: "Climate", fr: "Climat", ar: "مناخ" }, tracks: ["general", "academic"] },
  { id: "adv-technology", category: "abstract", level: "B2", sv: "Teknologi", t: { es: "Tecnología", en: "Technology", fr: "Technologie", ar: "تكنولوجيا" }, tracks: ["general", "business", "academic"] },
  { id: "adv-equality", category: "abstract", level: "B2", sv: "Jämlikhet", t: { es: "Igualdad", en: "Equality", fr: "Égalité", ar: "مساواة" }, tracks: ["general", "academic"] },
  { id: "adv-controversy", category: "abstract", level: "C1", sv: "Kontrovers", t: { es: "Controversia", en: "Controversy", fr: "Controverse", ar: "جدل" }, tracks: ["general", "academic"] },
  { id: "adv-paradigm", category: "abstract", level: "C1", sv: "Paradigm", t: { es: "Paradigma", en: "Paradigm", fr: "Paradigme", ar: "نموذج" }, tracks: ["general", "academic"] },
  { id: "adv-eloquent", category: "abstract", level: "C1", sv: "Vältalig", t: { es: "Elocuente", en: "Eloquent", fr: "Éloquent", ar: "بليغ" }, tracks: ["general", "academic"] },
];

// --- C1 IDIOMS — fler vardagliga uttryck ---
const IDIOMS_EXTRA: RawEntry[] = [
  { id: "idi-rain-cats-dogs", category: "idioms", level: "C1", sv: "Det öser ner", t: { es: "Llueve a cántaros", en: "It's raining cats and dogs", fr: "Il pleut des cordes", ar: "تمطر بغزارة" }, tracks: ["general", "casual"] },
  { id: "idi-break-leg", category: "idioms", level: "C1", sv: "Lycka till (i prestation)", t: { es: "¡Mucha mierda!", en: "Break a leg", fr: "Merde !", ar: "حظًا موفقًا" }, tracks: ["general", "casual"] },
  { id: "idi-cold-feet", category: "idioms", level: "C1", sv: "Få kalla fötter", t: { es: "Echarse atrás", en: "Get cold feet", fr: "Avoir la trouille", ar: "يتراجع" }, tracks: ["general", "casual"] },
  { id: "idi-hit-sack", category: "idioms", level: "C1", sv: "Gå och lägga sig", t: { es: "Irse a sobar", en: "Hit the sack", fr: "Aller au pieu", ar: "يخلد للنوم" }, tracks: ["general", "casual"] },
  { id: "idi-call-it-day", category: "idioms", level: "C1", sv: "Slå sig till ro för dagen", t: { es: "Dar por terminado el día", en: "Call it a day", fr: "Plier les gaules", ar: "ينهي اليوم" }, tracks: ["general", "business"] },
  { id: "idi-on-fence", category: "idioms", level: "C1", sv: "Sitta på staketet (obeslutsam)", t: { es: "Estar en la cuerda floja", en: "On the fence", fr: "Hésiter", ar: "متردد" }, tracks: ["general"] },
];

const ALL_RAW: RawEntry[] = [
  ...A1, ...A2, ...B1, ...B2, ...C1,
  ...BUSINESS, ...TRAVEL, ...ACADEMIC, ...CASUAL,
  // Praktika-style breddpaket
  ...COLORS, ...BODY, ...HOME, ...WEATHER, ...CLOTHING, ...HOBBIES,
  ...SHOPPING, ...DIRECTIONS, ...HEALTH, ...TRANSPORT, ...TECHNOLOGY,
  ...TIME, ...MONEY, ...CULTURE, ...ADVANCED, ...IDIOMS_EXTRA,
];

// Bygger UI-friendly entry för ett språk
function toEntry(r: RawEntry, lang: LangCode): VocabEntry {
  return { id: r.id, category: r.category, level: r.level, sv: r.sv, word: r.t[lang], tracks: r.tracks };
}

// Filtrerar på "vid eller under" CEFR-nivå + på track.
// general = visa allt. annars visa bara entries som har den track:en (eller är general).
// Stödjer både single-track (legacy) och multi-track (array) — multi gör OR mellan tracks
// och inkluderar alltid general-ord.
export function getVocab(
  lang: LangCode,
  level?: CefrLevel | null,
  track?: TrackId | TrackId[] | null,
): VocabEntry[] {
  let filtered = level ? ALL_RAW.filter((r) => isAtOrBelow(r.level, level)) : ALL_RAW;

  // Normalisera till lista
  const tracks: TrackId[] = Array.isArray(track)
    ? track
    : track
      ? [track]
      : [];

  // Om "general" finns med — visa allt (general inkluderar alla)
  const hasGeneral = tracks.includes("general");
  const realTracks: TrackId[] = tracks.filter((t) => t !== "general");

  if (!hasGeneral && realTracks.length > 0) {
    const matchesReal = (r: RawEntry) =>
      r.tracks.some((t: TrackId) => (realTracks as TrackId[]).includes(t));
    filtered = filtered.filter((r) => matchesReal(r) || r.tracks.includes("general"));
  }
  return filtered.map((r) => toEntry(r, lang));
}

export function getVocabByLevel(lang: LangCode, level: CefrLevel): VocabEntry[] {
  return ALL_RAW.filter((r) => r.level === level).map((r) => toEntry(r, lang));
}

const ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];
function isAtOrBelow(item: CefrLevel, max: CefrLevel): boolean {
  return ORDER.indexOf(item) <= ORDER.indexOf(max);
}
