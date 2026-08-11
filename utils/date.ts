/** Ngày tháng năm dạng ngắn, ví dụ "09/08/2026". */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Ngày kèm giờ phút, KHÔNG kèm năm.
 *
 * Dùng cho bảng nhật ký lỗi: các bản ghi ở đó đều là chuyện vừa xảy ra, năm
 * chỉ chiếm chỗ mà không thêm thông tin, còn giờ phút mới là thứ giúp nối một
 * lần hỏng với một lần triển khai.
 */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * "3 ngày trước", "Hôm nay"... từ một mốc ISO. Mịn nhất là NGÀY.
 *
 * Dùng cho ngày đăng tuyển, và độ thô là cố ý: portal chỉ nói tới ngày
 * ("4 days ago", "2025-07-21"). Hiện "14 giờ trước" cho một mốc mà nguồn chỉ
 * biết tới ngày là bịa ra độ chính xác không tồn tại.
 */
export function relativeDay(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}

/**
 * Như `relativeDay` nhưng mịn tới PHÚT trong vòng một ngày đầu.
 *
 * Chỉ dùng cho `scrapedAt` — đó là mốc do chính hệ thống ghi nên có giờ phút
 * thật. Đừng dùng cho ngày đăng: xem lý do ở `relativeDay`.
 */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < MINUTE_MS) return "vừa xong";
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)} phút trước`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)} giờ trước`;
  return relativeDay(iso);
}
