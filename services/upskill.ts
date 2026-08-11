import { api } from "@/lib/axios";
import type { QueuedReport, WorkStatus } from "./types";

export interface UpskillReportRecord {
  id: string;
  /** AGGREGATE: tổng hợp mọi việc đã chấm. TARGETED: phân tích một việc. */
  mode: "AGGREGATE" | "TARGETED";
  jobId: string | null;
  status: WorkStatus;
  /** Thiếu hụt kỹ năng cứng, đã tính trọng số theo điểm phù hợp. */
  hardGaps: unknown;
  softGaps: unknown;
  /** Lộ trình học theo thứ tự ưu tiên. */
  roadmap: unknown;
  modelId: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export const upskillService = {
  /** Báo cáo mới nhất đã hoàn thành — màn hình Upskill đọc cái này. */
  latest: () => api.get<UpskillReportRecord>("/upskill").then((r) => r.data),

  history: () =>
    api.get<UpskillReportRecord[]>("/upskill/history").then((r) => r.data),

  get: (id: string) =>
    api.get<UpskillReportRecord>(`/upskill/${id}`).then((r) => r.data),

  /** Có jobId thì chạy chế độ TARGETED, không có thì AGGREGATE. */
  generate: (jobId?: string) =>
    api.post<QueuedReport>("/upskill/generate", { jobId }).then((r) => r.data),

  generateSync: (jobId?: string) =>
    api
      .post<UpskillReportRecord>("/upskill/generate-sync", { jobId })
      .then((r) => r.data),
};
