/**
 * Đọc hai khối JSON của `InterviewPrepRecord` do model sinh ra.
 *
 * Cùng nguyên tắc như `document-content.ts`: không ép kiểu, kiểm từng trường,
 * hỏng phần nào mất phần đó. Các hàm đọc cơ bản nằm ở `parse-json.ts`.
 */

import { isRecord, objectList, text } from "./parse-json";
import type { InterviewPrepRecord } from "@/services";

/** Một câu chuyện theo khung STAR: Situation - Task - Action - Result. */
export interface StarAnswer {
  competency: string | null;
  question: string | null;
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
}

export interface ToughQuestion {
  /**
   * KHÔNG nullable, khác các trường còn lại: `parseToughQuestion` loại thẳng khối
   * thiếu câu hỏi, nên kiểu ở đây nói đúng thứ parser bảo đảm. Để `string | null`
   * là bắt mọi nơi dùng phải kiểm lại một điều đã chắc chắn.
   */
  question: string;
  why: string | null;
  suggestedAnswer: string | null;
}

function parseStarAnswer(value: unknown): StarAnswer | null {
  if (!isRecord(value)) return null;
  const answer: StarAnswer = {
    competency: text(value.competency),
    question: text(value.question),
    situation: text(value.situation),
    task: text(value.task),
    action: text(value.action),
    result: text(value.result),
  };
  // Không có cả câu hỏi lẫn tên năng lực thì khối này không có tiêu đề để hiện,
  // và bốn phần STAR bên dưới trở thành mấy đoạn văn không rõ trả lời cho cái gì.
  return answer.question || answer.competency ? answer : null;
}

function parseToughQuestion(value: unknown): ToughQuestion | null {
  if (!isRecord(value)) return null;
  const question = text(value.question);
  // Khác STAR: ở đây thiếu câu hỏi là mất tất cả. Một "hướng trả lời" không gắn
  // với câu hỏi nào thì người đọc không biết nó trả lời cho điều gì.
  if (!question) return null;
  return {
    question,
    why: text(value.why),
    suggestedAnswer: text(value.suggestedAnswer),
  };
}

export function parseStarAnswers(value: unknown): StarAnswer[] {
  return objectList(value, parseStarAnswer);
}

export function parseToughQuestions(value: unknown): ToughQuestion[] {
  return objectList(value, parseToughQuestion);
}

/**
 * Bộ câu hỏi đã đọc được từ một bản ghi.
 *
 * Gom một chỗ vì hai khối JSON tách rời nhưng người dùng chỉ thấy "những câu tôi
 * sẽ bị hỏi". Đây cũng là ĐIỂM GẮN cho chế độ luyện tập sau này (người dùng nói,
 * chuyển thành chữ, AI chấm rồi đọc lại): chế độ đó cần đúng danh sách này, không
 * cần biết nó đến từ `starAnswers` hay `toughQuestions`.
 */
export function interviewQuestions(prep: InterviewPrepRecord): string[] {
  const fromStar = parseStarAnswers(prep.starAnswers)
    .map((answer) => answer.question)
    .filter((question): question is string => question !== null);
  const fromTough = parseToughQuestions(prep.toughQuestions).map(
    (item) => item.question,
  );

  // Bỏ trùng: cùng một câu có thể xuất hiện ở cả hai khối khi model thấy nó vừa
  // là câu hành vi vừa là câu khó.
  return [...new Set([...fromStar, ...fromTough])];
}

/**
 * Bản ghi đã DONE nhưng không đọc được gì dùng được.
 *
 * Khác hẳn "đang soạn": phải nói thẳng thay vì hiện một trang trống, vì người
 * dùng không có cách nào phân biệt hai trạng thái đó nếu cả hai đều trống.
 */
export function isInterviewPrepEmpty(prep: InterviewPrepRecord): boolean {
  return (
    parseStarAnswers(prep.starAnswers).length === 0 &&
    parseToughQuestions(prep.toughQuestions).length === 0 &&
    prep.questionsToAsk.length === 0 &&
    prep.talkingPoints.length === 0 &&
    prep.likelyProbes.length === 0
  );
}
