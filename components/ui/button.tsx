import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:translate-y-[1px] focus-visible:ring-primary-500 disabled:hover:bg-primary-600",
  secondary:
    "bg-primary-50 text-primary-800 border border-primary-100 hover:bg-primary-100 active:translate-y-[1px] focus-visible:ring-primary-400 disabled:hover:bg-primary-50",
  outline:
    "border border-slate-200/90 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 active:translate-y-[1px] focus-visible:ring-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:translate-y-[1px]",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:translate-y-[1px]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 font-medium",
  md: "h-9 px-3.5 text-xs sm:text-sm gap-2 font-medium",
  lg: "h-10.5 px-4.5 text-sm gap-2 font-semibold",
  icon: "size-9 p-0",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "btn-hallmark inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin shrink-0" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export { Button };
