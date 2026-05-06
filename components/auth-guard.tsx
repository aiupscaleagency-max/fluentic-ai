"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

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
    // Skip alla statiska tillgångar (matchas via filtillägg)
    if (/\.[a-z0-9]+$/i.test(pathname)) return;
    if (!getCurrentUser()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  return null;
}
