import { describe, expect, it } from "vitest";
import { buildTranscript, pendingTurn } from "@/lib/interview-transcript";
import type { AgentRunRecord, AgentStep } from "@/services";

let nextIndex = 0;

function step(partial: Partial<AgentStep>): AgentStep {
  return {
    id: `step_${nextIndex}`,
    index: nextIndex++,
    text: "",
    toolCalls: [],
    toolResults: [],
    durationMs: 1000,
    createdAt: "2026-08-21T09:00:00.000Z",
    ...partial,
  };
}

function ask(question: string, answer?: string): AgentStep {
  return step({
    toolCalls: [{ tool: "ask_user", input: { question } }],
    toolResults: [
      { tool: "ask_user", output: answer ? { asked: question, answer } : { asked: question } },
    ],
  });
}

function run(steps: AgentStep[], partial: Partial<AgentRunRecord> = {}): AgentRunRecord {
  nextIndex = 0;
  return {
    id: "run_1",
    workflow: "interview",
    jobId: "job_1",
    status: "WAITING_USER",
    input: {},
    result: null,
    question: null,
    answer: null,
    modelId: "mimo-v2.5-free",
    error: null,
    createdAt: "2026-08-21T09:00:00.000Z",
    finishedAt: null,
    steps,
    ...partial,
  };
}

/**
 * Việc ghép này dựa trên một quy luật ĐO ĐƯỢC ở lượt chạy thật: agent viết nhận
 * xét cho câu vừa rồi và hỏi câu tiếp theo trong CÙNG một bước. Ghép sai một
 * nhịp thì nhận xét về câu 1 hiện dưới câu 2 — người dùng đọc lại buổi luyện và
 * thấy lời khuyên không ăn nhập với điều họ vừa nói.
 */
describe("buildTranscript", () => {
  it("gán văn bản của một bước làm nhận xét cho lượt TRƯỚC nó", () => {
    const transcript = buildTranscript(
      run([
        ask("Giới thiệu bản thân?", "Em là backend developer 4 năm."),
        step({
          text: "Nhận xét: cấu trúc ổn nhưng thiếu số liệu.",
          toolCalls: [{ tool: "ask_user", input: { question: "API phức tạp nhất?" } }],
          toolResults: [{ tool: "ask_user", output: { asked: "API phức tạp nhất?" } }],
        }),
      ]),
    );

    expect(transcript.turns).toHaveLength(2);
    expect(transcript.turns[0].feedback).toContain("thiếu số liệu");
    expect(transcript.turns[1].feedback).toBeNull();
  });

  it("đọc câu trả lời từ toolResults của chính bước đã hỏi", () => {
    const transcript = buildTranscript(
      run([ask("Giới thiệu bản thân?", "Em là backend developer 4 năm.")]),
    );

    expect(transcript.turns[0].answer).toBe("Em là backend developer 4 năm.");
  });

  /* Bước đọc hồ sơ, đọc khung đặc tả, lưu bộ đề — không phải phần buổi phỏng vấn. */
  it("bỏ qua các bước không hỏi gì", () => {
    const transcript = buildTranscript(
      run([
        step({ toolCalls: [{ tool: "read_profile", input: {} }] }),
        step({ toolCalls: [{ tool: "save_artifact", input: { name: "prep.md" } }] }),
        ask("Giới thiệu bản thân?"),
      ]),
    );

    expect(transcript.turns).toHaveLength(1);
    expect(transcript.turns[0].index).toBe(1);
  });

  it("gom văn bản trước câu hỏi đầu tiên thành lời dẫn", () => {
    const transcript = buildTranscript(
      run([step({ text: "Đã đọc hồ sơ, bắt đầu nhé." }), ask("Giới thiệu bản thân?")]),
    );

    expect(transcript.intro).toBe("Đã đọc hồ sơ, bắt đầu nhé.");
    expect(transcript.turns[0].feedback).toBeNull();
  });

  /*
   * `result.text` lặp lại đúng đoạn đã gán làm nhận xét khi lượt chạy dừng ở
   * `ask_user`. Lấy nó lúc chưa DONE là hiện hai lần cùng một câu.
   */
  it("chỉ lấy tổng kết khi lượt chạy đã xong", () => {
    const steps = [ask("Giới thiệu bản thân?", "Em là backend developer.")];

    expect(
      buildTranscript(run(steps, { result: { text: "Nhận xét cuối" } })).closing,
    ).toBeNull();

    expect(
      buildTranscript(
        run(steps, { status: "DONE", result: { text: "Nhận xét cuối" } }),
      ).closing,
    ).toBe("Nhận xét cuối");
  });

  it("không vỡ khi lượt chạy chưa có bước nào", () => {
    const transcript = buildTranscript(run([], { status: "RUNNING" }));

    expect(transcript.turns).toHaveLength(0);
    expect(transcript.intro).toBeNull();
  });
});

describe("pendingTurn", () => {
  it("chỉ ra lượt cuối khi nó chưa được trả lời", () => {
    const transcript = buildTranscript(
      run([ask("Câu 1", "Trả lời 1"), ask("Câu 2")]),
    );

    expect(pendingTurn(transcript)?.index).toBe(2);
  });

  it("trả về null khi mọi lượt đều đã trả lời", () => {
    const transcript = buildTranscript(run([ask("Câu 1", "Trả lời 1")]));

    expect(pendingTurn(transcript)).toBeNull();
  });
});
