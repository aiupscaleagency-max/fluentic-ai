import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { NotificationsRegister } from "@/components/notifications-register";
import { AchievementWatcher } from "@/components/achievement-watcher";
import { MaritzaChat } from "@/components/maritza-chat";
import { InterpreterFab } from "@/components/interpreter-fab";
import { AuthGuard } from "@/components/auth-guard";

export const metadata: Metadata = {
  title: "Fluentic AI — Lär dig språk på det roliga sättet",
  description:
    "Lär dig spanska, engelska, franska och arabiska med AI-driven konversation, flashcards, mini-spel och en inbyggd tolk.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className="dark">
      <body className="min-h-screen antialiased">
        <AuthGuard />
        <OnboardingGuard />
        <NotificationsRegister />
        <AchievementWatcher />
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <InterpreterFab />
        <MaritzaChat />
      </body>
    </html>
  );
}
