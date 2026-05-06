"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LANGUAGES } from "@/lib/languages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Languages,
  Calendar,
  ArrowRight,
  Mic,
  Award,
  Flame,
  Sparkles,
} from "lucide-react";
import { DailyGoalRing } from "@/components/daily-goal";
import { DayPlan } from "@/components/day-plan";
import { NotificationCard } from "@/components/notification-card";

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-16"
    >
      {/* Hero */}
      <section className="relative text-center space-y-5 py-10 sm:py-16">
        {/* Floating gradient orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="float-slow absolute top-0 left-10 h-56 w-56 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="float-med absolute -top-10 right-10 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl" />
          <div className="float-fast absolute bottom-0 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-pink-500/25 blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-2xl shadow-violet-500/40"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Fluentic AI — <br className="sm:hidden" />
          <span className="text-gradient">lär dig som om du var där</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
          Tala med en AI-tutor som om det vore ett videosamtal. Spel, scenarier,
          tolk, schema — allt i en plats. Inga konton. Lokalt sparat.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link href="/learn/es">
            <Button size="lg">
              <BookOpen className="h-4 w-4" />
              Börja lära
            </Button>
          </Link>
          <Link href="/learn/es/call">
            <Button size="lg" variant="secondary">
              <Mic className="h-4 w-4" />
              Tala med tutor
            </Button>
          </Link>
          <Link href="/translate">
            <Button size="lg" variant="outline">
              <Languages className="h-4 w-4" />
              Tolk-läge
            </Button>
          </Link>
        </div>
      </section>

      {/* Notification permission CTA — visas bara när relevant */}
      <NotificationCard />

      {/* AI dagsplanerare — "Din dag" — visas bara om språk är valda */}
      <DayPlan />

      {/* Dagligt mål */}
      <section className="grid sm:grid-cols-[auto_1fr] gap-5 items-center">
        <DailyGoalRing />
        <p className="text-sm text-slate-300">
          Sätt ett dagligt XP-mål, håll streaken vid liv och låt hjärtan-systemet
          hålla dig fokuserad. Allt sparas lokalt — inga konton än.
        </p>
      </section>

      {/* Språk */}
      <section>
        <h2 className="text-2xl font-semibold mb-5">Välj språk</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {LANGUAGES.map((lang, i) => (
            <Link key={lang.code} href={`/learn/${lang.code}`}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                whileHover={{ scale: 1.04, y: -4, rotateX: 4, rotateY: -4 }}
                whileTap={{ scale: 0.98 }}
                className="h-full"
                style={{ transformStyle: "preserve-3d", perspective: 800 }}
              >
                <Card variant="gradient" className="cursor-pointer h-full hover:bg-white/10">
                  <CardContent className="p-6 text-center space-y-2">
                    <div className="text-5xl drop-shadow">{lang.flag}</div>
                    <div className="font-semibold">{lang.name}</div>
                    <div className="text-sm text-slate-400" dir={lang.dir} lang={lang.code}>
                      {lang.native}
                    </div>
                    <div className="flex items-center justify-center text-xs text-cyan-300 pt-2">
                      Starta <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Funktioner */}
      <section className="grid sm:grid-cols-3 gap-4">
        <FeatureCard
          icon={<Mic className="h-5 w-5" />}
          title="Röstsamtal med AI"
          desc="Tala fritt eller in i ett scenario — tutorn lyssnar, svarar och rättar dig på rätt nivå."
        />
        <FeatureCard
          icon={<Award className="h-5 w-5" />}
          title="Uttalscoach"
          desc="Spela in fraser, få token-för-token-diff och AI-tips för exakt vad du ska träna på."
        />
        <FeatureCard
          icon={<Flame className="h-5 w-5" />}
          title="Daglig streak"
          desc="Sätt ett mål, samla XP, tjäna streak-freezes och håll dig på rätt sida om hjärtan."
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Kom igång snabbt</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <FeatureCard
            icon={<BookOpen className="h-5 w-5" />}
            title="CEFR-nivåer A1–C1"
            desc="Välj nivå per språk — vi anpassar ord, grammatik och samtal efter den."
          />
          <FeatureCard
            icon={<Languages className="h-5 w-5" />}
            title="10 roll-spel-scenarier"
            desc="Café, flygplats, fest, lägenhet, läkare, jobbintervju — träna i kontext."
          />
          <FeatureCard
            icon={<Calendar className="h-5 w-5" />}
            title="Schema & påminnelser"
            desc="Lägg in dina lektioner i veckan och få notiser när det är dags."
          />
        </div>
      </section>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card className="h-full">
        <CardContent className="p-5 space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-400/30 text-violet-200 border border-white/10">
            {icon}
          </div>
          <div className="font-semibold">{title}</div>
          <p className="text-sm text-slate-400">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
