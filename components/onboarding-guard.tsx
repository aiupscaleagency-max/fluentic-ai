"use client";

// Skickar förstagångsbesökare till /onboarding. Touchar inte middleware.
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasOnboarded } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

// Skipa onboarding-redirect på publika landings, auth-sidor och själva onboarding
const SKIP_PATHS = ["/", "/login", "/signup", "/pricing", "/onboarding", "/unlock", "/account"];

export function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!pathname) return;
    if (SKIP_PATHS.includes(pathname)) return;
    if (SKIP_PATHS.some((p) => p !== "/" && pathname.startsWith(p + "/"))) return;
    // Ej inloggad sköts av AuthGuard — den redirektar till /login
    if (!getCurrentUser()) return;
    if (!hasOnboarded()) {
      router.replace("/onboarding");
    }
  }, [pathname, router]);

  return null;
}
