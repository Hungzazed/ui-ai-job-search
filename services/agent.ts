import { api } from "@/lib/axios";
import type { Paginated } from "./types";

/**
 * Trạng thái một lượt chạy agent.
 *
 * Khác `WorkStatus` đúng một giá trị, và đó là khác biệt về bản chất:
 * `WAITING_USER` nghĩa là agent đã dừng giữa chừng để hỏi, và nó sẽ nằm im như
 * vậy cho tới khi người dùng trả lời — có thể là vài giờ sau.
 */
export type AgentRunStatus =
  | "PENDING"
  | "RUNNING"
  | "WAITING_USER"
  | "DONE"
  | "FAILED";

/** Một bước: model gọi tool nào, tool trả về gì. */
export interface AgentStep {
  id: string;
  index: number;
  text: string;
  toolCalls: Array<{ tool: string; input: unknown }>;
  toolResults: Array<{ tool: string; output: unknown }>;
  durationMs: number;
  createdAt: string;
}

/** File agent ghi ra trong lượt chạy, ví dụ `cv/main.tex`. */
export interface AgentArtifact {
  name: string;
  key: string;
  bytes: number;
}

export interface AgentRunResult {
  text?: string;
  artifacts?: AgentArtifact[];
  finishReason?: string;
}

export interface AgentRunRecord {
  id: string;
  workflow: string;
  status: AgentRunStatus;
  /** Tin tuyển dụng lượt chạy này nhắm tới, khi nó bắt đầu từ một tin đã lưu. */
  jobId: string | null;
  input: { jobUrl?: string | null; jobDescription?: string | null };
  result: AgentRunResult | null;
  /** Có giá trị khi và chỉ khi status là WAITING_USER. */
  question: string | null;
  answer: string | null;
  modelId: string | null;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
  steps: AgentStep[];
}

/** Dòng trong danh sách: không kèm `steps`, chỉ đếm. */
export interface AgentRunSummary {
  id: string;
  workflow: string;
  status: AgentRunStatus;
  question: string | null;
  modelId: string | null;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
  jobId: string | null;
  /** `null` khi tin tuyển dụng đã bị dọn đi; lượt chạy thì vẫn còn. */
  job: { title: string; company: string } | null;
  _count: { steps: number };
}

/**
 * Nguồn tin cho một lượt chạy: tin đã lưu, link, hoặc JD dán tay.
 *
 * `jobId` khác hai cái kia ở chỗ backend tự gom bối cảnh quanh nó - đơn ứng
 * tuyển, tài liệu đã soạn, điểm phù hợp - nên không cần gửi kèm mô tả.
 */
export type AgentRunInput = {
  workflow: string;
  note?: string;
} & ({ jobId: string } | { jobUrl: string } | { jobDescription: string });

/** Bộ lọc danh sách lượt chạy. Bỏ trống thì lấy mọi lượt của người dùng. */
export type AgentRunListQuery = {
  limit?: number;
  offset?: number;
  jobId?: string;
  workflow?: string;
};

export const agentService = {
  start: (input: AgentRunInput) =>
    api
      .post<{ queued: true; runId: string }>("/agent-runs", input)
      .then((r) => r.data),

  get: (id: string) =>
    api.get<AgentRunRecord>(`/agent-runs/${id}`).then((r) => r.data),

  list: (query?: AgentRunListQuery) =>
    api
      .get<Paginated<AgentRunSummary>>("/agent-runs", { params: query })
      .then((r) => r.data),

  /**
   * Chạy lại một lượt đã hỏng. Backend tự chọn đường: còn điểm khôi phục thì
   * đi tiếp từ chỗ dừng, không thì bắt đầu lại từ chính đầu vào cũ - dù đường
   * nào thì người dùng cũng không phải dán lại mô tả công việc.
   */
  retry: (id: string) =>
    api
      .post<{ queued: true; runId: string }>(`/agent-runs/${id}/retry`)
      .then((r) => r.data),

  /** Trả lời câu hỏi agent đang chờ; backend xếp nó chạy tiếp. */
  answer: (id: string, text: string) =>
    api
      .post<{ queued: true; runId: string }>(`/agent-runs/${id}/answer`, {
        text,
      })
      .then((r) => r.data),

  /** Tên các kịch bản có trong `.claude/commands/`. */
  workflows: () => api.get<string[]>("/agent-runs/workflows").then((r) => r.data),
};
