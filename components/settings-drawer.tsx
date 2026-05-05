"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Bell, Volume2, Settings as SettingsIcon } from "lucide-react";
import { resetOnboarding } from "@/lib/storage";
import { Button } from "./ui/button";

// Höger-sheet med snabbinställningar (re-onboard, notiser, voice-speed).
export function SettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">("default");
  const [voiceSpeed, setVoiceSpeed] = React.useState<number>(1.0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission);
    }
    try {
      const v = parseFloat(window.localStorage.getItem("fluentic.voice-rate") ?? "1.0");
      if (Number.isFinite(v) && v > 0) setVoiceSpeed(v);
    } catch {/* tyst */}
  }, [open]);

  function saveSpeed(v: number) {
    setVoiceSpeed(v);
    try { window.localStorage.setItem("fluentic.voice-rate", String(v)); } catch {/* tyst */}
  }

  async function requestPerm() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setPermission(p);
  }

  function reonboard() {
    resetOnboarding();
    onClose();
    router.push("/onboarding");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm glass-strong border-l border-white/15 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-violet-300" />
                <h2 className="text-lg font-semibold">Inställningar</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-slate-100"
                aria-label="Stäng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <Section title="Onboarding" desc="Kör om välkomstflödet — välj språk, fokus och schema på nytt.">
                <Button variant="outline" onClick={reonboard}>
                  <RefreshCw className="h-4 w-4" /> Återställ onboarding
                </Button>
              </Section>

              <Section title="Notiser" desc="Tillåt webbnotiser för schemalagda lektioner.">
                <Button
                  variant={permission === "granted" ? "secondary" : "default"}
                  onClick={requestPerm}
                  disabled={permission === "unsupported" || permission === "granted"}
                >
                  <Bell className="h-4 w-4" />
                  {permission === "granted"
                    ? "Aktiva"
                    : permission === "unsupported"
                      ? "Stöds ej"
                      : permission === "denied"
                        ? "Nekade"
                        : "Aktivera"}
                </Button>
              </Section>

              <Section title="Tal-hastighet" desc="Hur snabbt tutorn ska prata i röstsamtal.">
                <div className="flex gap-2">
                  {[0.8, 1.0, 1.2].map((r) => (
                    <button
                      key={r}
                      onClick={() => saveSpeed(r)}
                      className={`rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                        voiceSpeed === r
                          ? "border-violet-400 bg-violet-500/20 text-violet-100"
                          : "border-white/15 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <Volume2 className="inline h-3.5 w-3.5 mr-1" /> {r}x
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Språk i UI" desc="Bara svenska just nu — fler kommer.">
                <div className="text-sm text-slate-400">Svenska 🇸🇪</div>
              </Section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl glass border-white/10 p-4 space-y-2">
      <div>
        <div className="font-semibold">{title}</div>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}
