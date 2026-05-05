"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy } from "lucide-react";
import { ACHIEVEMENTS, getUnlocked, checkAchievements } from "@/lib/achievements";
import { cn } from "@/lib/cn";

export default function AchievementsPage() {
  const [unlocked, setUnlocked] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    checkAchievements();
    setUnlocked(new Set(getUnlocked()));
    function refresh() {
      setUnlocked(new Set(getUnlocked()));
    }
    window.addEventListener("fluentic:achievement-unlocked", refresh);
    return () => window.removeEventListener("fluentic:achievement-unlocked", refresh);
  }, []);

  const total = ACHIEVEMENTS.length;
  const done = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-sm text-slate-300 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4 mr-1" /> Hem
        </Link>
        <Badge variant="warning" className="gap-1">
          <Trophy className="h-3 w-3" /> {done} / {total}
        </Badge>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-7 w-7 text-amber-300" /> Achievements
        </h1>
        <p className="text-sm text-slate-400">Markera milestones på din språkresa.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a, i) => {
          const unl = unlocked.has(a.id);
          return (
            <motion.div
              key={a.id}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                className={cn(
                  "transition-all",
                  unl
                    ? "border-amber-300/40 shadow-amber-500/15 shadow-lg"
                    : "opacity-60 grayscale",
                )}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="text-4xl shrink-0">{unl ? a.emoji : "🔒"}</div>
                  <div className="min-w-0">
                    <div className="font-semibold flex items-center gap-2 flex-wrap">
                      {a.title}
                      {unl && <Badge variant="success" className="gap-1"><Trophy className="h-3 w-3" /> Klar</Badge>}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{a.description}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
