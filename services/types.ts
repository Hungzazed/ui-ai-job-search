import type { AuthUser } from "@/types";

export interface AuthResult {
  accessToken: string;
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
