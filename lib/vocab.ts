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
  | "casual";

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
  { id: "a2-night", category: "greetings", level: "A2", sv: "Natt", t: { es: "Noche", en: "Night", fr: "Nuit", ar: "ليل" }, tracks: ["general"] },
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
  { id: "b1-think", category: "opinions", level: "B1", sv: "Tycka", t: { es: "Pensar", en: "Think", fr: "Penser", ar: "يعتقد" }, tracks: ["general"] },
  { id: "b1-believe", category: "opinions", level: "B1", sv: "Tro", t: { es: "Creer", en: "Believe", fr: "Croire", ar: "يصدق" }, tracks: ["general"] },
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
  { id: "biz-deliverable", category: "business", level: "B2", sv: "Leverabel", t: { es: "Entregable", en: "Deliverable", fr: "Livrable", ar: "ناتج التسليم" }, tracks: ["business"] },
  { id: "biz-stakeholder", category: "business", level: "B2", sv: "Intressent", t: { es: "Interesado", en: "Stakeholder", fr: "Partie prenante", ar: "صاحب مصلحة" }, tracks: ["business"] },
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
  { id: "cas-snack", category: "casual", level: "A2", sv: "Mellanmål", t: { es: "Aperitivo", en: "Snack", fr: "Encas", ar: "وجبة خفيفة" }, tracks: ["casual"] },
  { id: "cas-binge", category: "casual", level: "B2", sv: "Maratontitta", t: { es: "Maratonear", en: "Binge-watch", fr: "Binge-watcher", ar: "مشاهدة متواصلة" }, tracks: ["casual"] },
];

const ALL_RAW: RawEntry[] = [...A1, ...A2, ...B1, ...B2, ...C1, ...BUSINESS, ...TRAVEL, ...ACADEMIC, ...CASUAL];

// Bygger UI-friendly entry för ett språk
function toEntry(r: RawEntry, lang: LangCode): VocabEntry {
  return { id: r.id, category: r.category, level: r.level, sv: r.sv, word: r.t[lang], tracks: r.tracks };
}

// Filtrerar på "vid eller under" CEFR-nivå + på track.
// general = visa allt. annars visa bara entries som har den track:en (eller är general).
export function getVocab(
  lang: LangCode,
  level?: CefrLevel | null,
  track?: TrackId | null,
): VocabEntry[] {
  let filtered = level ? ALL_RAW.filter((r) => isAtOrBelow(r.level, level)) : ALL_RAW;
  if (track && track !== "general") {
    filtered = filtered.filter((r) => r.tracks.includes(track) || r.tracks.includes("general"));
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
