"use client";

import * as React from "react";
import Link from "next/link";
import { Languages } from "lucide-react";
import { useT } from "@/lib/i18n";
import { usePathname } from "next/navigation";

// Adison — Fluentics tolk-agent. Floating FAB i nedre vänstra hörnet, global
// genväg till live-tolk vid resa eller samtal. 3D-känsla via animerad gradient-orb
// med "LIVE"-badge ovanför som tydligt signalerar att tolken är på och redo.
const HIDE_ON = ["/login", "/signup", "/unlock"];

export function InterpreterFab() {
  const t = useT();
  const pathname = usePathname();
  const [hover, setHover] = React.useState(false);
  if (pathname && HIDE_ON.includes(pathname)) return null;

  return (
    <Link
      href="/translate"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed bottom-5 left-5 z-[70] group"
      aria-label="Adison"
    >
      <div className="relative">
        {/* LIVE-translator-badge — alltid synlig så man förstår att Adison är på */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/40 whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-white live-dot" />
          Live
        </div>

        {/* Tooltip vid hover */}
        {hover && (
          <div className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded-xl glass-strong border border-white/15 px-3 py-2 shadow-xl text-xs">
            <div className="font-bold text-slate-100">Adison · {t("interp.title")}</div>
            <div className="text-slate-300">{t("interp.subtitle")}</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">● {t("interp.always")}</div>
          </div>
        )}

        {/* 3D-orb — Adisons "ansikte" */}
        <div
          className="tutor-orb h-14 w-14 rounded-full shadow-2xl shadow-cyan-500/40 hover:scale-105 transition-transform flex items-center justify-center text-white relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #06b6d4 0%, #3b82f6 40%, #8b5cf6 80%)",
            backgroundSize: "200% 200%",
          }}
        >
          {/* Inner highlight för 3D-känsla */}
          <span
            className="absolute inset-1 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, transparent 50%)",
            }}
            aria-hidden
          />
          <Languages className="h-6 w-6 relative z-10 drop-shadow" />
        </div>

        {/* Pulsande ring att förstärka "live"-signalen */}
        <span
          className="absolute inset-0 rounded-full ring-2 ring-emerald-400/60 animate-ping pointer-events-none"
          aria-hidden
        />
      </div>
    </Link>
  );
}
