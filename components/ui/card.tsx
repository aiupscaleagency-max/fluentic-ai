import * as React from "react";
import { cn } from "@/lib/cn";

// Premium glasskort: standard = subtil glas, "solid" för opaka kort,
// "gradient" för hover-glow border. Bakåtkompatibelt — tar emot vanlig className.
type CardVariant = "glass" | "solid" | "gradient";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ className, variant = "glass", ...props }: CardProps) {
  const base = "rounded-2xl border transition-colors";
  const variants: Record<CardVariant, string> = {
    glass:
      "glass border-white/10 text-slate-100",
    solid:
      "bg-slate-900/80 border-slate-800 text-slate-100 shadow-sm",
    gradient:
      "glass border-white/10 gradient-border text-slate-100",
  };
  return (
    <div
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-400 mt-1", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-3", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0 flex items-center", className)} {...props} />;
}
