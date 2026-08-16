import type { JobMatchWithJob } from "@/types";
import { api } from "@/lib/axios";
import type { Paginated, QueuedResult, WorkStatus } from "./types";

export interface JobMatchState {
  status: WorkStatus;
  overallScore: number | null;
  verdict: JobMatchWithJob["verdict"];
}

/** Tin tuyển dụng kèm trạng thái chấm điểm, KHÔNG kèm kết quả chi tiết. */
export type JobRecord = JobMatchWithJob["job"] & {
  source: string;
  workMode: string | null;
  description: string;
  match: JobMatchState | null;
};

export interface CreateJobInput {
  title: string;
  company: string;
  /** Backend từ chối mô tả dưới 20 ký tự: quá ngắn để chấm điểm. */
  description: string;
  url?: string;
  source?: string;
  externalId?: string;
  companyLogo?: string;
  location?: string;
  workMode?: string;
  salaryRaw?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  tags?: string[];
}

export const jobsService = {
  list: (params?: { limit?: number; offset?: number; q?: string }) =>
    api.get<Paginated<JobRecord>>("/jobs", { params }).then((r) => r.data),

  listSaved: () => api.get<JobRecord[]>("/jobs/saved").then((r) => r.data),

  get: (id: string) => api.get<JobRecord>(`/jobs/${id}`).then((r) => r.data),

  save: (id: string) =>
    api.post<{ saved: true }>(`/jobs/${id}/save`).then((r) => r.data),

  unsave: (id: string) =>
    api.delete<{ saved: false }>(`/jobs/${id}/save`).then((r) => r.data),

  create: (input: CreateJobInput) =>
    api
      .post<{ job: JobRecord } & QueuedResult>("/jobs", input)
      .then((r) => r.data),
};
