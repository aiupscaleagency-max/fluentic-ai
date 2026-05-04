import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "secondary" | "outline" | "success" | "warning";

const variants: Record<Variant, string> = {
  default: "bg-indigo-600 text-white",
  secondary: "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
  outline: "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300",
  success: "bg-emerald-500 text-white",
  warning: "bg-amber-500 text-white",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
