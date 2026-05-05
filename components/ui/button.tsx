import * as React from "react";
import { cn } from "@/lib/cn";

// Premium-knappar: gradient-primär, glas-sekundär, scale-on-press.
type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default:
    "bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:brightness-110",
  secondary:
    "glass text-slate-100 hover:bg-white/15",
  outline:
    "border border-white/20 bg-white/5 text-slate-100 hover:bg-white/10 backdrop-blur-md",
  ghost:
    "bg-transparent text-slate-300 hover:bg-white/10 hover:text-slate-100",
  destructive:
    "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30 hover:brightness-110",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "default", size = "md", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
