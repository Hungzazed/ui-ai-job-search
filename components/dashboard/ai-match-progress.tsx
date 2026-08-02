import { ProgressCircle } from "@/components/ui/progress-circle";
import { cn } from "@/lib/utils";

interface AIMatchProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function AIMatchProgress({
  value,
  size = 160,
  strokeWidth = 12,
  label = "Độ phù hợp AI",
  className,
}: AIMatchProgressProps) {
  const tone =
    value >= 80
      ? { stroke: "stroke-emerald-500", text: "text-emerald-600" }
      : value >= 60
        ? { stroke: "stroke-amber-500", text: "text-amber-600" }
        : { stroke: "stroke-rose-500", text: "text-rose-600" };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <ProgressCircle
        value={value}
        size={size}
        strokeWidth={strokeWidth}
        strokeClassName={tone.stroke}
      >
        <span className={cn("text-4xl font-bold tracking-tight", tone.text)}>{value}%</span>
      </ProgressCircle>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">
          {value >= 80 ? "Rất phù hợp — nên ứng tuyển sớm" : value >= 60 ? "Khá phù hợp — xem gợi ý cải thiện" : "Ít phù hợp — xem kỹ năng cần bổ sung"}
        </p>
      </div>
    </div>
  );
}
