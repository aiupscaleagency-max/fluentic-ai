"use client";

import * as React from "react";
import { hasOnboarded, markOnboarded, setDailyGoal } from "@/lib/storage";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";

// Engångs-dialog för att välja dagligt mål
export function OnboardingDialog() {
  const [open, setOpen] = React.useState(false);
  const [picked, setPicked] = React.useState(20);

  React.useEffect(() => {
    if (!hasOnboarded()) setOpen(true);
  }, []);

  function save() {
    setDailyGoal(picked);
    markOnboarded();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader>
        <DialogTitle>Välkommen! Vad är ditt dagliga mål?</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p className="text-sm text-slate-500 mb-4">
          Små steg varje dag — välj vad som känns rimligt. Du kan ändra senare.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { goal: 10, label: "Avslappnat", desc: "10 XP/dag" },
            { goal: 20, label: "Vanligt", desc: "20 XP/dag" },
            { goal: 50, label: "Seriöst", desc: "50 XP/dag" },
          ].map((opt) => (
            <button
              key={opt.goal}
              onClick={() => setPicked(opt.goal)}
              className={`rounded-lg border p-3 text-center transition-colors ${
                picked === opt.goal
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                  : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
              }`}
            >
              <div className="font-semibold">{opt.label}</div>
              <div className="text-xs text-slate-500">{opt.desc}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save}>Sätt igång</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
