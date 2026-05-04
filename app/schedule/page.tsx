import { Scheduler } from "@/components/scheduler";

export const metadata = {
  title: "Schema — Fluentic AI",
};

export default function SchedulePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Schema & påminnelser</h1>
        <p className="text-slate-500 text-sm">
          Lägg in dina lektioner, aktivera påminnelser och få en notis när det är dags att öva.
        </p>
      </div>
      <Scheduler />
    </div>
  );
}
