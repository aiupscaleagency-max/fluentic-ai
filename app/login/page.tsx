"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { login } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await login(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace("/");
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
              <h1 className="text-2xl font-bold">{t("auth.login.title")}</h1>
              <p className="text-sm text-slate-300">{t("auth.login.subtitle")}</p>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium">{t("auth.email")}</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="namn@example.com"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium">{t("auth.password")}</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md p-2">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading || !email || !password}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}</> : <>{t("auth.login.cta")} <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-300 pt-2 border-t border-white/10">
              {t("auth.noAccount")}{" "}
              <Link href="/signup" className="text-violet-300 hover:text-violet-200 font-medium">
                {t("auth.signup.cta")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
