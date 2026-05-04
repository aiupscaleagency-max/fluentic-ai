import Link from "next/link";
import { LANGUAGES } from "@/lib/languages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Languages, Calendar, ArrowRight, Mic, Award, Flame } from "lucide-react";
import { DailyGoalRing } from "@/components/daily-goal";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 py-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Fluentic AI — <span className="text-indigo-600">Lär dig som om du var där</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Lär dig som om du var där — uttala, prata, lev språket. AI-driven konversation,
          uttalscoach och daglig streak.
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

      <section className="grid sm:grid-cols-[auto_1fr] gap-4 items-center">
        <DailyGoalRing />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Sätt ett dagligt XP-mål, håll streaken vid liv och låt hjärtan-systemet hålla dig fokuserad.
          Allt sparas lokalt i webbläsaren — inga konton än.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Välj språk</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {LANGUAGES.map((lang) => (
            <Link key={lang.code} href={`/learn/${lang.code}`}>
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full">
                <CardContent className="p-6 text-center space-y-2">
                  <div className="text-5xl">{lang.flag}</div>
                  <div className="font-semibold">{lang.name}</div>
                  <div className="text-sm text-slate-500" dir={lang.dir} lang={lang.code}>
                    {lang.native}
                  </div>
                  <div className="flex items-center justify-center text-xs text-indigo-600 pt-2">
                    Starta <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

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
            title="6 roll-spel-scenarier"
            desc="Café, flygplats, fest, lägenhet, läkare, jobbintervju — träna i kontext."
          />
          <FeatureCard
            icon={<Calendar className="h-5 w-5" />}
            title="Schema & påminnelser"
            desc="Lägg in dina lektioner i veckan och få notiser när det är dags."
          />
        </div>
      </section>
    </div>
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
    <Card>
      <CardContent className="p-5 space-y-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {icon}
        </div>
        <div className="font-semibold">{title}</div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
      </CardContent>
    </Card>
  );
}
