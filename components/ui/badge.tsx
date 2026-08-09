import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary-50 text-primary-800 ring-primary-200/80",
  success: "bg-emerald-50/90 text-emerald-800 ring-emerald-200/80",
  warning: "bg-amber-50/90 text-amber-800 ring-amber-200/80",
  danger: "bg-rose-50/90 text-rose-800 ring-rose-200/80",
  info: "bg-sky-50/90 text-sky-800 ring-sky-200/80",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  outline: "bg-white text-slate-700 ring-slate-200/90",
};

const dotColors: Record<BadgeVariant, string> = {
  primary: "bg-primary-600",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  neutral: "bg-slate-400",
  outline: "bg-slate-400",
};

export function Badge({ className, variant = "neutral", dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset tracking-tight",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("size-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
}
