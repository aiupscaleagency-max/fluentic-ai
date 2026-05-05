// Track minuter användaren faktiskt pratat med tutor — Praktika-style "talad tid är valutan"
// Lagras dag-för-dag i localStorage och summeras till en streak baserad på 5+ min/dag.
const KEY_PREFIX = "fluentic.spoken.";          // fluentic.spoken.YYYY-MM-DD = sekunder
const DAILY_GOAL_SECONDS = 5 * 60;              // 5 min/dag = en aktiv dag

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addSpokenSeconds(seconds: number): void {
  if (typeof window === "undefined" || seconds <= 0) return;
  try {
    const key = KEY_PREFIX + todayKey();
    const cur = parseInt(window.localStorage.getItem(key) ?? "0", 10) || 0;
    const next = cur + Math.round(seconds);
    window.localStorage.setItem(key, String(next));
    window.dispatchEvent(new CustomEvent("fluentic:spoken-changed", { detail: { seconds: next } }));
  } catch {
    // ignorera
  }
}

export function getSpokenToday(): number {
  if (typeof window === "undefined") return 0;
  try {
    const key = KEY_PREFIX + todayKey();
    return parseInt(window.localStorage.getItem(key) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

// Hur många sammanhängande dagar bakåt har minst 5 min spoken tid?
export function getSpokenStreak(): number {
  if (typeof window === "undefined") return 0;
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const key = `${KEY_PREFIX}${y}-${m}-${day}`;
    const sec = parseInt(window.localStorage.getItem(key) ?? "0", 10) || 0;
    if (sec >= DAILY_GOAL_SECONDS) {
      streak++;
    } else if (i > 0) {
      // Idag räknas inte mot streak om ej nått ännu — bryt först från igår
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export const SPOKEN_DAILY_GOAL_SECONDS = DAILY_GOAL_SECONDS;
