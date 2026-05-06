"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogOut, User as UserIcon, Crown, Mail, Calendar } from "lucide-react";
import { useUser, logout } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export default function AccountPage() {
  const router = useRouter();
  const t = useT();
  const user = useUser();

  // Säkra redirect om ej inloggad
  React.useEffect(() => {
    if (user === null) {
      // useUser börjar på null så vi vänta en tick — om den fortsätter null efter 100ms är användaren inte inloggad
      const id = setTimeout(() => {
        if (typeof window !== "undefined" && !window.localStorage.getItem("fluentic.session")) {
          router.replace("/login");
        }
      }, 200);
      return () => clearTimeout(id);
    }
  }, [user, router]);

  if (!user) return null;

  function doLogout() {
    logout();
    router.replace("/");
  }

  const tierLabel: Record<typeof user.tier, string> = {
    free: t("pricing.free.name"),
    pro: t("pricing.pro.name"),
    family: t("pricing.family.name"),
  };
  const tierColor: Record<typeof user.tier, string> = {
    free: "bg-slate-500/30",
    pro: "bg-gradient-to-r from-violet-500/40 to-pink-500/40",
    family: "bg-gradient-to-r from-amber-400/40 to-rose-500/40",
  };

  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const created = new Date(user.createdAt).toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-sm text-slate-300 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("common.back")}
        </Link>
        <Button variant="ghost" size="sm" onClick={doLogout}>
          <LogOut className="h-4 w-4" /> {t("account.logout")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/40">
              {initials || <UserIcon className="h-8 w-8" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-2xl font-bold truncate">{user.name}</div>
              <div className="text-sm text-slate-300 truncate">{user.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-cyan-300 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase text-slate-400">{t("auth.email")}</div>
                <div className="text-sm text-slate-100 truncate">{user.email}</div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-violet-300 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase text-slate-400">{t("account.memberSince")}</div>
                <div className="text-sm text-slate-100">{created}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Crown className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-semibold">{t("account.tier")}</span>
              <Badge className={tierColor[user.tier]}>{tierLabel[user.tier]}</Badge>
            </div>
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                {user.tier === "free" ? t("account.upgrade") : t("account.changeTier")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
