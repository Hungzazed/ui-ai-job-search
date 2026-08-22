import type { AgentRunRecord, AgentStep } from "@/services";

/** Tên tool mà agent gọi khi nó dừng lại hỏi. Khớp `ASK_USER_TOOL` của backend. */
const ASK_USER = "ask_user";

/** Một lượt hỏi - đáp - nhận xét trong buổi luyện. */
export interface InterviewTurn {
  /** Số thứ tự lượt, bắt đầu từ 1. */
  index: number;
  question: string;
  /** `null` khi đây là câu đang chờ người dùng trả lời. */
  answer: string | null;
  /** Nhận xét của người phỏng vấn ảo cho câu trả lời này. */
  feedback: string | null;
}

export interface InterviewTranscript {
  /** Lời dẫn trước câu hỏi đầu tiên, nếu agent có viết. */
  intro: string | null;
  turns: InterviewTurn[];
  /** Tổng kết cuối buổi, chỉ có khi lượt chạy đã xong. */
  closing: string | null;
}

type AskUserOutput = { asked?: unknown; answer?: unknown };

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

/** Câu hỏi mà bước này đặt ra, hoặc `null` nếu nó không hỏi gì. */
function questionOf(step: AgentStep): string | null {
  const call = step.toolCalls?.find((entry) => entry.tool === ASK_USER);
  if (!call) return null;
  return text((call.input as { question?: unknown } | undefined)?.question);
}

/** Câu người dùng đã trả lời cho bước đó — backend ghi ngược vào `toolResults`. */
function answerOf(step: AgentStep): string | null {
  const result = step.toolResults?.find((entry) => entry.tool === ASK_USER);
  if (!result) return null;
  return text((result.output as AskUserOutput | undefined)?.answer);
}

/**
 * Dựng biên bản buổi luyện từ nhật ký các bước.
 *
 * Ghép được là nhờ một quy luật ĐO ĐƯỢC ở lượt chạy thật, không phải giả định:
 * agent viết nhận xét cho câu vừa rồi và đặt câu hỏi tiếp theo **trong cùng một
 * bước** — `step.text` là nhận xét, `toolCalls` là câu hỏi mới. Nên văn bản của
 * một bước luôn thuộc về lượt TRƯỚC nó, còn câu hỏi mở ra lượt mới.
 *
 * Các bước không hỏi gì (đọc hồ sơ, đọc khung đặc tả, lưu bộ đề) bị bỏ qua:
 * người dùng đang đọc lại buổi phỏng vấn của mình, không đọc nhật ký kỹ thuật —
 * phần đó đã có ở màn Ứng tuyển tự động.
 */
export function buildTranscript(run: AgentRunRecord): InterviewTranscript {
  const turns: InterviewTurn[] = [];
  let intro: string | null = null;

  for (const step of run.steps ?? []) {
    const said = text(step.text);
    if (said) {
      const last = turns.at(-1);
      if (last) last.feedback = last.feedback ? `${last.feedback}\n\n${said}` : said;
      else intro = intro ? `${intro}\n\n${said}` : said;
    }

    const question = questionOf(step);
    if (!question) continue;

    turns.push({
      index: turns.length + 1,
      question,
      answer: answerOf(step),
      feedback: null,
    });
  }

  /*
   * Lời kết lấy từ `result.text` chứ không từ bước cuối: khi lượt chạy dừng vì
   * `ask_user`, `result.text` chỉ lặp lại đúng đoạn đã gán làm nhận xét ở trên
   * và sẽ hiện hai lần.
   */
  const closing = run.status === "DONE" ? text(run.result?.text) : null;

  return { intro, turns, closing };
}

/** Lượt đang chờ người dùng trả lời, nếu có. */
export function pendingTurn(
  transcript: InterviewTranscript,
): InterviewTurn | null {
  const last = transcript.turns.at(-1);
  return last && last.answer === null ? last : null;
}
