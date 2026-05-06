"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Mic,
  BookOpen,
  Languages,
  Heart,
  Trophy,
  ArrowRight,
  Check,
  Globe,
  Zap,
  Users,
} from "lucide-react";
import { useUser } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { useUiLang, setUiLang, UI_LANGS, type UiLang } from "@/lib/ui-language";
import { hasOnboarded, getSelectedLanguages } from "@/lib/storage";

// Landing page — visas för icke-inloggade. Inloggade redirektas till sin
// första lärsida (eller /onboarding om de ej onboardat).
export default function LandingPage() {
  const user = useUser();
  const router = useRouter();
  const t = useT();
  const uiLang = useUiLang();
  const [langOpen, setLangOpen] = React.useState(false);

  // Auto-redirect om inloggad
  React.useEffect(() => {
    if (!user) return;
    if (!hasOnboarded()) {
      router.replace("/onboarding");
      return;
    }
    const langs = getSelectedLanguages();
    const first = langs[0] ?? "es";
    router.replace(`/learn/${first}`);
  }, [user, router]);

  // Visa inget medan vi väntar på att redirect:a inloggade
  if (user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-16"
    >
      {/* Floating bg-orbs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="float-slow absolute top-10 left-10 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="float-med absolute top-40 right-10 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="float-fast absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      {/* Top bar med språk + login/signup */}
      <header className="flex items-center justify-between py-2 sticky top-0 z-30 backdrop-blur-md bg-[#0b0918]/40 -mx-4 px-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/40">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="text-gradient">Fluentic AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-bold italic text-white hover:bg-white/10"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{uiLang}</span>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 z-50 mt-1 w-44 rounded-xl glass-strong border border-white/15 p-1 shadow-xl">
                  {UI_LANGS.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { setUiLang(l.code as UiLang); setLangOpen(false); }}
                      className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-200 hover:bg-white/10"
                    >
                      <span className="text-base">{l.flag}</span>
                      <span className="font-medium">{l.native}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Link href="/login">
            <Button variant="ghost" size="sm">{t("landing.login")}</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">{t("landing.signup")}</Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="text-center space-y-6 py-10 sm:py-16">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-2xl shadow-violet-500/40"
        >
          <Sparkles className="h-10 w-10 text-white" />
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          {t("landing.hero.title")} <span className="text-gradient">{t("landing.hero.highlight")}</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
          {t("landing.hero.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
          <Link href="/signup">
            <Button size="lg" className="px-8">
              {t("landing.hero.cta")} <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              {t("landing.login")}
            </Button>
          </Link>
        </div>

        {/* Social proof — språk-flaggor */}
        <div className="pt-4 flex items-center justify-center gap-3 text-sm text-slate-400">
          <span>🇪🇸 🇬🇧 🇫🇷 🇸🇦</span>
          <span>·</span>
          <span>{t("landing.hero.social")}</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold">{t("landing.features.title")}</h2>
          <p className="text-slate-300 max-w-xl mx-auto">{t("landing.features.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Mic className="h-6 w-6" />}
            color="from-violet-400 to-pink-400"
            title={t("landing.feat1.title")}
            body={t("landing.feat1.body")}
          />
          <FeatureCard
            icon={<Languages className="h-6 w-6" />}
            color="from-cyan-400 to-blue-500"
            title={t("landing.feat2.title")}
            body={t("landing.feat2.body")}
          />
          <FeatureCard
            icon={<BookOpen className="h-6 w-6" />}
            color="from-amber-400 to-rose-500"
            title={t("landing.feat3.title")}
            body={t("landing.feat3.body")}
          />
          <FeatureCard
            icon={<Trophy className="h-6 w-6" />}
            color="from-emerald-400 to-cyan-500"
            title={t("landing.feat4.title")}
            body={t("landing.feat4.body")}
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            color="from-pink-400 to-violet-500"
            title={t("landing.feat5.title")}
            body={t("landing.feat5.body")}
          />
          <FeatureCard
            icon={<Heart className="h-6 w-6" />}
            color="from-rose-400 to-orange-400"
            title={t("landing.feat6.title")}
            body={t("landing.feat6.body")}
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold">{t("landing.how.title")}</h2>
          <p className="text-slate-300">{t("landing.how.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <Card key={n}>
              <CardContent className="p-5 space-y-2">
                <div className="text-3xl font-extrabold text-gradient">{n}</div>
                <h3 className="font-bold text-lg">{t(`landing.step${n}.title`)}</h3>
                <p className="text-sm text-slate-300">{t(`landing.step${n}.body`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="space-y-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold">{t("landing.pricing.title")}</h2>
        <p className="text-slate-300 max-w-xl mx-auto">{t("landing.pricing.subtitle")}</p>
        <div className="flex justify-center pt-2">
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              <Users className="h-5 w-5" /> {t("landing.pricing.cta")} <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative rounded-3xl glass-strong border border-violet-300/30 p-8 sm:p-12 text-center space-y-4 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="float-slow absolute -top-10 left-10 h-40 w-40 rounded-full bg-violet-500/40 blur-3xl" />
          <div className="float-fast absolute -bottom-5 right-10 h-32 w-32 rounded-full bg-cyan-400/30 blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t("landing.finalcta.title")}</h2>
          <p className="text-slate-300 mt-2 max-w-xl mx-auto">{t("landing.finalcta.body")}</p>
          <div className="pt-5">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                {t("landing.finalcta.cta")} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 pt-6 pb-8 text-xs text-slate-400 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div>© {new Date().getFullYear()} Fluentic AI. {t("landing.footer.tag")}</div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-slate-200">{t("landing.login")}</Link>
          <Link href="/pricing" className="hover:text-slate-200">{t("landing.pricing.cta")}</Link>
        </div>
      </footer>
    </motion.div>
  );
}

function FeatureCard({
  icon, color, title, body,
}: { icon: React.ReactNode; color: string; title: string; body: string }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
          {icon}
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{body}</p>
      </CardContent>
    </Card>
  );
}
