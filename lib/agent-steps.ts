/**
 * Đọc một bước của agent thành thứ người xem hiểu được.
 *
 * Tách khỏi component vì đây là chỗ duy nhất biết tên tool nghĩa là gì và một
 * kết quả tool trông ra sao. Component chỉ còn việc vẽ; và những quy tắc này —
 * "tool nào đọc, tool nào ghi", "lỗi thì hiện lỗi chứ không hiện JSON" — kiểm
 * được bằng test hàm thuần thay vì phải dựng cả màn hình.
 */

import { toPlainText } from "./markdown-blocks";
import { isRecord, text } from "./parse-json";
import type { AgentStep } from "@/services";

/** Nhãn tiếng Việt cho từng tool. Tên lạ thì giữ nguyên, đừng giấu đi. */
const TOOL_LABELS: Record<string, string> = {
  read_profile: "Đọc hồ sơ ứng viên",
  read_skill_reference: "Đọc khung đặc tả",
  read_template: "Đọc template LaTeX",
  fetch_url: "Tải trang web",
  web_search: "Tìm trên web",
  save_artifact: "Lưu tài liệu",
  spawn_reviewer: "Nhờ chuyên gia phản biện",
  compile_pdf: "Compile thử PDF",
  ask_user: "Hỏi người dùng",
};

export const toolLabel = (tool: string): string => TOOL_LABELS[tool] ?? tool;

/** Tool nào ĐỔI thứ gì đó, để giao diện nhấn mạnh chúng. */
export const isWritingTool = (tool: string): boolean =>
  tool === "save_artifact" || tool === "spawn_reviewer";

export interface StepSummary {
  index: number;
  /** Nhãn của các tool đã gọi; rỗng nghĩa là bước này chỉ có chữ. */
  tools: string[];
  /** Câu tóm tắt kết quả, hoặc lý do hỏng. */
  outcome: string | null;
  failed: boolean;
  /** Chữ model viết ra ở bước này, ĐÃ bỏ cú pháp Markdown để hiện một dòng. */
  preview: string | null;
  seconds: number;
}

/**
 * Rút một dòng mô tả từ kết quả của một tool.
 *
 * Ưu tiên `error` trước mọi thứ: một bước hỏng mà hiện ra như bình thường là
 * cách nhanh nhất để người đọc tin nhầm rằng agent đã làm được việc đó.
 */
function describeOutput(output: unknown): { line: string | null; failed: boolean } {
  if (!isRecord(output)) return { line: null, failed: false };

  const error = text(output.error);
  if (error) return { line: error, failed: true };

  if (output.ok === false) {
    return { line: text(output.reason) ?? "Không chạy được", failed: true };
  }

  const saved = text(output.saved);
  if (saved) return { line: `Đã lưu ${saved}`, failed: false };

  const critique = text(output.critique);
  if (critique) return { line: "Đã nhận nhận xét phản biện", failed: false };

  const asked = text(output.asked);
  if (asked) return { line: asked, failed: false };

  if (typeof output.pages === "number") {
    return { line: `PDF ${output.pages} trang`, failed: false };
  }

  const file = text(output.file) ?? text(output.path);
  if (file) return { line: `Đã đọc ${file}`, failed: false };

  if (Array.isArray(output.results)) {
    return { line: `${output.results.length} kết quả tìm kiếm`, failed: false };
  }

  return { line: null, failed: false };
}

/** Gom một bước thành đúng những gì màn hình cần vẽ. */
export function summarizeStep(step: AgentStep): StepSummary {
  const outcomes = step.toolResults.map((entry) => describeOutput(entry.output));

  return {
    index: step.index,
    tools: step.toolCalls.map((call) => toolLabel(call.tool)),
    outcome: outcomes.find((item) => item.line)?.line ?? null,
    failed: outcomes.some((item) => item.failed),
    preview: text(step.text) && toPlainText(step.text) ? toPlainText(step.text) : null,
    seconds: Math.round(step.durationMs / 1000),
  };
}
