"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUserAsync } from "@/lib/auth";
import { isSupabaseEnabled } from "@/lib/supabase";

// Skyddar app-routes — om ej inloggad, redirect till /login.
// Pages som är öppna utan inloggning listas i PUBLIC_PATHS.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/pricing",
  "/unlock",
  "/onboarding",
];

export function AuthGuard() {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!pathname) return;
    if (PUBLIC_PATHS.includes(pathname)) return;
    if (/\.[a-z0-9]+$/i.test(pathname)) return;

    let cancelled = false;
    // I Supabase-mode behöver vi await — synkron getCurrentUser returnerar
    // alltid null där. Vi väntar på async-checken innan eventuell redirect.
    (async () => {
      const user = await getCurrentUserAsync();
      if (cancelled) return;
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    })();

    return () => { cancelled = true; };
  }, [pathname, router]);

  return null;
}

// Re-export så övriga komponenter kan kolla utan import
export { isSupabaseEnabled };
