import type { AiFailureKind } from "@/lib/failure-message";
import { api } from "@/lib/axios";
import type { Paginated, QueuedResult, WorkStatus } from "./types";

export interface InterviewPrepRecord {
  id: string;
  jobId: string;
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
  };
  status: WorkStatus;
  starAnswers: unknown;
  toughQuestions: unknown;
  questionsToAsk: string[];
  talkingPoints: string[];
  likelyProbes: string[];
  modelId: string | null;
  generatedAt: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
  updatedAt: string;
}

export const interviewService = {
  list: (page?: { limit?: number; offset?: number }) =>
    api
      .get<Paginated<InterviewPrepRecord>>("/interview", { params: page })
      .then((r) => r.data),

  get: (jobId: string) =>
    api.get<InterviewPrepRecord>(`/interview/${jobId}`).then((r) => r.data),

  prep: (jobId: string, force = false) =>
    api
      .post<QueuedResult>("/interview/prep", { jobId, force })
      .then((r) => r.data),

  prepSync: (jobId: string, force = false) =>
    api
      .post<InterviewPrepRecord>("/interview/prep-sync", { jobId, force })
      .then((r) => r.data),
};
