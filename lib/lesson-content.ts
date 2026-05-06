"use client";

// Hjälper-hook för att hämta auto-genererat lektions-content (vocab + phrases)
// från /api/lesson-content. Använder localStorage som klient-cache så vi slipper
// nätverksanrop när användaren navigerar fram och tillbaka.
import * as React from "react";
import type { LangCode } from "./languages";

export interface GeneratedContent {
  vocab: { sv: string; word: string }[];
  phrases: { sv: string; text: string }[];
}

const CACHE_PREFIX = "fluentic.lesson-content.";

export function useGeneratedLessonContent(
  lessonId: string | null | undefined,
  lang: LangCode,
): { content: GeneratedContent | null; loading: boolean; error: string | null } {
  const [content, setContent] = React.useState<GeneratedContent | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!lessonId) return;
    const key = `${CACHE_PREFIX}${lessonId}-${lang}`;
    // Klient-cache först
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setContent(JSON.parse(raw) as GeneratedContent);
        return;
      }
    } catch { /* tyst */ }

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/lesson-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, language: lang }),
    })
      .then((res) => res.json())
      .then((data: GeneratedContent & { error?: string }) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          return;
        }
        const safe: GeneratedContent = {
          vocab: Array.isArray(data.vocab) ? data.vocab : [],
          phrases: Array.isArray(data.phrases) ? data.phrases : [],
        };
        setContent(safe);
        try {
          window.localStorage.setItem(key, JSON.stringify(safe));
        } catch { /* quota — best-effort */ }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [lessonId, lang]);

  return { content, loading, error };
}
