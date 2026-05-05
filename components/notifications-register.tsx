"use client";

// Registrerar service worker (sw.js) en gång vid mount + lyssnar på domänevents
// och pushar in-app aviseringar (klockfeed) för dem.
// SW finns BARA för click-handling — vi har ingen Push API.
import * as React from "react";
import { pushNotification } from "@/lib/notifications";
import { refillHearts as _refillHearts } from "@/lib/storage"; // för typer

export function NotificationsRegister() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // ---- Service worker ----
    if ("serviceWorker" in navigator && "Notification" in window) {
      const onLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch(() => {
            // Tyst fail — sw är inte kritiskt
          });
      };
      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad);
      }
    }

    // ---- Domän-event → in-app feed ----
    function onLessonComplete(e: Event) {
      const detail = (e as CustomEvent<{ lessonId?: string; lang?: string }>).detail;
      pushNotification({
        type: "lesson-done",
        title: "Lektion klar",
        body: `Bra jobbat! +20 XP — du tjänar varje minut du lägger.`,
        link: detail?.lang ? `/learn/${detail.lang}` : "/",
      });
    }
    function onFreezeAwarded(e: Event) {
      const detail = (e as CustomEvent<{ count: number; streak: number }>).detail;
      const cnt = detail?.count ?? 1;
      pushNotification({
        type: "streak-freeze",
        title: `Streak-skydd aktiverat ❄️`,
        body: `Du fick ${cnt} streak-freeze${cnt > 1 ? "s" : ""}. Nu skyddas streaken om du missar en dag.`,
      });
    }
    function onHeartsRefilled() {
      pushNotification({
        type: "hearts-refilled",
        title: "Hjärtan återställda 💖",
        body: "Du har 5/5 hjärtan igen. Dags att utmana dig själv?",
      });
    }
    window.addEventListener("fluentic:lesson-complete", onLessonComplete);
    window.addEventListener("fluentic:freeze-awarded", onFreezeAwarded);
    window.addEventListener("fluentic:hearts-refilled", onHeartsRefilled);

    return () => {
      window.removeEventListener("fluentic:lesson-complete", onLessonComplete);
      window.removeEventListener("fluentic:freeze-awarded", onFreezeAwarded);
      window.removeEventListener("fluentic:hearts-refilled", onHeartsRefilled);
    };
  }, []);
  return null;
}

// Re-exportera om någon vill trigga manuellt
export { _refillHearts as refillHearts };
