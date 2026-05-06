"use client";

// Skickar förstagångsbesökare till /onboarding. Touchar inte middleware.
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasOnboarded } from "@/lib/storage";
import { getCurrentUserAsync } from "@/lib/auth";

const SKIP_PATHS = ["/", "/login", "/signup", "/pricing", "/onboarding", "/unlock", "/account"];

export function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!pathname) return;
    if (SKIP_PATHS.includes(pathname)) return;
    if (SKIP_PATHS.some((p) => p !== "/" && pathname.startsWith(p + "/"))) return;

    let cancelled = false;
    (async () => {
      const user = await getCurrentUserAsync();
      if (cancelled) return;
      if (!user) return; // sköts av AuthGuard
      if (!hasOnboarded()) {
        router.replace("/onboarding");
      }
    })();

    return () => { cancelled = true; };
  }, [pathname, router]);

  return null;
}
