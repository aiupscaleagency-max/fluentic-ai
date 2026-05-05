"use client";

// Stort permission-CTA-kort. Visas på Hem + Schema när Notification.permission === "default".
// När användaren tillåter: morphar till success-state och fadear ut efter 3s.
// Vid denied: visa hjälptoast som förklarar hur man slår på i webbläsarens settings.
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/cn";

type Perm = NotificationPermission | "unsupported";

export function NotificationCard({ className }: { className?: string }) {
  const [perm, setPerm] = React.useState<Perm>("default");
  const [hidden, setHidden] = React.useState(false);
  const [justGranted, setJustGranted] = React.useState(false);
  const [showDeniedToast, setShowDeniedToast] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission);
  }, []);

  // Auto-fade success efter 3s
  React.useEffect(() => {
    if (!justGranted) return;
    const t = window.setTimeout(() => setHidden(true), 3000);
    return () => window.clearTimeout(t);
  }, [justGranted]);

  async function ask() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPerm(result);
      if (result === "granted") {
        setJustGranted(true);
      } else if (result === "denied") {
        setShowDeniedToast(true);
        window.setTimeout(() => setShowDeniedToast(false), 6000);
      }
    } catch {
      // ignorera — vissa browsers throw:ar om vi anropar utan user gesture
    }
  }

  // Visa inte kortet om: redan granted (utan att vi just nyss granted), denied, unsupported, eller hidden
  if (hidden) return null;
  if (perm === "unsupported") return null;
  if (perm === "denied") {
    return (
      <AnimatePresence>
        {showDeniedToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl glass border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-200"
          >
            Notiser är blockerade i webbläsaren. Klicka på låset bredvid adressraden och tillåt notiser.
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  if (perm === "granted" && !justGranted) return null;

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "relative rounded-2xl p-5 sm:p-6 overflow-hidden",
            "border bg-gradient-to-br",
            justGranted
              ? "border-emerald-400/40 from-emerald-500/20 via-cyan-500/15 to-cyan-500/10"
              : "border-violet-400/40 from-violet-500/20 via-cyan-500/15 to-pink-500/10",
            className,
          )}
        >
          {/* Glow-orb i bakgrunden */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl",
              justGranted ? "bg-emerald-400/40" : "bg-violet-500/40",
            )}
          />

          {/* Stäng-knapp (ej när success — den fadear själv) */}
          {!justGranted && (
            <button
              onClick={() => setHidden(true)}
              aria-label="Stäng"
              className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <div className="relative z-10 flex items-start sm:items-center gap-4 flex-wrap">
            <motion.div
              animate={
                justGranted
                  ? { rotate: [0, -10, 10, -8, 8, 0] }
                  : { y: [0, -3, 0] }
              }
              transition={
                justGranted
                  ? { duration: 0.7 }
                  : { duration: 2, repeat: Infinity, repeatType: "loop" }
              }
              className={cn(
                "inline-flex h-14 w-14 items-center justify-center rounded-2xl shrink-0 shadow-lg",
                justGranted
                  ? "bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-emerald-500/40"
                  : "bg-gradient-to-br from-violet-500 to-cyan-400 shadow-violet-500/40",
              )}
            >
              {justGranted ? (
                <BellRing className="h-7 w-7 text-white" />
              ) : (
                <Bell className="h-7 w-7 text-white" />
              )}
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base sm:text-lg">
                {justGranted ? "🔔 Påminnelser aktiverade" : "Aktivera påminnelser"}
              </div>
              <div className="text-sm text-slate-300 mt-0.5">
                {justGranted
                  ? "Vi knuffar dig till dagens lektion när det är dags."
                  : "Aktivera påminnelser så vi kan knuffa dig till dagens lektion 🔔"}
              </div>
            </div>

            {!justGranted && (
              <Button onClick={ask} size="lg" className="shrink-0">
                Tillåt notiser
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
