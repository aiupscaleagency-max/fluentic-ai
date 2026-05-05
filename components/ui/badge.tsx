import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "secondary" | "outline" | "success" | "warning";

const variants: Record<Variant, string> = {
  default: "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm",
  secondary: "bg-white/10 text-slate-100 border border-white/10",
  outline: "border border-white/20 text-slate-200 bg-white/5",
  success: "bg-emerald-500/90 text-white shadow-sm",
  warning: "bg-amber-500 text-white shadow-sm",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-md",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
