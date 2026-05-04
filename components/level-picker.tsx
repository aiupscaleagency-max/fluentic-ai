"use client";

import * as React from "react";
import { CEFR_LEVELS, CEFR_DESCRIPTIONS, getLevel, setLevel, type CefrLevel } from "@/lib/level";
import type { LangCode } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { GraduationCap } from "lucide-react";

// Auto-öppnande dialog när nivå saknas, plus badge att klicka på för att byta
export function LevelPicker({
  lang,
  onChange,
}: {
  lang: LangCode;
  onChange?: (level: CefrLevel) => void;
}) {
  const language = getLanguage(lang)!;
  const [current, setCurrent] = React.useState<CefrLevel | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const lvl = getLevel(lang);
    setCurrent(lvl);
    if (!lvl) setOpen(true);
  }, [lang]);

  function pick(level: CefrLevel) {
    setLevel(lang, level);
    setCurrent(level);
    setOpen(false);
    onChange?.(level);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex"
        aria-label="Byt nivå"
      >
        <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
          <GraduationCap className="h-3 w-3" />
          {current ? `Nivå ${current}` : "Välj nivå"}
        </Badge>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Vilken nivå ligger du på i {language.name.toLowerCase()}?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-slate-500 mb-4">
            Vi anpassar ord, grammatik och samtal efter din CEFR-nivå.
          </p>
          <div className="grid gap-2">
            {CEFR_LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => pick(lvl)}
                className={`text-left rounded-lg border p-3 transition-colors hover:border-indigo-400 ${
                  current === lvl
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="font-semibold flex items-center gap-2">
                  <span className="inline-flex h-7 w-9 items-center justify-center rounded-md bg-indigo-600 text-white text-xs font-bold">
                    {lvl}
                  </span>
                  {CEFR_DESCRIPTIONS[lvl].split(" — ")[0]}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {CEFR_DESCRIPTIONS[lvl].split(" — ")[1]}
                </div>
              </button>
            ))}
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
