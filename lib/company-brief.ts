import type { CompanyVerdict } from "@/services";

export type VerdictTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

/**
 * `NO_REVIEWS_YET` tách khỏi `UNKNOWN` vì hai chuyện khác hẳn nhau: một bên là
 * trang đánh giá CÓ tồn tại nhưng chưa ai viết, bên kia là không tra ra gì. Cái
 * thứ nhất là dữ kiện có ích - công ty nhỏ, và bạn có thể là người đầu tiên.
 */
export const VERDICT_LABELS: Record<
  CompanyVerdict,
  { label: string; variant: VerdictTone }
> = {
  POSITIVE: { label: "Đánh giá tích cực", variant: "success" },
  MIXED: { label: "Ý kiến trái chiều", variant: "warning" },
  NEGATIVE: { label: "Nhiều phàn nàn", variant: "danger" },
  NO_REVIEWS_YET: { label: "Chưa ai đánh giá", variant: "info" },
  UNKNOWN: { label: "Chưa đủ dữ liệu", variant: "neutral" },
};

/**
 * Còn đang chờ lượt tra chạy xong hay không.
 *
 * So theo mốc `updatedAt` chứ không theo "đã có bản chưa": lúc bấm Làm mới thì
 * bản cũ vẫn nằm đó, nên xét sự tồn tại sẽ báo xong ngay lập tức.
 *
 * `pendingSince === undefined` nghĩa là không chờ gì; `null` nghĩa là đang chờ
 * lượt tra ĐẦU TIÊN, khi chưa có bản nào.
 */
export function isBriefPending(
  pendingSince: string | null | undefined,
  updatedAt: string | null,
): boolean {
  return pendingSince !== undefined && updatedAt === pendingSince;
}
