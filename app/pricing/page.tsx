"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowLeft, Star, Crown, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUser, updateUserTier, type User } from "@/lib/auth";
import { useT } from "@/lib/i18n";

interface Tier {
  id: User["tier"];
  name: string;
  priceMonthly: string;
  badge?: string;
  highlight?: boolean;
  icon: React.ReactNode;
  color: string;
  ctaKey: string;
  features: string[];
}

export default function PricingPage() {
  const t = useT();
  const user = useUser();

  const tiers: Tier[] = [
    {
      id: "free",
      name: t("pricing.free.name"),
      priceMonthly: t("pricing.free.price"),
      icon: <Sparkles className="h-5 w-5" />,
      color: "from-slate-500 to-slate-700",
      ctaKey: "pricing.free.cta",
      features: [
        t("pricing.free.f1"),
        t("pricing.free.f2"),
        t("pricing.free.f3"),
        t("pricing.free.f4"),
      ],
    },
    {
      id: "pro",
      name: t("pricing.pro.name"),
      priceMonthly: t("pricing.pro.price"),
      badge: t("pricing.popular"),
      highlight: true,
      icon: <Star className="h-5 w-5" />,
      color: "from-violet-500 to-pink-500",
      ctaKey: "pricing.pro.cta",
      features: [
        t("pricing.pro.f1"),
        t("pricing.pro.f2"),
        t("pricing.pro.f3"),
        t("pricing.pro.f4"),
        t("pricing.pro.f5"),
        t("pricing.pro.f6"),
      ],
    },
    {
      id: "family",
      name: t("pricing.family.name"),
      priceMonthly: t("pricing.family.price"),
      icon: <Users className="h-5 w-5" />,
      color: "from-amber-400 to-rose-500",
      ctaKey: "pricing.family.cta",
      features: [
        t("pricing.family.f1"),
        t("pricing.family.f2"),
        t("pricing.family.f3"),
        t("pricing.family.f4"),
        t("pricing.family.f5"),
      ],
    },
  ];

  async function pickTier(id: User["tier"]) {
    if (!user) {
      try {
        window.localStorage.setItem("fluentic.pending-tier", id);
      } catch { /* tyst */ }
      window.location.href = "/signup";
      return;
    }
    if (id === "free") {
      await updateUserTier("free");
      window.location.href = "/learn/es";
      return;
    }

    // Pro/Family — försök skapa Stripe Checkout-session
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: id, userId: user.id, userEmail: user.email }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      // Stripe inte konfigurerat (503) → visa "kommer snart"
      if (res.status === 503) {
        alert(t("pricing.comingSoon"));
        return;
      }
      alert(`Fel: ${data.error ?? "okänt"}`);
    } catch {
      alert(t("pricing.comingSoon"));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-sm text-slate-300 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("common.back")}
        </Link>
      </div>

      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-2xl shadow-violet-500/40">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold">{t("pricing.title")}</h1>
        <p className="text-lg text-slate-300">{t("pricing.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {tiers.map((tier) => (
          <motion.div
            key={tier.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn("relative", tier.highlight && "md:-mt-4")}
          >
            <Card className={cn(
              "h-full",
              tier.highlight && "border-violet-300/50 shadow-lg shadow-violet-500/30",
            )}>
              <CardContent className="p-6 space-y-5">
                {tier.badge && (
                  <Badge variant="warning" className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5">
                    {tier.badge}
                  </Badge>
                )}

                <div className="space-y-2">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tier.color} text-white shadow-md`}>
                    {tier.icon}
                  </div>
                  <h2 className="text-2xl font-bold">{tier.name}</h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{tier.priceMonthly}</span>
                    {tier.id !== "free" && <span className="text-sm text-slate-400">/ {t("pricing.month")}</span>}
                  </div>
                </div>

                <ul className="space-y-2 pt-2 border-t border-white/10">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={tier.highlight ? "default" : "outline"}
                  onClick={() => pickTier(tier.id)}
                  disabled={user?.tier === tier.id}
                >
                  {user?.tier === tier.id ? t("pricing.current") : t(tier.ctaKey)}
                </Button>
                {tier.id !== "free" && (
                  <p className="text-[10px] text-slate-400 text-center">
                    {t("pricing.notActive")}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto text-center text-sm text-slate-300 space-y-2 pt-6">
        <p className="font-semibold">{t("pricing.faq.q1")}</p>
        <p>{t("pricing.faq.a1")}</p>
      </div>
    </motion.div>
  );
}
