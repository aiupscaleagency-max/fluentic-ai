"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Lock, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/auth";

// Adison — Fluentics tolk-agent. Endast tillgänglig för Pro/Family-medlemmar.
// Free-användare ser en låst variant som tipsar om uppgradering till /pricing.
//
// Auto-presentation: vid första visning för en inloggad medlem visas en liten
// notis "Hej, jag är Adison, din live-tolk..." intill FAB:en. Dismissas och
// sparas i localStorage så den inte visas igen.
const HIDE_ON = ["/login", "/signup", "/unlock"];
const SEEN_KEY = "fluentic.adison.seen-intro";

export function InterpreterFab() {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const [hover, setHover] = React.useState(false);
  const [showIntro, setShowIntro] = React.useState(false);

  const isMember = user?.tier === "pro" || user?.tier === "family";

  // Auto-popup intro 1 gång för medlemmar
  React.useEffect(() => {
    if (!user || !isMember) return;
    try {
      if (window.localStorage.getItem(SEEN_KEY) === "1") return;
    } catch { return; }
    // Liten paus så landing-page-animationer hinner sätta sig
    const id = window.setTimeout(() => setShowIntro(true), 1500);
    return () => window.clearTimeout(id);
  }, [user, isMember]);

  function dismissIntro() {
    setShowIntro(false);
    try { window.localStorage.setItem(SEEN_KEY, "1"); } catch { /* tyst */ }
  }

  function handleClick(e: React.MouseEvent) {
    if (!isMember) {
      e.preventDefault();
      router.push("/pricing");
    }
  }

  if (pathname && HIDE_ON.includes(pathname)) return null;

  // Färg-set baserat på medlemskap
  const orbBg = isMember
    ? "linear-gradient(135deg, #06b6d4 0%, #3b82f6 40%, #8b5cf6 80%)"
    : "linear-gradient(135deg, #475569 0%, #334155 100%)"; // grå för låst
  const ringClass = isMember ? "ring-emerald-400/60" : "ring-amber-400/40";
  const liveLabel = isMember ? "Live" : t("interp.locked");
  const liveBg = isMember ? "bg-emerald-500/90" : "bg-amber-500/90";

  return (
    <Link
      href={isMember ? "/translate" : "/pricing"}
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed bottom-5 left-5 z-[70] group"
      aria-label="Adison"
    >
      <div className="relative">
        {/* LIVE-translator-badge — eller "Lås upp med Pro" för free-users */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full ${liveBg} px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg whitespace-nowrap`}>
          {isMember ? <span className="h-1.5 w-1.5 rounded-full bg-white live-dot" /> : <Lock className="h-2.5 w-2.5" />}
          {liveLabel}
        </div>

        {/* Tooltip vid hover */}
        {hover && !showIntro && (
          <div className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded-xl glass-strong border border-white/15 px-3 py-2 shadow-xl text-xs">
            <div className="font-bold text-slate-100">Adison · {t("interp.title")}</div>
            <div className="text-slate-300">{t("interp.subtitle")}</div>
            {isMember
              ? <div className="text-[10px] text-emerald-300 mt-0.5">● {t("interp.always")}</div>
              : <div className="text-[10px] text-amber-300 mt-0.5">🔒 {t("interp.locked")}</div>}
          </div>
        )}

        {/* Auto-presentations-popup — endast för medlemmar, en gång */}
        <AnimatePresence>
          {showIntro && isMember && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-full left-0 mb-3 w-[280px] rounded-2xl glass-strong border-2 border-cyan-300/40 px-4 py-3 shadow-2xl shadow-cyan-500/30"
              onClick={(e) => e.preventDefault()}
            >
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismissIntro(); }}
                className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-white/10"
                aria-label={t("common.close")}
              >
                <X className="h-3 w-3" />
              </button>
              <div className="flex items-start gap-2">
                <div className="text-2xl shrink-0">🌍</div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-cyan-200">Adison · Live-tolk</div>
                  <p className="text-xs text-slate-200 leading-snug mt-1">{t("agent.adison.intro")}</p>
                </div>
              </div>
              {/* Liten pil ned till FAB:en */}
              <div className="absolute -bottom-2 left-6 h-3 w-3 rotate-45 bg-[var(--glass-bg,rgba(255,255,255,0.10))] border-r-2 border-b-2 border-cyan-300/40" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D-orb */}
        <div
          className="tutor-orb h-14 w-14 rounded-full shadow-2xl shadow-cyan-500/40 hover:scale-105 transition-transform flex items-center justify-center text-white relative overflow-hidden"
          style={{ background: orbBg, backgroundSize: "200% 200%" }}
        >
          <span
            className="absolute inset-1 rounded-full opacity-40"
            style={{ background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, transparent 50%)" }}
            aria-hidden
          />
          {isMember
            ? <Languages className="h-6 w-6 relative z-10 drop-shadow" />
            : <Lock className="h-5 w-5 relative z-10 drop-shadow" />}
        </div>

        {/* Pulsande ring */}
        <span className={`absolute inset-0 rounded-full ring-2 ${ringClass} animate-ping pointer-events-none`} aria-hidden />
      </div>
    </Link>
  );
}
