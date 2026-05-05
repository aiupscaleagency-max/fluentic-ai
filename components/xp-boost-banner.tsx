"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Zap, Calendar } from "lucide-react";
import { isXpBoostActive, XP_WEEKEND_MULTIPLIER } from "@/lib/storage";

// Visas bara på helger — drar uppmärksamhet till bonus-XP-fönstret.
// Hur många timmar är kvar tills boosten löper ut (söndag 23:59 lokalt)?
function hoursLeftThisWeekend(now: Date): number {
  const next = new Date(now);
  // Räkna fram till nästa måndag 00:00 lokal tid
  const daysUntilMonday = (8 - next.getDay()) % 7 || 7;
  // Om idag = söndag (0) → 1 dag kvar; lördag (6) → 2 dagar
  // Förenkla: nästa måndag 00:00
  next.setDate(next.getDate() + (next.getDay() === 0 ? 1 : 8 - next.getDay()));
  next.setHours(0, 0, 0, 0);
  const ms = next.getTime() - now.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60)));
}

export function XpBoostBanner() {
  const [active, setActive] = React.useState(false);
  const [hoursLeft, setHoursLeft] = React.useState(0);

  React.useEffect(() => {
    function tick() {
      const now = new Date();
      setActive(isXpBoostActive(now));
      setHoursLeft(hoursLeftThisWeekend(now));
    }
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-300/50 bg-gradient-to-r from-amber-500/20 via-pink-500/15 to-violet-500/20 px-4 py-3 flex items-center gap-3 flex-wrap"
    >
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-white shrink-0 shadow-lg shadow-amber-500/30">
        <Zap className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-sm text-amber-100 flex items-center gap-2 flex-wrap">
          {XP_WEEKEND_MULTIPLIER}x XP-helg pågår
          <span className="inline-flex items-center gap-1 text-xs font-normal text-amber-200/80">
            <Calendar className="h-3 w-3" /> {hoursLeft}h kvar
          </span>
        </div>
        <div className="text-xs text-amber-100/80">All XP du tjänar i helgen dubblas automatiskt.</div>
      </div>
    </motion.div>
  );
}
