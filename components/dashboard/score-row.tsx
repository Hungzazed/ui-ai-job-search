import { CheckCircle } from "@phosphor-icons/react/ssr";
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
        <span className="flex items-center gap-1.5 text-slate-600">
          {label}
          <span className="font-mono text-3xs text-slate-400">{weight}</span>
        </span>
        <span className="font-mono font-semibold text-slate-900">
          {asPercent(value)}
        </span>
      </div>
      <Progress value={value ?? 0} barClassName={scoreBarClass(value)} />
    </div>
  );
}

/** Bản gọn một dòng, không có thanh — dùng ở cột tóm tắt trang tổng quan. */
export function ScoreLine({ label, weight, value }: ScoreBarProps) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-slate-600">
        <CheckCircle className="size-4 text-emerald-600" />
        {label}
        <span className="font-mono text-3xs text-slate-400">{weight}</span>
      </span>
      <span className="font-mono font-bold text-slate-900">
        {asPercent(value)}
      </span>
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
