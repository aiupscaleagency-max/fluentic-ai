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
    text: { es: "Quisiera un café, por favor.", en: "I would like a coffee, please.", fr: "Je voudrais un café, s'il vous plaît.", ar: "أرغب في قهوة من فضلك." },
  },
  {
    id: "b1-p2",
    level: "B1",
    sv: "Talar du engelska?",
    text: { es: "¿Hablas inglés?", en: "Do you speak English?", fr: "Tu parles anglais ?", ar: "هل تتحدث الإنجليزية؟" },
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
      fr: "Bien qu'il pleuve, nous avons fait une longue promenade.",
      ar: "رغم أنها كانت تمطر، قمنا بنزهة طويلة.",
    },
  },
  // ===== C1 =====
  {
    id: "c1-p1",
    level: "C1",
    sv: "Det är ingen dans på rosor, men det är värt det.",
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
      ar: "لم تصمد حجته أمام التدقيق.",
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
      ar: "آخذ ذلك بحذر.",
    },
  },

  // ============================================================
  // 40-lektions-curriculum: 4-6 fraser per ny lektion (A1 → C1).
  // Fokus es+en+fr; ar har grund-översättning för typsystemet.
  // ============================================================

  // ----- A1 -----
  // Lesson 3 — Siffror & tid
  { id: "a1-time-1", level: "A1", sv: "Klockan är åtta.", text: { es: "Son las ocho.", en: "It's eight o'clock.", fr: "Il est huit heures.", ar: "الساعة الثامنة." } },
  { id: "a1-time-2", level: "A1", sv: "Jag är tjugofem år.", text: { es: "Tengo veinticinco años.", en: "I am twenty-five years old.", fr: "J'ai vingt-cinq ans.", ar: "عمري خمسة وعشرون سنة." } },
  { id: "a1-time-3", level: "A1", sv: "Vi ses klockan tre.", text: { es: "Nos vemos a las tres.", en: "See you at three.", fr: "On se voit à trois heures.", ar: "نلتقي الساعة الثالثة." } },
  // Lesson 5 — Färger
  { id: "a1-col-1", level: "A1", sv: "Min jacka är blå.", text: { es: "Mi chaqueta es azul.", en: "My jacket is blue.", fr: "Ma veste est bleue.", ar: "سترتي زرقاء." } },
  { id: "a1-col-2", level: "A1", sv: "Den röda bilen är min.", text: { es: "El coche rojo es mío.", en: "The red car is mine.", fr: "La voiture rouge est à moi.", ar: "السيارة الحمراء لي." } },
  // Lesson 6 — Kroppen
  { id: "a1-bdy-1", level: "A1", sv: "Mitt huvud gör ont.", text: { es: "Me duele la cabeza.", en: "My head hurts.", fr: "J'ai mal à la tête.", ar: "رأسي يؤلمني." } },
  { id: "a1-bdy-2", level: "A1", sv: "Jag har två händer.", text: { es: "Tengo dos manos.", en: "I have two hands.", fr: "J'ai deux mains.", ar: "لدي يدان." } },
  // Lesson 7 — Hemma
  { id: "a1-hom-1", level: "A1", sv: "Köket är litet.", text: { es: "La cocina es pequeña.", en: "The kitchen is small.", fr: "La cuisine est petite.", ar: "المطبخ صغير." } },
  { id: "a1-hom-2", level: "A1", sv: "Sovrummet är där.", text: { es: "El dormitorio está allí.", en: "The bedroom is there.", fr: "La chambre est là-bas.", ar: "غرفة النوم هناك." } },
  // Lesson 8 — Vädret
  { id: "a1-wth-1", level: "A1", sv: "Det är soligt idag.", text: { es: "Hace sol hoy.", en: "It's sunny today.", fr: "Il fait soleil aujourd'hui.", ar: "الجو مشمس اليوم." } },
  { id: "a1-wth-2", level: "A1", sv: "Det regnar.", text: { es: "Está lloviendo.", en: "It's raining.", fr: "Il pleut.", ar: "إنها تمطر." } },
  // Lesson 9 — Kläder
  { id: "a1-clo-1", level: "A1", sv: "Jag har en svart t-shirt.", text: { es: "Tengo una camiseta negra.", en: "I have a black t-shirt.", fr: "J'ai un t-shirt noir.", ar: "لدي تي شيرت أسود." } },
  { id: "a1-clo-2", level: "A1", sv: "Var är mina skor?", text: { es: "¿Dónde están mis zapatos?", en: "Where are my shoes?", fr: "Où sont mes chaussures ?", ar: "أين حذائي؟" } },
  // Lesson 10 — Hobbys
  { id: "a1-hob-1", level: "A1", sv: "Jag älskar musik.", text: { es: "Me encanta la música.", en: "I love music.", fr: "J'adore la musique.", ar: "أحب الموسيقى." } },
  { id: "a1-hob-2", level: "A1", sv: "Vi tittar på en film.", text: { es: "Vemos una película.", en: "We're watching a movie.", fr: "On regarde un film.", ar: "نشاهد فيلما." } },

  // ----- A2 -----
  // Lesson 11 — På café
  { id: "a2-cafe-1", level: "A2", sv: "Får jag be om en latte?", text: { es: "¿Me pone un café con leche?", en: "Can I have a latte?", fr: "Je peux avoir un café au lait ?", ar: "ممكن قهوة بالحليب؟" } },
  { id: "a2-cafe-2", level: "A2", sv: "Med eller utan socker?", text: { es: "¿Con o sin azúcar?", en: "With or without sugar?", fr: "Avec ou sans sucre ?", ar: "مع أو بدون سكر؟" } },
  // Lesson 12 — Att handla
  { id: "a2-shp-1", level: "A2", sv: "Hur mycket kostar det här?", text: { es: "¿Cuánto cuesta esto?", en: "How much does this cost?", fr: "Combien ça coûte ?", ar: "كم سعر هذا؟" } },
  { id: "a2-shp-2", level: "A2", sv: "Jag tar den i medium.", text: { es: "Me la llevo en talla mediana.", en: "I'll take it in medium.", fr: "Je la prends en taille moyenne.", ar: "آخذها مقاس متوسط." } },
  // Lesson 13 — Vägbeskrivning
  { id: "a2-dir-1", level: "A2", sv: "Sväng till höger vid hörnet.", text: { es: "Gira a la derecha en la esquina.", en: "Turn right at the corner.", fr: "Tourne à droite au coin.", ar: "انعطف يمينا عند الزاوية." } },
  { id: "a2-dir-2", level: "A2", sv: "Det är nära här.", text: { es: "Está cerca de aquí.", en: "It's near here.", fr: "C'est près d'ici.", ar: "إنه قريب من هنا." } },
  // Lesson 14 — Hos doktorn
  { id: "a2-hlt-1", level: "A2", sv: "Jag har feber.", text: { es: "Tengo fiebre.", en: "I have a fever.", fr: "J'ai de la fièvre.", ar: "لدي حمى." } },
  { id: "a2-hlt-2", level: "A2", sv: "Det gör ont i magen.", text: { es: "Me duele el estómago.", en: "My stomach hurts.", fr: "J'ai mal au ventre.", ar: "معدتي تؤلمني." } },
  // Lesson 15 — Transport
  { id: "a2-trn-1", level: "A2", sv: "När går nästa buss?", text: { es: "¿Cuándo sale el próximo autobús?", en: "When is the next bus?", fr: "À quelle heure est le prochain bus ?", ar: "متى الحافلة القادمة؟" } },
  { id: "a2-trn-2", level: "A2", sv: "En biljett till centrum, tack.", text: { es: "Un billete al centro, por favor.", en: "One ticket to downtown, please.", fr: "Un billet pour le centre, s'il vous plaît.", ar: "تذكرة إلى المركز، من فضلك." } },
  // Lesson 16 — Telefon
  { id: "a2-tec-1", level: "A2", sv: "Kan jag få ditt nummer?", text: { es: "¿Me das tu número?", en: "Can I have your number?", fr: "Tu peux me donner ton numéro ?", ar: "هل تعطيني رقمك؟" } },
  { id: "a2-tec-2", level: "A2", sv: "Jag ringer dig senare.", text: { es: "Te llamo más tarde.", en: "I'll call you later.", fr: "Je t'appelle plus tard.", ar: "سأتصل بك لاحقا." } },
  // Lesson 17 — Restaurang
  { id: "a2-rst-1", level: "A2", sv: "Vi skulle vilja boka ett bord för två.", text: { es: "Quisiéramos reservar mesa para dos.", en: "We'd like to book a table for two.", fr: "On voudrait réserver une table pour deux.", ar: "نريد حجز طاولة لشخصين." } },
  { id: "a2-rst-2", level: "A2", sv: "Notan, tack.", text: { es: "La cuenta, por favor.", en: "The bill, please.", fr: "L'addition, s'il vous plaît.", ar: "الحساب من فضلك." } },
  // Lesson 18 — Datum
  { id: "a2-tim-1", level: "A2", sv: "Idag är det måndag.", text: { es: "Hoy es lunes.", en: "Today is Monday.", fr: "Aujourd'hui c'est lundi.", ar: "اليوم الإثنين." } },
  { id: "a2-tim-2", level: "A2", sv: "Vi ses i januari.", text: { es: "Nos vemos en enero.", en: "See you in January.", fr: "On se voit en janvier.", ar: "نلتقي في يناير." } },
  // Lesson 19 — Sport
  { id: "a2-spo-1", level: "A2", sv: "Jag spelar fotboll varje vecka.", text: { es: "Juego al fútbol cada semana.", en: "I play soccer every week.", fr: "Je joue au foot chaque semaine.", ar: "ألعب كرة القدم كل أسبوع." } },
  { id: "a2-spo-2", level: "A2", sv: "Vill du springa imorgon?", text: { es: "¿Quieres correr mañana?", en: "Want to go for a run tomorrow?", fr: "Tu veux courir demain ?", ar: "هل تريد الركض غدا؟" } },
  // Lesson 20 — Småprat
  { id: "a2-cas-1", level: "A2", sv: "Hur var din helg?", text: { es: "¿Qué tal el fin de semana?", en: "How was your weekend?", fr: "C'était comment ton week-end ?", ar: "كيف كانت عطلتك؟" } },
  { id: "a2-cas-2", level: "A2", sv: "Trevligt väder, eller hur?", text: { es: "Hace buen tiempo, ¿no?", en: "Nice weather, isn't it?", fr: "Il fait beau, non ?", ar: "الجو جميل، أليس كذلك؟" } },

  // ----- B1 -----
  // Lesson 21 — Resa
  { id: "b1-trv-1", level: "B1", sv: "Jag skulle vilja checka in.", text: { es: "Quisiera registrarme.", en: "I'd like to check in.", fr: "Je voudrais m'enregistrer.", ar: "أرغب في تسجيل الوصول." } },
  { id: "b1-trv-2", level: "B1", sv: "Mitt flyg har blivit försenat.", text: { es: "Mi vuelo se ha retrasado.", en: "My flight has been delayed.", fr: "Mon vol a été retardé.", ar: "تأخرت رحلتي." } },
  // Lesson 22 — Möten
  { id: "b1-biz-1", level: "B1", sv: "Kan vi flytta mötet?", text: { es: "¿Podemos mover la reunión?", en: "Can we reschedule the meeting?", fr: "On peut décaler la réunion ?", ar: "هل يمكننا تأجيل الاجتماع؟" } },
  { id: "b1-biz-2", level: "B1", sv: "Jag skickar agendan i förväg.", text: { es: "Envío la agenda antes.", en: "I'll send the agenda beforehand.", fr: "J'envoie l'ordre du jour avant.", ar: "سأرسل جدول الأعمال مسبقا." } },
  // Lesson 23 — Åsikter
  { id: "b1-opi-1", level: "B1", sv: "Jag tycker att det är bättre nu.", text: { es: "Creo que ahora es mejor.", en: "I think it's better now.", fr: "Je trouve que c'est mieux maintenant.", ar: "أعتقد أنه أفضل الآن." } },
  { id: "b1-opi-2", level: "B1", sv: "Det här är dyrare än det andra.", text: { es: "Esto es más caro que aquello.", en: "This is more expensive than that.", fr: "C'est plus cher que ça.", ar: "هذا أغلى من ذاك." } },
  // Lesson 24 — Berätta
  { id: "b1-sto-1", level: "B1", sv: "Förra veckan träffade jag en gammal vän.", text: { es: "La semana pasada me encontré con un viejo amigo.", en: "Last week I ran into an old friend.", fr: "La semaine dernière j'ai croisé un vieil ami.", ar: "الأسبوع الماضي قابلت صديقا قديما." } },
  // Lesson 25 — Hälsa
  { id: "b1-hlt-1", level: "B1", sv: "Jag försöker äta hälsosamt.", text: { es: "Intento comer sano.", en: "I'm trying to eat healthy.", fr: "J'essaie de manger sainement.", ar: "أحاول أن آكل صحيا." } },
  // Lesson 26 — Internet
  { id: "b1-tec-1", level: "B1", sv: "Jag har glömt mitt lösenord.", text: { es: "He olvidado mi contraseña.", en: "I forgot my password.", fr: "J'ai oublié mon mot de passe.", ar: "نسيت كلمة المرور." } },
  // Lesson 27 — Pengar
  { id: "b1-mon-1", level: "B1", sv: "Jag försöker spara pengar.", text: { es: "Intento ahorrar dinero.", en: "I'm trying to save money.", fr: "J'essaie d'économiser de l'argent.", ar: "أحاول توفير المال." } },
  // Lesson 28 — Kultur
  { id: "b1-cul-1", level: "B1", sv: "I Sverige firar vi midsommar.", text: { es: "En Suecia celebramos el solsticio de verano.", en: "In Sweden we celebrate Midsummer.", fr: "En Suède on fête la Saint-Jean.", ar: "في السويد نحتفل بمنتصف الصيف." } },

  // ----- B2 -----
  // Lesson 29 — Debatt
  { id: "b2-deb-1", level: "B2", sv: "Det finns för- och nackdelar med båda alternativen.", text: { es: "Hay pros y contras en ambas opciones.", en: "There are pros and cons to both options.", fr: "Il y a des avantages et des inconvénients aux deux options.", ar: "لكلا الخيارين إيجابيات وسلبيات." } },
  // Lesson 30 — Nyheter
  { id: "b2-news-1", level: "B2", sv: "Den senaste rapporten visar tydliga trender.", text: { es: "El último informe muestra tendencias claras.", en: "The latest report shows clear trends.", fr: "Le dernier rapport montre des tendances claires.", ar: "يظهر التقرير الأخير اتجاهات واضحة." } },
  // Lesson 31 — Karriär
  { id: "b2-car-1", level: "B2", sv: "Jag siktar på att bli teamledare nästa år.", text: { es: "Aspiro a ser líder de equipo el próximo año.", en: "I'm aiming to become team lead next year.", fr: "Je vise à devenir chef d'équipe l'année prochaine.", ar: "أطمح أن أصبح قائد فريق السنة القادمة." } },
  // Lesson 32 — Förhandling
  { id: "b2-neg-1", level: "B2", sv: "Vi kan kompromissa om priset.", text: { es: "Podemos negociar el precio.", en: "We can compromise on the price.", fr: "On peut trouver un compromis sur le prix.", ar: "يمكننا التفاوض على السعر." } },
  // Lesson 33 — Relationer
  { id: "b2-rel-1", level: "B2", sv: "Jag uppskattar verkligen ditt stöd.", text: { es: "De verdad aprecio tu apoyo.", en: "I really appreciate your support.", fr: "J'apprécie vraiment ton soutien.", ar: "أقدر حقا دعمك." } },
  // Lesson 34 — Akademiska samtal
  { id: "b2-aca-1", level: "B2", sv: "Studien stöder slutsatsen att...", text: { es: "El estudio respalda la conclusión de que...", en: "The study supports the conclusion that...", fr: "L'étude soutient la conclusion selon laquelle...", ar: "تدعم الدراسة استنتاج أن..." } },

  // ----- C1 -----
  // Lesson 35 — Idiom
  { id: "c1-idi-1", level: "C1", sv: "Det är pricken över i:et.", text: { es: "Es la guinda del pastel.", en: "That's the icing on the cake.", fr: "C'est la cerise sur le gâteau.", ar: "هذا الكرز على الكعكة." } },
  // Lesson 36 — Ironi
  { id: "c1-iro-1", level: "C1", sv: "Det var verkligen smart, sa han ironiskt.", text: { es: "Eso sí que fue inteligente, dijo con ironía.", en: "That was really clever, he said sarcastically.", fr: "C'était vraiment malin, dit-il avec ironie.", ar: "كان ذلك ذكيا حقا، قال ساخرا." } },
  // Lesson 37 — Litteratur
  { id: "c1-lit-1", level: "C1", sv: "Hans prosa är både poetisk och precis.", text: { es: "Su prosa es a la vez poética y precisa.", en: "His prose is both poetic and precise.", fr: "Sa prose est à la fois poétique et précise.", ar: "نثره شاعري ودقيق في آن." } },
  // Lesson 38 — Affärsförhandling
  { id: "c1-bus-1", level: "C1", sv: "Vi behöver hitta en ömsesidigt fördelaktig lösning.", text: { es: "Necesitamos encontrar una solución mutuamente beneficiosa.", en: "We need to find a mutually beneficial solution.", fr: "Il faut trouver une solution mutuellement bénéfique.", ar: "نحتاج إلى حل ذي فائدة متبادلة." } },
  // Lesson 39 — Filosofi
  { id: "c1-phi-1", level: "C1", sv: "Frågan är om fri vilja ens existerar.", text: { es: "La cuestión es si el libre albedrío siquiera existe.", en: "The question is whether free will even exists.", fr: "La question est de savoir si le libre arbitre existe.", ar: "السؤال هو ما إذا كانت الإرادة الحرة موجودة أصلا." } },
  // Lesson 40 — Snabbt vardagsspråk
  { id: "c1-cas-1", level: "C1", sv: "Det är typ helt galet vad bra det blev.", text: { es: "O sea, quedó bestial.", en: "It turned out crazy good, like seriously.", fr: "C'est devenu trop bien, genre vraiment.", ar: "صار رائعا جدا، فعلا." } },
];

const ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export function getPhrases(level?: CefrLevel | null): Phrase[] {
  if (!level) return PHRASES;
  return PHRASES.filter((p) => ORDER.indexOf(p.level) <= ORDER.indexOf(level));
}

export function getPhrasesAtLevel(level: CefrLevel): Phrase[] {
  return PHRASES.filter((p) => p.level === level);
}
