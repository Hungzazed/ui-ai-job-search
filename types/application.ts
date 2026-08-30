/* =========================================================
   Đơn ứng tuyển
   ========================================================= */

/**
 * Vòng đời đơn ứng tuyển, ba trạng thái. Backend dùng đúng ba giá trị này ở
 * enum `ApplicationStatus` trong schema.prisma.
 */
export type ApplicationStatus = "VIEWED" | "APPLIED" | "WITHDRAWN";

/**
 * Nhóm hiển thị cho các tab trên màn hình Lịch sử ứng tuyển. Backend nhận đúng
 * những khoá này ở tham số `?group=`.
 */
export type ApplicationGroup = "open" | "closed";

export interface ApplicationDocument {
  id: string;
  jobId: string | null;
  kind: "CV" | "COVER_LETTER" | "APPLICATION_EMAIL" | "FORM_ANSWER";
  title: string;
  status: string;
  templateId: string;
  generatedAt: string | null;
}

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
  documents: ApplicationDocument[];
}

/**
 * `counts` được backend đếm trên TOÀN BỘ đơn rồi mới lọc, nên các tab luôn
 * hiện tổng thật chứ không phải số sau khi đã lọc theo chính tab đang mở.
 * `total` thì ngược lại - nó đếm trên tập ĐÃ lọc, vì thanh phân trang nói về
 * đúng những đơn đang xem.
 */
export interface ApplicationList {
  items: Application[];
  total: number;
  limit: number;
  offset: number;
  counts: Record<"all" | ApplicationGroup, number>;
}
