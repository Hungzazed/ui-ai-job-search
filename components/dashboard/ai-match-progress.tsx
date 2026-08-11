import { ProgressCircle } from "@/components/ui/progress-circle";
import { cn, matchTone, matchToneClasses } from "@/utils";

/** Một câu kết luận đi kèm con số — con số trần không nói người dùng nên làm gì. */
const VERDICTS = {
  good: "Rất phù hợp — đề xuất ứng tuyển ngay",
  mid: "Khá phù hợp — cần tinh chỉnh CV",
  low: "Ít phù hợp — xem bổ sung kỹ năng",
} as const;

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
  const tone = matchTone(value);
  const classes = matchToneClasses(value);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <ProgressCircle
        value={value}
        size={size}
        strokeWidth={strokeWidth}
        strokeClassName={classes.stroke}
      >
        <span
          className={cn(
            "text-3xl sm:text-4xl font-mono font-bold tracking-tight",
            classes.strokeText,
          )}
        >
          {value}%
        </span>
      </ProgressCircle>
      <div className="text-center">
        <p className="text-xs sm:text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{VERDICTS[tone]}</p>
      </div>
    </div>
  );
}
