import type { ApplicationGroup, ApplicationStatus } from "@/types";

/** Nhãn tiếng Việt cho mười trạng thái của backend. */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  RANKED: "Chưa nộp",
  APPLIED: "Đã nộp",
  INTERVIEW: "Phỏng vấn",
  OFFER: "Có offer",
  HIRED: "Nhận việc",
  REJECTED: "Bị từ chối",
  NO_RESPONSE: "Không hồi âm",
  OFFER_DECLINED: "Đã từ chối offer",
  WITHDRAWN: "Đã rút",
  EXPIRED: "Tin đã đóng",
};

export const APPLICATION_STATUS_VARIANTS: Record<
  ApplicationStatus,
  "info" | "warning" | "primary" | "danger" | "success"
> = {
  RANKED: "info",
  APPLIED: "info",
  INTERVIEW: "primary",
  OFFER: "warning",
  HIRED: "success",
  REJECTED: "danger",
  NO_RESPONSE: "danger",
  OFFER_DECLINED: "danger",
  WITHDRAWN: "danger",
  EXPIRED: "danger",
};

/**
 * Bốn tab, không phải mười.
 *
 * Cách gộp lấy từ `.claude/commands/html-report.md`: các trạng thái đã kết thúc
 * gộp chung thành "Đã đóng". Backend nhận đúng những khoá này ở tham số
 * `?group=`, nên tab và truy vấn dùng chung một bộ từ vựng.
 */
export const APPLICATION_TABS: Array<{
  value: "all" | ApplicationGroup;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "open", label: "Đang mở" },
  { value: "interview", label: "Phỏng vấn" },
  { value: "offer", label: "Có offer" },
  { value: "closed", label: "Đã đóng" },
];
