import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <div className={cn("flex size-9 items-center justify-center rounded-xl bg-slate-100", iconClassName)}>
            <Icon className="size-4.5" />
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        {progress !== undefined && (
          <ProgressCircle value={progress} size={56} strokeWidth={6}>
            <span className="text-xs font-bold text-slate-900">{progress}%</span>
          </ProgressCircle>
        )}
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
        >
          {actionLabel}
          <ArrowUpRight className="size-4" />
        </button>
      )}
    </Card>
  );
}
