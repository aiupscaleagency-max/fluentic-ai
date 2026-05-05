"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Sparkles, Check } from "lucide-react";
import { PERSONAS, getPersona, setPersona, type PersonaId } from "@/lib/personas";
import type { LangCode } from "@/lib/languages";
import { cn } from "@/lib/cn";

// Picker-badge i headern som öppnar en dialog där Mike kan byta tutor.
// Auto-öppnar om ingen persona är vald än för det aktuella språket.
export function PersonaPicker({ lang }: { lang: LangCode }) {
  const [current, setCurrent] = React.useState<PersonaId | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setCurrent(getPersona(lang));
  }, [lang]);

  function pick(id: PersonaId) {
    setPersona(lang, id);
    setCurrent(id);
    setOpen(false);
  }

  const currentData = PERSONAS.find((p) => p.id === current);

  const accentRing: Record<string, string> = {
    rose: "ring-rose-400 from-rose-500/20 to-pink-500/15",
    violet: "ring-violet-400 from-violet-500/20 to-indigo-500/15",
    amber: "ring-amber-400 from-amber-500/20 to-orange-500/15",
    cyan: "ring-cyan-400 from-cyan-500/20 to-sky-500/15",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex"
        aria-label="Byt tutor"
      >
        <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-white/10">
          <Sparkles className="h-3 w-3" />
          {currentData ? `${currentData.emoji} ${currentData.name}` : "Välj tutor"}
        </Badge>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Vem vill du prata med?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-slate-400 mb-4">
            Din tutor påverkar tonen i samtalen. Du kan byta när du vill.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERSONAS.map((p, i) => {
              const sel = current === p.id;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => pick(p.id)}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-start gap-3 rounded-2xl p-4 text-left glass border-white/10 transition-all",
                    sel
                      ? `ring-2 bg-gradient-to-br ${accentRing[p.accent]}`
                      : "hover:border-white/30",
                  )}
                >
                  <div className="text-4xl shrink-0">{p.emoji}</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-base">{p.name}</div>
                    <div className="text-xs text-slate-300 mt-0.5">{p.pitch}</div>
                    <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">{p.bio}</div>
                  </div>
                  {sel && (
                    <span className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Stäng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
