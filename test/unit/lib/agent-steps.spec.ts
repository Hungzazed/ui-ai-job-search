import { describe, expect, test } from "vitest";
import { summarizeStep, toolLabel } from "@/lib/agent-steps";
import type { AgentStep } from "@/services";

const step = (overrides: Partial<AgentStep>): AgentStep => ({
  id: "s1",
  index: 0,
  text: "",
  toolCalls: [],
  toolResults: [],
  durationMs: 4200,
  createdAt: "2026-08-21T00:00:00.000Z",
  ...overrides,
});

describe("toolLabel", () => {
  test("dịch tên tool sang tiếng Việt", () => {
    expect(toolLabel("spawn_reviewer")).toBe("Nhờ chuyên gia phản biện");
  });

  /// Tool mới thêm ở backend mà quên khai nhãn thì vẫn phải hiện ra, chứ không
  /// được biến mất khỏi bảng tiến trình.
  test("tool lạ giữ nguyên tên", () => {
    expect(toolLabel("tool_moi_toanh")).toBe("tool_moi_toanh");
  });
});

describe("summarizeStep", () => {
  test("gom tool, kết quả và thời gian", () => {
    const summary = summarizeStep(
      step({
        toolCalls: [{ tool: "save_artifact", input: { name: "cv/main.tex" } }],
        toolResults: [
          { tool: "save_artifact", output: { saved: "cv/main.tex", bytes: 12 } },
        ],
      }),
    );

    expect(summary.tools).toEqual(["Lưu tài liệu"]);
    expect(summary.outcome).toBe("Đã lưu cv/main.tex");
    expect(summary.failed).toBe(false);
    expect(summary.seconds).toBe(4);
  });

  /**
   * Phép khẳng định quan trọng nhất của module: bước hỏng phải LỘ ra.
   *
   * Một tool trả `error` mà hiện như bình thường là cách nhanh nhất để người
   * đọc tin rằng agent đã làm được việc đó — trong khi nó chỉ đi tiếp.
   */
  test("tool trả lỗi thì đánh dấu hỏng và hiện đúng lý do", () => {
    const summary = summarizeStep(
      step({
        toolCalls: [{ tool: "fetch_url", input: { url: "https://x.test" } }],
        toolResults: [
          { tool: "fetch_url", output: { error: "Máy chủ trả về HTTP 404" } },
        ],
      }),
    );

    expect(summary.failed).toBe(true);
    expect(summary.outcome).toBe("Máy chủ trả về HTTP 404");
  });

  test("compile hỏng qua cờ ok=false cũng là hỏng", () => {
    const summary = summarizeStep(
      step({
        toolCalls: [{ tool: "compile_pdf", input: { name: "cv.tex" } }],
        toolResults: [
          { tool: "compile_pdf", output: { ok: false, reason: "Thiếu LaTeX" } },
        ],
      }),
    );

    expect(summary.failed).toBe(true);
    expect(summary.outcome).toBe("Thiếu LaTeX");
  });

  test("bước chỉ có chữ thì không có tool nào", () => {
    const summary = summarizeStep(step({ text: "Kết luận: nên nộp." }));

    expect(summary.tools).toEqual([]);
    expect(summary.text).toBe("Kết luận: nên nộp.");
    expect(summary.outcome).toBeNull();
  });

  /// Kết quả tool là JSON do model và tool sinh ra, nên hình dạng nào cũng có
  /// thể tới — không đầu vào nào được phép làm vỡ bảng tiến trình.
  test.each([null, "chuỗi", 42, []])(
    "kết quả kiểu %s không làm vỡ",
    (output) => {
      const summary = summarizeStep(
        step({ toolResults: [{ tool: "read_profile", output }] }),
      );

      expect(summary.outcome).toBeNull();
      expect(summary.failed).toBe(false);
    },
  );
});
