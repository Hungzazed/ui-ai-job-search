export type ScoreTone = "good" | "mid" | "low";

export interface ToneClasses {
  text: string;
  bg: string;
  bar: string;
  stroke: string;
  strokeText: string;
  border: string;
}

const TONE_CLASSES: Record<ScoreTone, ToneClasses> = {
  good: {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    bar: "bg-emerald-500",
    stroke: "stroke-emerald-500",
    strokeText: "text-emerald-700",
    border: "border-emerald-200",
  },
  mid: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    bar: "bg-amber-500",
    stroke: "stroke-amber-500",
    strokeText: "text-amber-700",
    border: "border-amber-200",
  },
  low: {
    text: "text-rose-600",
    bg: "bg-rose-50",
    bar: "bg-rose-500",
    stroke: "stroke-rose-500",
    strokeText: "text-rose-700",
    border: "border-rose-200",
  },
};

/** Ngưỡng của điểm phù hợp giữa hồ sơ và một tin tuyển dụng. */
export function matchTone(score: number): ScoreTone {
  if (score >= 80) return "good";
  if (score >= 60) return "mid";
  return "low";
}

export function matchToneClasses(score: number): ToneClasses {
  return TONE_CLASSES[matchTone(score)];
}

/**
 * Ngưỡng cho tỷ lệ thành công của AI gateway — cao hơn `matchTone` một cách có
 * chủ ý: 80% là điểm phù hợp tốt cho một công việc, nhưng một gateway hỏng một
 * phần năm số lời gọi thì đang ở tình trạng báo động.
 */
export function successRateTone(rate: number): ToneClasses {
  if (rate >= 95) return TONE_CLASSES.good;
  if (rate >= 80) return TONE_CLASSES.mid;
  return TONE_CLASSES.low;
}

/**
 * Màu thanh cho điểm từng chiều đánh giá.
 *
 * `null` nghĩa là backend không chấm chiều này — tô xám chứ không tô màu của
 * điểm 0, vì hai chuyện đó khác hẳn nhau.
 */
export function scoreBarClass(value: number | null): string {
  if (value === null) return "bg-slate-200";
  if (value >= 85) return "bg-emerald-500";
  if (value >= 70) return "bg-primary-500";
  return "bg-amber-500";
}
