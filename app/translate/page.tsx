import { Translator } from "@/components/translator";

export const metadata = {
  title: "Tolk-läge — Fluentic AI",
};

export default function TranslatePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Tolk-läge</h1>
        <p className="text-slate-500 text-sm">
          Översätt text mellan svenska, spanska, engelska, franska och arabiska — eller starta
          konversations-tolken där appen översätter åt båda sidor.
        </p>
      </div>
      <Translator />
    </div>
  );
}
