// React-hook som lyssnar på fluentic:level-changed så UI uppdateras direkt
"use client";

import * as React from "react";
import type { LangCode } from "./languages";
import { getLevel, type CefrLevel } from "./level";

export function useLevel(lang: LangCode): CefrLevel | null {
  const [level, setLevelState] = React.useState<CefrLevel | null>(null);

  React.useEffect(() => {
    setLevelState(getLevel(lang));
    function onChange(e: Event) {
      const detail = (e as CustomEvent<{ lang: string; level: CefrLevel }>).detail;
      if (detail?.lang === lang) setLevelState(detail.level);
    }
    window.addEventListener("fluentic:level-changed", onChange);
    return () => window.removeEventListener("fluentic:level-changed", onChange);
  }, [lang]);

  return level;
}
