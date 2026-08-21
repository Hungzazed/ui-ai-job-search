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
  _count: { steps: number };
}

/** Nguồn tin cho một lượt chạy: link tin tuyển dụng, hoặc JD dán tay. */
export type AgentRunInput = {
  workflow: string;
  note?: string;
} & ({ jobUrl: string } | { jobDescription: string });

export const agentService = {
  start: (input: AgentRunInput) =>
    api
      .post<{ queued: true; runId: string }>("/agent-runs", input)
      .then((r) => r.data),

  get: (id: string) =>
    api.get<AgentRunRecord>(`/agent-runs/${id}`).then((r) => r.data),

  list: (page?: { limit?: number; offset?: number }) =>
    api
      .get<Paginated<AgentRunSummary>>("/agent-runs", { params: page })
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
