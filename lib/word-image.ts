"use client";

// Hook som hämtar en illustration för ett ord. Cache i sessionStorage så
// flipping fram-och-tillbaka mellan flashcards inte triggar fetch om och om.
import * as React from "react";

export interface WordImage {
  url: string | null;
  alt?: string;
  credit?: string;
}

const PREFIX = "fluentic.wordimg.";

export function useWordImage(query: string | null | undefined): {
  image: WordImage | null;
  loading: boolean;
} {
  const [image, setImage] = React.useState<WordImage | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) {
      setImage(null);
      return;
    }
    const key = PREFIX + query.toLowerCase();
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw) {
        setImage(JSON.parse(raw) as WordImage);
        return;
      }
    } catch { /* tyst */ }

    let cancelled = false;
    setLoading(true);
    fetch("/api/word-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((r) => r.json())
      .then((data: WordImage) => {
        if (cancelled) return;
        setImage(data);
        try {
          window.sessionStorage.setItem(key, JSON.stringify(data));
        } catch { /* quota */ }
      })
      .catch(() => {
        if (!cancelled) setImage({ url: null });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query]);

  return { image, loading };
}
