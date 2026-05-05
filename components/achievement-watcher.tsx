"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { ACHIEVEMENTS, checkAchievements, type Achievement } from "@/lib/achievements";

// Globalt monterad i layout.tsx — lyssnar på relevanta storage-events,
// kör checkAchievements() och visar en toast på unlock.
// Toasten är ett floating card uppe till höger med 5s auto-dismiss.
export function AchievementWatcher() {
  const [queue, setQueue] = React.useState<Achievement[]>([]);

  React.useEffect(() => {
    function tick() {
      const newly = checkAchievements();
      if (newly.length > 0) setQueue((q) => [...q, ...newly]);
    }
    // Initial check vid mount
    tick();
    const events = [
      "fluentic:progress-changed",
      "fluentic:hearts-changed",
      "fluentic:spoken-changed",
      "fluentic:lessons-changed",
      "fluentic:activity-changed",
      "fluentic:lesson-complete",
      "fluentic:daily-claimed",
    ];
    events.forEach((e) => window.addEventListener(e, tick));
    return () => events.forEach((e) => window.removeEventListener(e, tick));
  }, []);

  // Auto-dismiss första kortet efter 5s
  React.useEffect(() => {
    if (queue.length === 0) return;
    const id = window.setTimeout(() => {
      setQueue((q) => q.slice(1));
    }, 5000);
    return () => window.clearTimeout(id);
  }, [queue]);

  const top = queue[0];

  return (
    <AnimatePresence>
      {top && (
        <motion.div
          key={top.id}
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          className="fixed top-20 right-4 z-[80] w-[300px] glass-strong border border-amber-300/40 rounded-2xl p-4 shadow-2xl shadow-amber-500/20"
        >
          <button
            type="button"
            onClick={() => setQueue((q) => q.slice(1))}
            className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-white/10"
            aria-label="Stäng"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-start gap-3">
            <div className="text-4xl shrink-0">{top.emoji}</div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Achievement upplåst
              </div>
              <div className="font-bold mt-0.5">{top.title}</div>
              <div className="text-xs text-slate-300 mt-0.5">{top.description}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Re-export så sidor kan rendera listan
export { ACHIEVEMENTS };
