import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  value: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  progress?: number;
  className?: string;
}

export function StatCard({
  title,
  icon: Icon,
  iconClassName,
  value,
  subtitle,
  actionLabel,
  onAction,
  progress,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-4.5 transition-all duration-150 hover:border-slate-300", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-600">
          <div className={cn("flex size-8 items-center justify-center rounded-lg bg-slate-100/80 text-slate-700 border border-slate-200/60", iconClassName)}>
            <Icon className="size-4" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-slate-600 uppercase">{title}</span>
        </div>
        {progress !== undefined && (
          <ProgressCircle value={progress} size={48} strokeWidth={5}>
            <span className="text-[11px] font-mono font-bold text-slate-900">{progress}%</span>
          </ProgressCircle>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-slate-900">{value}</p>
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 font-normal leading-normal">{subtitle}</p>}

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 group"
        >
          {actionLabel}
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      )}
    </Card>
  );
}
