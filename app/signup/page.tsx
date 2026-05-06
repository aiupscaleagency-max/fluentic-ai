"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Loader2, Check } from "lucide-react";
import { signup } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export default function SignupPage() {
  const router = useRouter();
  const t = useT();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = signup(email, password, name);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    // Nyregistrerad → onboarding direkt
    router.replace("/onboarding");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[80vh] flex items-center justify-center"
    >
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg justify-center mb-6">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/40">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="text-gradient">Fluentic AI</span>
        </Link>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold">{t("auth.signup.title")}</h1>
              <p className="text-sm text-slate-300">{t("auth.signup.subtitle")}</p>
            </div>

            <ul className="space-y-1.5 text-sm text-slate-200 bg-violet-500/10 border border-violet-300/20 rounded-xl p-3">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> {t("auth.signup.perk1")}</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> {t("auth.signup.perk2")}</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> {t("auth.signup.perk3")}</li>
            </ul>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium">{t("auth.name")}</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mike"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium">{t("auth.email")}</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="namn@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium">{t("auth.password")}</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.password.hint")}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md p-2">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading || !email || !password || !name}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}</> : <>{t("auth.signup.cta")} <ArrowRight className="h-4 w-4" /></>}
              </Button>
              <p className="text-[10px] text-slate-400 text-center">
                {t("auth.signup.terms")}
              </p>
            </form>

            <div className="text-center text-sm text-slate-300 pt-2 border-t border-white/10">
              {t("auth.haveAccount")}{" "}
              <Link href="/login" className="text-violet-300 hover:text-violet-200 font-medium">
                {t("auth.login.cta")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
