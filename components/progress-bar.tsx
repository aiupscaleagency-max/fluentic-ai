"use client";

import * as React from "react";
import { getProgress } from "@/lib/storage";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Flame, Sparkles } from "lucide-react";

export function ProgressBar() {
  const [xp, setXp] = React.useState(0);
  const [streak, setStreak] = React.useState(0);

  React.useEffect(() => {
    const p = getProgress();
    setXp(p.xp);
    setStreak(p.streakDays);
    // Polla lokal storage så att XP-uppdateringar från andra komponenter syns snabbt
    const id = window.setInterval(() => {
      const cur = getProgress();
      setXp(cur.xp);
      setStreak(cur.streakDays);
    }, 1500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Card>
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="default" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {xp} XP
          </Badge>
          <Badge variant="warning" className="gap-1">
            <Flame className="h-3 w-3" />
            {streak} dag{streak === 1 ? "" : "ars"} streak
          </Badge>
        </div>
        <span className="text-xs text-slate-500">Få +XP genom att öva</span>
      </CardContent>
    </Card>
  );
}
