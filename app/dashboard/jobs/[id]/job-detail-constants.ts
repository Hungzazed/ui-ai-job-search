import type { JobMatchWithJob } from "@/types";

/**
 * Chỉ HAI trong bốn chiều có trọng số được `GET /jobs/:id` trả về.
 *
 * "Hành vi & văn hoá" (15%) và "Định hướng nghề nghiệp" (30%) có trong khung
 * đánh giá nhưng endpoint này không trả, nên không được vẽ ra: một thanh tiến
 * độ không có số thật phía sau đọc như dữ liệu thật, và người dùng không có
 * cách nào phân biệt. Bản mock trước đây còn có "Dự án", "Cấp bậc" và
 * "Lương & Địa điểm" — backend không hề chấm ba tiêu chí đó.
 */
export const SCORE_ROWS = [
  { key: "technicalScore", label: "Kỹ năng chuyên môn", weight: "30%" },
  { key: "experienceScore", label: "Kinh nghiệm làm việc", weight: "25%" },
] as const;

export const VERDICT_META: Record<
  NonNullable<JobMatchWithJob["verdict"]>,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  STRONG: { label: "Rất phù hợp", variant: "success" },
  GOOD: { label: "Phù hợp", variant: "success" },
  MODERATE: { label: "Phù hợp vừa", variant: "warning" },
  WEAK: { label: "Ít phù hợp", variant: "warning" },
  POOR: { label: "Không phù hợp", variant: "danger" },
};
