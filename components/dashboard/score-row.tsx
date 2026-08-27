import { Progress } from "@/components/ui/progress";
import { scoreBarClass, successRateTone } from "@/utils";

/**
 * `null` KHÔNG được vẽ thành 0%.
 *
 * Backend trả null cho chiều nó không chấm; "0%" ở đó sẽ bị đọc thành một kết
 * luận đánh giá ("bạn không có kỹ năng nào khớp"), tức là bịa ra một câu trả
 * lời mà hệ thống chưa hề đưa ra.
 */
const asPercent = (value: number | null): string =>
  value === null ? "—" : `${value}%`;

interface ScoreBarProps {
  label: string;
  /** Trọng số của chiều này trong điểm tổng, ví dụ "30%". */
  weight: string;
  value: number | null;
}

/** Một chiều đánh giá kèm thanh tiến độ — dùng ở trang chi tiết công việc. */
export function ScoreBar({ label, weight, value }: ScoreBarProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono font-semibold text-slate-900">
          {asPercent(value)}
        </span>
      </div>
      <Progress value={value ?? 0} barClassName={scoreBarClass(value)} />
      <p className="mt-1 text-3xs text-slate-400">trọng số {weight}</p>
    </div>
  );
}

/** Thanh tỷ lệ thành công dùng trong các bảng của trang quản trị. */
export function SuccessRateCell({ rate }: { rate: number }) {
  const tone = successRateTone(rate);
  return (
    <div className="flex items-center gap-2">
      <Progress value={rate} barClassName={tone.bar} className="w-20" />
      <span className={`font-mono text-xs font-bold ${tone.text}`}>{rate}%</span>
    </div>
  );
}
