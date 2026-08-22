import type { AuthUser } from "@/types";

export interface AuthResult {
  accessToken: string;
  /**
   * Giao diện web KHÔNG dùng tới trường này - refresh token nằm sẵn trong
   * cookie httpOnly `aijob_refresh`. Nó đi cùng trong body cho script và ứng
   * dụng di động, những nơi không có kho cookie của trình duyệt.
   */
  refreshToken: string;
  user: AuthUser;
}

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

export type WorkStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
