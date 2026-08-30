import type { ApplicationGroup, ApplicationStatus } from "@/types";

/** Nhãn tiếng Việt cho ba trạng thái của backend. */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  VIEWED: "Đã xem",
  APPLIED: "Đã nộp",
  WITHDRAWN: "Đã hủy",
};

export const APPLICATION_STATUS_VARIANTS: Record<
  ApplicationStatus,
  "info" | "success" | "danger"
> = {
  VIEWED: "info",
  APPLIED: "success",
  WITHDRAWN: "danger",
};

/**
 * Ba tab, khớp với `?group=` của backend.
 *
 * "Đang mở" gộp VIEWED và APPLIED — hai trạng thái đơn còn sống; "Đã đóng" chỉ
 * có WITHDRAWN. Tab và truy vấn dùng chung một bộ từ vựng.
 */
export const APPLICATION_TABS: Array<{
  value: "all" | ApplicationGroup;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "open", label: "Đang mở" },
  { value: "closed", label: "Đã đóng" },
];

/**
 * Những bước tiếp theo từ mỗi trạng thái.
 *
 * Với ba trạng thái thì mọi đường đi đều hợp lý ngoài đời — nộp rồi hủy, hủy rồi
 * nộp lại, đánh dấu nhầm rồi sửa — nên mỗi trạng thái chào đúng hai cái còn lại.
 * Backend chỉ chặn việc đổi sang chính trạng thái đang có.
 */
export const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  VIEWED: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["WITHDRAWN", "VIEWED"],
  WITHDRAWN: ["APPLIED", "VIEWED"],
};
