/* =========================================================
   Đơn ứng tuyển
   ========================================================= */

/**
 * Vòng đời đơn ứng tuyển, lấy nguyên bộ từ vựng của framework
 * (`.claude/commands/outcome.md`) chứ không tự nghĩ ra bộ riêng. Backend dùng
 * đúng mười giá trị này ở enum `ApplicationStatus` trong schema.prisma.
 *
 * Hai trạng thái `HIRED` và `OFFER_DECLINED` chỉ người dùng mới đặt được:
 * nhận việc hay từ chối offer là quyết định ngoài đời, backend từ chối mọi
 * nguồn tự động cố đặt chúng.
 */
export type ApplicationStatus =
  | "RANKED"
  | "APPLIED"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "NO_RESPONSE"
  | "OFFER_DECLINED"
  | "WITHDRAWN"
  | "EXPIRED";

/**
 * Nhóm hiển thị cho các tab trên màn hình Lịch sử ứng tuyển. Sáu trạng thái
 * đã đóng gộp về "closed" — người dùng không cần sáu tab để xem những đơn đã
 * hết chuyện. Backend nhận đúng những khoá này ở tham số `?group=`.
 */
export type ApplicationGroup = "open" | "interview" | "offer" | "closed";

export interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  /** null khi đơn còn ở RANKED — đã quyết định nộp nhưng chưa nộp. */
  appliedAt: string | null;
  /** Chỉ có giá trị khi đơn đã chuyển sang một trạng thái kết thúc. */
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
    location: string | null;
    salaryRaw: string | null;
    url: string;
  };
}

/**
 * `counts` được backend đếm trên TOÀN BỘ đơn rồi mới lọc, nên các tab luôn
 * hiện tổng thật chứ không phải số sau khi đã lọc theo chính tab đang mở.
 */
export interface ApplicationList {
  items: Application[];
  counts: Record<"all" | ApplicationGroup, number>;
}
