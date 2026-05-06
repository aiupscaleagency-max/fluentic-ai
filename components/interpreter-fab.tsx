"use client";

import * as React from "react";
import Link from "next/link";
import { Languages } from "lucide-react";
import { useT } from "@/lib/i18n";

// Tolk-FAB i nedre vänstra hörnet — global genväg till live-tolk vid samtal/resa.
// 3D-känsla via animerad gradient-orb (samma orb-shift-keyframe som video-call-tutor).
// Klick → /translate. Hover → liten tooltip "Tolk — live-översättning"
export function InterpreterFab() {
  const t = useT();
  const [hover, setHover] = React.useState(false);

  return (
    <Link
      href="/translate"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed bottom-5 left-5 z-[70] group"
      aria-label={t("interp.title")}
    >
      <div className="relative">
        {/* Tooltip */}
        {hover && (
          <div className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded-xl glass-strong border border-white/15 px-3 py-2 shadow-xl text-xs">
            <div className="font-bold text-slate-100">{t("interp.title")}</div>
            <div className="text-slate-300">{t("interp.subtitle")}</div>
            <div className="text-[10px] text-cyan-300 mt-0.5">● {t("interp.always")}</div>
          </div>
        )}

        {/* 3D-känsla orb — gradient + glow + ikon i mitten */}
        <div
          className="tutor-orb h-14 w-14 rounded-full shadow-2xl shadow-cyan-500/40 hover:scale-105 transition-transform flex items-center justify-center text-white"
          style={{
            background:
              "linear-gradient(135deg, #06b6d4 0%, #3b82f6 40%, #8b5cf6 80%)",
            backgroundSize: "200% 200%",
          }}
        >
          {/* Inner highlight för 3D-effekt */}
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

        {/* Pulsande ring att signalera "alltid på" */}
        <span
          className="absolute inset-0 rounded-full ring-2 ring-cyan-300/60 animate-ping pointer-events-none"
          aria-hidden
        />
      </div>
    </Link>
  );
}
