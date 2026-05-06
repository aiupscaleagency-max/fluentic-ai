"use client";

import * as React from "react";

// Lättviktig CSS-driven confetti-burst — ingen runtime-cost när inte aktiv.
// Mountas där triggers är (lesson-complete, achievement-unlock) och unmountas
// efter ~1.5s när animationen är klar.
const COLORS = ["#a78bfa", "#22d3ee", "#ec4899", "#fbbf24", "#34d399"];

export function Confetti({ count = 24, className = "" }: { count?: number; className?: string }) {
  // Fördelningar slumpas en gång vid mount så att samma render gör samma kurva
  const pieces = React.useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.4}s`,
      bg: COLORS[i % COLORS.length],
      tilt: `${(Math.random() - 0.5) * 60}deg`,
    }));
  }, [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            bottom: 0,
            backgroundColor: p.bg,
            animationDelay: p.delay,
            transform: `rotate(${p.tilt})`,
          }}
        />
      ))}
    </div>
  );
}
