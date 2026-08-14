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

/**
 * Những bước tiếp theo hay gặp từ mỗi trạng thái.
 *
 * ĐÂY KHÔNG PHẢI MÁY TRẠNG THÁI, và cũng không phải nguồn thẩm quyền. Backend
 * cố ý cho đổi trạng thái khá tự do vì đời thật lộn xộn — nhà tuyển dụng gọi lại
 * sau khi đã từ chối, ứng viên rút rồi quay lại — và nó chỉ chặn đúng ba thứ
 * thật sự sai (xem `transitions.ts` phía máy chủ). Bảng này chỉ rút gọn 10 lựa
 * chọn xuống còn vài cái đáng bấm, để người dùng không phải đọc cả danh sách.
 *
 * Hệ quả cần nhớ: **một lựa chọn có trong bảng vẫn có thể bị máy chủ từ chối.**
 * Rõ nhất là `HIRED` và `OFFER_DECLINED` — máy chủ đòi đơn phải TỪNG ở `OFFER`,
 * mà dữ liệu client không có nhật ký sự kiện nên không tự biết điều đó. Giao diện
 * hiện nguyên văn lý do máy chủ trả về thay vì đoán trước.
 *
 * Mỗi trạng thái kết thúc đều có ít nhất một đường quay lại: đánh dấu nhầm là
 * chuyện thường, và một giao diện không cho sửa sẽ đẩy người dùng sang việc tự
 * tạo đơn mới cho cùng một công việc — thứ mà ràng buộc trùng đơn sẽ chặn.
 */
export const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  RANKED: ["APPLIED", "WITHDRAWN", "EXPIRED"],
  APPLIED: ["INTERVIEW", "REJECTED", "NO_RESPONSE", "WITHDRAWN"],
  INTERVIEW: ["OFFER", "REJECTED", "NO_RESPONSE", "WITHDRAWN"],
  // Thêm một vòng phỏng vấn sau khi đã có offer là chuyện có thật, nên giữ
  // INTERVIEW ở đây.
  OFFER: ["HIRED", "OFFER_DECLINED", "INTERVIEW", "REJECTED"],
  HIRED: ["OFFER"],
  REJECTED: ["INTERVIEW", "APPLIED"],
  NO_RESPONSE: ["INTERVIEW", "APPLIED"],
  OFFER_DECLINED: ["OFFER"],
  WITHDRAWN: ["APPLIED"],
  EXPIRED: ["APPLIED"],
};
