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
  size = 140,
  strokeWidth = 10,
  label = "Độ phù hợp AI",
  className,
}: AIMatchProgressProps) {
  const tone =
    value >= 80
      ? { stroke: "stroke-emerald-500", text: "text-emerald-700" }
      : value >= 60
        ? { stroke: "stroke-amber-500", text: "text-amber-700" }
        : { stroke: "stroke-rose-500", text: "text-rose-700" };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <ProgressCircle
        value={value}
        size={size}
        strokeWidth={strokeWidth}
        strokeClassName={tone.stroke}
      >
        <span className={cn("text-3xl sm:text-4xl font-mono font-bold tracking-tight", tone.text)}>{value}%</span>
      </ProgressCircle>
      <div className="text-center">
        <p className="text-xs sm:text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {value >= 80 ? "Rất phù hợp — đề xuất ứng tuyển ngay" : value >= 60 ? "Khá phù hợp — cần tinh chỉnh CV" : "Ít phù hợp — xem bổ sung kỹ năng"}
        </p>
      </div>
    </div>
  );
}
