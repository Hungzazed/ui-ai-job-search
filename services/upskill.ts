import type { AiFailureKind } from "@/lib/failure-message";
import { api } from "@/lib/axios";
import type { Paginated, QueuedReport, WorkStatus } from "./types";

export interface UpskillReportRecord {
  id: string;
  mode: "AGGREGATE" | "TARGETED";
  jobId: string | null;
  status: WorkStatus;
  jobsAnalysed: number;
  hardGaps: unknown;
  synthesisedGaps: unknown;
  learningPlan: unknown;
  summary: string | null;
  modelId: string | null;
  generatedAt: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
}

export const upskillService = {
  latest: () => api.get<UpskillReportRecord>("/upskill").then((r) => r.data),

  history: (page?: { limit?: number; offset?: number }) =>
    api
      .get<Paginated<UpskillReportRecord>>("/upskill/history", { params: page })
      .then((r) => r.data),

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
