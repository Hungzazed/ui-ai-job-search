import type { AuthUser } from "@/types";

/**
 * Kiểu cho những phản hồi mà backend trả về nhưng chưa cần dựng model đầy đủ
 * ở `types/index.ts`. Khi màn hình tương ứng được nối thật thì chuyển sang đó.
 */

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

/**
 * Đường GHI của backend không trả kết quả mà trả biên nhận: công việc đã được
 * xếp hàng, worker chạy ở nền. Giao diện phải hiểu điều này — gọi xong KHÔNG
 * có nghĩa là đã có dữ liệu, phải đọc lại bằng đường ĐỌC.
 */
export interface QueuedResult {
  queued: true;
  queueJobId?: string | null;
}

export interface QueuedDocument extends QueuedResult {
  documentId: string;
}

export interface QueuedReport extends QueuedResult {
  reportId: string;
  mode: "AGGREGATE" | "TARGETED";
}

export interface QueuedScrapeRun extends QueuedResult {
  runId: string;
  portal: string;
}

/** Trạng thái chung của các bản ghi do worker sinh ra. */
export type WorkStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
