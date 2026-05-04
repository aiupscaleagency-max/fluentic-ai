"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { addXP } from "@/lib/storage";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";

interface ClozeItem {
  sv: string;
  sentence: Record<LangCode, string>; // använd "___" där lucka ska vara
  answer: Record<LangCode, string>;
  options: Record<LangCode, string[]>; // alltid 4 (en korrekt + 3 distraktorer)
}

const CLOZE: ClozeItem[] = [
  {
    sv: "Jag dricker ___ varje morgon.",
    sentence: {
      es: "Bebo ___ cada mañana.",
      en: "I drink ___ every morning.",
      fr: "Je bois ___ chaque matin.",
      ar: "أشرب ___ كل صباح.",
    },
    answer: { es: "café", en: "coffee", fr: "café", ar: "قهوة" },
    options: {
      es: ["café", "casa", "perro", "luna"],
      en: ["coffee", "house", "dog", "moon"],
      fr: ["café", "maison", "chien", "lune"],
      ar: ["قهوة", "بيت", "كلب", "قمر"],
    },
  },
  {
    sv: "Hon är min ___.",
    sentence: {
      es: "Ella es mi ___.",
      en: "She is my ___.",
      fr: "Elle est ma ___.",
      ar: "هي ___ي.",
    },
    answer: { es: "hermana", en: "sister", fr: "sœur", ar: "أخت" },
    options: {
      es: ["hermana", "coche", "ciudad", "tren"],
      en: ["sister", "car", "city", "train"],
      fr: ["sœur", "voiture", "ville", "train"],
      ar: ["أخت", "سيارة", "مدينة", "قطار"],
    },
  },
  {
    sv: "Vi reser med ___.",
    sentence: {
      es: "Viajamos en ___.",
      en: "We travel by ___.",
      fr: "Nous voyageons en ___.",
      ar: "نسافر بال___.",
    },
    answer: { es: "tren", en: "train", fr: "train", ar: "قطار" },
    options: {
      es: ["tren", "manzana", "agua", "padre"],
      en: ["train", "apple", "water", "father"],
      fr: ["train", "pomme", "eau", "père"],
      ar: ["قطار", "تفاحة", "ماء", "أب"],
    },
  },
  {
    sv: "Jag skulle vilja ha ett glas ___.",
    sentence: {
      es: "Quisiera un vaso de ___.",
      en: "I would like a glass of ___.",
      fr: "Je voudrais un verre d'___.",
      ar: "أريد كوب ___.",
    },
    answer: { es: "agua", en: "water", fr: "eau", ar: "ماء" },
    options: {
      es: ["agua", "biljett", "uno", "amigo"],
      en: ["water", "ticket", "one", "friend"],
      fr: ["eau", "billet", "un", "ami"],
      ar: ["ماء", "تذكرة", "واحد", "صديق"],
    },
  },
  {
    sv: "___, hur mår du?",
    sentence: {
      es: "___, ¿cómo estás?",
      en: "___, how are you?",
      fr: "___, comment ça va ?",
      ar: "___، كيف حالك؟",
    },
    answer: { es: "Hola", en: "Hello", fr: "Bonjour", ar: "مرحبا" },
    options: {
      es: ["Hola", "Adiós", "Tres", "Pan"],
      en: ["Hello", "Goodbye", "Three", "Bread"],
      fr: ["Bonjour", "Au revoir", "Trois", "Pain"],
      ar: ["مرحبا", "وداعا", "ثلاثة", "خبز"],
    },
  },
  {
    sv: "Jag vill köpa en ___ till tåget.",
    sentence: {
      es: "Quiero comprar un ___ para el tren.",
      en: "I want to buy a ___ for the train.",
      fr: "Je veux acheter un ___ pour le train.",
      ar: "أريد شراء ___ للقطار.",
    },
    answer: { es: "billete", en: "ticket", fr: "billet", ar: "تذكرة" },
    options: {
      es: ["billete", "hermano", "cinco", "té"],
      en: ["ticket", "brother", "five", "tea"],
      fr: ["billet", "frère", "cinq", "thé"],
      ar: ["تذكرة", "أخ", "خمسة", "شاي"],
    },
  },
];

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

export function ClozeGame({ lang }: { lang: LangCode }) {
  const language = getLanguage(lang)!;
  const [order, setOrder] = React.useState(() => shuffle(CLOZE.map((_, i) => i)));
  const [idx, setIdx] = React.useState(0);
  const [picked, setPicked] = React.useState<string | null>(null);
  const [score, setScore] = React.useState(0);

  const item = CLOZE[order[idx]];
  const correct = item.answer[lang];
  const options = React.useMemo(() => shuffle(item.options[lang]), [item, lang]);

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === correct) {
      setScore((s) => s + 1);
      addXP(4);
    }
  }

  function next() {
    if (idx + 1 >= order.length) {
      setOrder(shuffle(CLOZE.map((_, i) => i)));
      setIdx(0);
    } else {
      setIdx((i) => i + 1);
    }
    setPicked(null);
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex justify-between items-center">
          <Badge variant="secondary">{idx + 1} / {order.length}</Badge>
          <Badge>Poäng: {score}</Badge>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500">{item.sv}</p>
          <p
            className="text-xl font-semibold"
            dir={language.dir}
            lang={lang}
          >
            {item.sentence[lang]}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => {
            const isPicked = picked === opt;
            const isCorrect = opt === correct;
            const showResult = picked !== null;
            return (
              <button
                key={opt}
                onClick={() => pick(opt)}
                disabled={picked !== null}
                dir={language.dir}
                lang={lang}
                className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                  showResult && isCorrect
                    ? "bg-emerald-100 border-emerald-400 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                    : showResult && isPicked && !isCorrect
                      ? "bg-red-100 border-red-400 text-red-900"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                }`}
              >
                {opt}
                {showResult && isCorrect && (
                  <CheckCircle2 className="inline h-4 w-4 ml-1 text-emerald-600" />
                )}
                {showResult && isPicked && !isCorrect && (
                  <XCircle className="inline h-4 w-4 ml-1 text-red-600" />
                )}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="text-center">
            <Button onClick={next}>
              Nästa <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
