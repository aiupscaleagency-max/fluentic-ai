"use client";

import * as React from "react";
import { getDailyGoal, getProgress } from "@/lib/storage";
import { Card, CardContent } from "./ui/card";

// Visar dagens XP-progress mot målet med en ring
export function DailyGoalRing() {
  const [todayXp, setTodayXp] = React.useState(0);
  const [goal, setGoal] = React.useState(20);

  React.useEffect(() => {
    function refresh() {
      const p = getProgress();
      const today = new Date().toISOString().slice(0, 10);
      setTodayXp(p.todayDate === today ? p.todayXp : 0);
      setGoal(getDailyGoal());
    }
    refresh();
    const id = window.setInterval(refresh, 1500);
    window.addEventListener("fluentic:progress-changed", refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("fluentic:progress-changed", refresh);
    };
  }, []);

  const pct = Math.min(100, Math.round((todayXp / goal) * 100));
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = (circumference * pct) / 100;

  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
          <circle cx="36" cy="36" r={radius} stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" fill="none" />
          <circle
            cx="36" cy="36" r={radius}
            stroke="rgb(99 102 241)" strokeWidth="6" fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform="rotate(-90 36 36)"
          />
          <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
            {pct}%
          </text>
        </svg>
        <div>
          <div className="font-semibold">Dagligt mål</div>
          <div className="text-xs text-slate-500">{todayXp} av {goal} XP idag</div>
        </div>
      </CardContent>
    </Card>
  );
}
