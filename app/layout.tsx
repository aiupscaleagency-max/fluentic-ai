import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

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
    <html lang="sv">
      <body className="min-h-screen antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
