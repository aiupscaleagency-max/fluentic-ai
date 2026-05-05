"use client";

// Skickar förstagångsbesökare till /onboarding. Touchar inte middleware.
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasOnboarded } from "@/lib/storage";

const SKIP_PATHS = ["/onboarding", "/unlock"];

export function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (SKIP_PATHS.some((p) => pathname?.startsWith(p))) return;
    if (!hasOnboarded()) {
      router.replace("/onboarding");
    }
  }, [pathname, router]);

  return null;
}
