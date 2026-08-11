import { api } from "@/lib/axios";
import type { QueuedResult, WorkStatus } from "./types";

export interface InterviewPrepRecord {
  id: string;
  jobId: string;
  status: WorkStatus;
  /** Câu trả lời theo cấu trúc STAR (Situation - Task - Action - Result). */
  starAnswers: unknown;
  /** Câu hỏi khó kèm gợi ý, gồm cả câu về khoảng trống trong hồ sơ. */
  toughQuestions: unknown;
  questionsToAsk: string[];
  talkingPoints: string[];
  /** Điểm yếu nhà tuyển dụng nhiều khả năng sẽ đào vào. */
  likelyProbes: string[];
  modelId: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export const interviewService = {
  list: () => api.get<InterviewPrepRecord[]>("/interview").then((r) => r.data),

  /** Tra theo jobId, KHÔNG phải theo id bản ghi. */
  get: (jobId: string) =>
    api.get<InterviewPrepRecord>(`/interview/${jobId}`).then((r) => r.data),

  /**
   * Đường GHI. Tạo đơn ứng tuyển rồi chuyển sang trạng thái INTERVIEW cũng tự
   * gọi cái này, nên thường không phải gọi tay.
   */
  prep: (jobId: string, force = false) =>
    api
      .post<QueuedResult>("/interview/prep", { jobId, force })
      .then((r) => r.data),

  /** Chạy ngay, mất vài chục giây. Dùng để thử nghiệm. */
  prepSync: (jobId: string, force = false) =>
    api
      .post<InterviewPrepRecord>("/interview/prep-sync", { jobId, force })
      .then((r) => r.data),
};
