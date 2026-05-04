import * as React from "react";
import { cn } from "@/lib/cn";

export function Progress({
  value,
  className,
}: {
  value: number; // 0–100
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800", className)}
    >
      <div
        className="h-full bg-indigo-600 transition-all duration-300"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
