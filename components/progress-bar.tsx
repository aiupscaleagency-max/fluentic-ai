"use client";

import * as React from "react";
import { getProgress, getHearts, getDailyGoal } from "@/lib/storage";
import { getSpokenToday, getSpokenStreak, SPOKEN_DAILY_GOAL_SECONDS } from "@/lib/spoken-time";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Flame, Sparkles, Heart, Snowflake, Mic } from "lucide-react";
import { useT } from "@/lib/i18n";

export function ProgressBar() {
  const t = useT();
  const [xp, setXp] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [freezes, setFreezes] = React.useState(0);
  const [hearts, setHearts] = React.useState(5);
  const [todayXp, setTodayXp] = React.useState(0);
  const [goal, setGoal] = React.useState(20);
  // Praktika-style: minuter spoken idag + streak baserat på 5+ min/dag
  const [spokenSec, setSpokenSec] = React.useState(0);
  const [spokenStreak, setSpokenStreak] = React.useState(0);

  React.useEffect(() => {
    function refresh() {
      const p = getProgress();
      setXp(p.xp);
      setStreak(p.streakDays);
      setFreezes(p.freezes);
      const today = new Date().toISOString().slice(0, 10);
      setTodayXp(p.todayDate === today ? p.todayXp : 0);
      setGoal(getDailyGoal());
      setHearts(getHearts().count);
      setSpokenSec(getSpokenToday());
      setSpokenStreak(getSpokenStreak());
    }
    refresh();
    const id = window.setInterval(refresh, 1500);
    window.addEventListener("fluentic:progress-changed", refresh);
    window.addEventListener("fluentic:hearts-changed", refresh);
    window.addEventListener("fluentic:spoken-changed", refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("fluentic:progress-changed", refresh);
      window.removeEventListener("fluentic:hearts-changed", refresh);
      window.removeEventListener("fluentic:spoken-changed", refresh);
    };
  }, []);

  const spokenMin = Math.floor(spokenSec / 60);
  const spokenGoalMin = Math.round(SPOKEN_DAILY_GOAL_SECONDS / 60);

  const pct = Math.min(100, Math.round((todayXp / goal) * 100));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dash = (circumference * pct) / 100;

  return (
    <Card>
      <CardContent className="p-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
            <circle cx="28" cy="28" r={radius} stroke="currentColor" strokeOpacity="0.15" strokeWidth="5" fill="none" />
            <circle
              cx="28" cy="28" r={radius}
              stroke="rgb(99 102 241)" strokeWidth="5" fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 28 28)"
            />
            <text x="28" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
              {pct}%
            </text>
          </svg>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="default" className="gap-1"><Sparkles className="h-3 w-3" />{xp} {t("prog.xp")}</Badge>
            <Badge variant="warning" className="gap-1"><Flame className="h-3 w-3" />{streak} {streak === 1 ? t("prog.day") : t("prog.days")}</Badge>
            <Badge variant="secondary" className="gap-1"><Mic className="h-3 w-3" />{spokenMin} {t("prog.min")} · {spokenStreak}d</Badge>
            <Badge variant="secondary" className="gap-1"><Snowflake className="h-3 w-3" />{freezes}</Badge>
            <span className="inline-flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart key={i} className={`h-4 w-4 ${i < hearts ? "text-red-500 fill-red-500" : "text-slate-400"}`} />
              ))}
            </span>
          </div>
        </div>
        {/* Höjd kontrast — text-slate-300 i st.f. 500 så den verkligen syns */}
        <div className="text-xs text-slate-300 text-right">
          <div>{todayXp}/{goal} {t("prog.xp.today")}</div>
          <div className="text-[11px] text-slate-400">{t("prog.spoken")}: {spokenMin}/{spokenGoalMin} {t("prog.min")}</div>
        </div>
      </CardContent>
    </Card>
  );
}
