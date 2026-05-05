"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Sparkles, Languages, Calendar, Home, Flame, Heart, Settings } from "lucide-react";
import { getProgress, getHearts } from "@/lib/storage";
import { SettingsDrawer } from "./settings-drawer";
import { NotificationFeed } from "./notification-feed";

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
  const [scrolled, setScrolled] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

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
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.clearInterval(id);
      window.removeEventListener("fluentic:progress-changed", refresh);
      window.removeEventListener("fluentic:hearts-changed", refresh);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "glass-strong border-b border-white/10 shadow-[0_4px_20px_-8px_rgba(139,92,246,0.4)]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/40">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="hidden sm:inline text-gradient">Fluentic AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
              {xp} XP
            </span>
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              {streak}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
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
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-violet-500/30 to-cyan-500/30 text-white shadow-inner"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            {/* Aviseringsklocka med badge — drawer hanteras inuti komponenten */}
            <NotificationFeed />
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Inställningar"
            >
              <Settings className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
