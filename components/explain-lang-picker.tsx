"use client";

import * as React from "react";
import type { LangCode } from "@/lib/languages";
import {
  EXPLAIN_LANGS,
  getExplainLang,
  setExplainLang,
  getExplainLangMeta,
  type ExplainLang,
} from "@/lib/explain-lang";
import { Badge } from "./ui/badge";
import { Languages } from "lucide-react";

// Liten badge bredvid track-pickern. Klick öppnar popover med 3 pills.
// Sparar valet direkt mot localStorage per språk.
export function ExplainLangPicker({ lang }: { lang: LangCode }) {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<ExplainLang>("sv");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setCurrent(getExplainLang(lang));
    function onChange(e: Event) {
      const detail = (e as CustomEvent<{ lang: string; explainLang: ExplainLang }>).detail;
      if (detail?.lang === lang) setCurrent(detail.explainLang);
    }
    window.addEventListener("fluentic:explain-lang-changed", onChange);
    return () => window.removeEventListener("fluentic:explain-lang-changed", onChange);
  }, [lang]);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function pick(code: ExplainLang) {
    setExplainLang(lang, code);
    setCurrent(code);
    setOpen(false);
  }

  const meta = getExplainLangMeta(current);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex"
        aria-label="Byt förklaringsspråk"
      >
        <Badge
          variant="outline"
          className="gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Languages className="h-3 w-3" />
          {meta.flag} Förklaras på {meta.native}
        </Badge>
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-3 space-y-2">
          <div className="text-xs text-slate-500">På vilket språk vill du få förklaringar?</div>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {EXPLAIN_LANGS.map((el) => {
              const active = current === el.code;
              return (
                <button
                  key={el.code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => pick(el.code)}
                  className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                    active
                      ? "border-violet-400 bg-violet-100 dark:bg-violet-500/20 text-violet-900 dark:text-violet-100"
                      : "border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10"
                  }`}
                >
                  {el.flag} {el.native}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
