"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Sparkles, Languages, Calendar, Home, Flame, Heart } from "lucide-react";
import { getProgress, getHearts } from "@/lib/storage";

const items = [
  { href: "/", label: "Hem", icon: Home },
  { href: "/translate", label: "Tolk", icon: Languages },
  { href: "/schedule", label: "Schema", icon: Calendar },
];

export function Nav() {
  const pathname = usePathname();
  const [xp, setXp] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [hearts, setHearts] = React.useState(5);

  React.useEffect(() => {
    function refresh() {
      const p = getProgress();
      setXp(p.xp);
      setStreak(p.streakDays);
      setHearts(getHearts().count);
    }
    refresh();
    const id = window.setInterval(refresh, 2000);
    window.addEventListener("fluentic:progress-changed", refresh);
    window.addEventListener("fluentic:hearts-changed", refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("fluentic:progress-changed", refresh);
      window.removeEventListener("fluentic:hearts-changed", refresh);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="hidden sm:inline">Fluentic AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            {xp} XP
          </span>
          <span className="inline-flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            {streak}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-red-500" />
            {hearts}/5
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
