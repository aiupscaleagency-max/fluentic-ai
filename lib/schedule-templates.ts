// Snabb-schemamallar — en-klicks lösning för "lättare schema som passar".
// Mike-feedback: schemaläggning ska kännas enkelt, inte bli en formulärsoppa.
import type { LangCode } from "./languages";
import { addScheduledLesson, type LessonType, type Weekday } from "./storage";

export interface ScheduleTemplate {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  time: string;
  days: Weekday[];
  durationMin: number;
  type: LessonType;
}

export const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  {
    id: "morning",
    emoji: "🌅",
    title: "Morgonrutin",
    desc: "Vardagar 07:00 — 15 min med kaffet",
    time: "07:00",
    days: [1, 2, 3, 4, 5],
    durationMin: 15,
    type: "flashcards",
  },
  {
    id: "lunch",
    emoji: "🍽️",
    title: "Lunchpaus",
    desc: "Vardagar 12:30 — 10 min snabbt",
    time: "12:30",
    days: [1, 2, 3, 4, 5],
    durationMin: 10,
    type: "listen",
  },
  {
    id: "evening",
    emoji: "🛋️",
    title: "Avslappning",
    desc: "Vardagar 20:30 — 20 min konversation",
    time: "20:30",
    days: [1, 2, 3, 4, 5],
    durationMin: 20,
    type: "conversation",
  },
  {
    id: "weekend",
    emoji: "🎯",
    title: "Helgintensivt",
    desc: "Lör + Sön 10:00 — 30 min djup-pass",
    time: "10:00",
    days: [6, 0],
    durationMin: 30,
    type: "conversation",
  },
];

// Lägger till mall för givet språk. Returnerar id på den nya lektionen.
export function applyTemplate(template: ScheduleTemplate, lang: LangCode): string {
  const lesson = addScheduledLesson({
    language: lang,
    time: template.time,
    days: template.days,
    durationMin: template.durationMin,
    type: template.type,
  });
  return lesson.id;
}
