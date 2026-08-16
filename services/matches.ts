import type { JobMatchWithJob } from "@/types";
import { api } from "@/lib/axios";
import type { Paginated, QueuedResult } from "./types";

export type EvaluateResult =
  | (QueuedResult & { alreadyScored: false })
  | {
      queued: false;
      alreadyScored: true;
      overallScore: number | null;
      verdict: JobMatchWithJob["verdict"];
    };

export const matchesService = {
  list: (params?: { limit?: number; offset?: number }) =>
    api
      .get<Paginated<JobMatchWithJob>>("/matches", { params })
      .then((r) => r.data),

  get: (jobId: string) =>
    api.get<JobMatchWithJob>(`/matches/${jobId}`).then((r) => r.data),

  evaluate: (jobId: string, force = false) =>
    api
      .post<EvaluateResult>("/matches/evaluate", { jobId, force })
      .then((r) => r.data),

  evaluateSync: (jobId: string, force = false) =>
    api
      .post<JobMatchWithJob>("/matches/evaluate-sync", { jobId, force })
      .then((r) => r.data),
};
