/**
 * Đọc ba khối JSON của `UpskillReportRecord` do model sinh ra.
 *
 * Cùng nguyên tắc như `document-content.ts` và `interview-content.ts`: không ép
 * kiểu, kiểm từng trường, hỏng phần nào mất phần đó.
 */

import { boundedInt, isRecord, objectList, text, textList } from "./parse-json";

/** Bốn nhãn phân loại lấy từ Step 4 của skill upskill ở backend. */
export const GAP_CATEGORIES = [
  "domain",
  "soft",
  "tooling",
  "credential",
] as const;

export type GapCategory = (typeof GAP_CATEGORIES)[number];

export const GAP_CATEGORY_LABELS: Record<GapCategory, string> = {
  domain: "Kiến thức ngành",
  soft: "Kỹ năng mềm",
  tooling: "Công cụ / quy trình",
  credential: "Chứng chỉ",
};

export interface HardGap {
  skill: string;
  /** Số tin tuyển dụng đòi hỏi kỹ năng này. null khi model không trả về. */
  demandCount: number | null;
  /** 0-100. null khi thiếu hoặc ngoài thang. */
  priority: number | null;
  evidence: string | null;
}

export interface SynthesisedGap {
  /** null khi model trả một nhãn ngoài bốn nhãn đã định. */
  category: GapCategory | null;
  gap: string;
  why: string | null;
}

export interface LearningStep {
  topic: string;
  rationale: string | null;
  /** 1-52 tuần. null khi thiếu hoặc ngoài khoảng. */
  estimatedWeeks: number | null;
  resources: string[];
}

function parseHardGap(value: unknown): HardGap | null {
  if (!isRecord(value)) return null;
  const skill = text(value.skill);
  // Không có tên kỹ năng thì cả khối không gọi được là gì.
  if (!skill) return null;
  return {
    skill,
    demandCount: boundedInt(value.demandCount, 0, Number.MAX_SAFE_INTEGER),
    // Ngoài thang 0-100 thì bỏ hẳn thay vì kẹp về biên: model chấm sai thang là
    // chuyện đã gặp thật ở backend, và một thanh 100% dựng từ số 4 còn tệ hơn
    // là không có thanh nào.
    priority: boundedInt(value.priority, 0, 100),
    evidence: text(value.evidence),
  };
}

function parseSynthesisedGap(value: unknown): SynthesisedGap | null {
  if (!isRecord(value)) return null;
  const gap = text(value.gap);
  if (!gap) return null;
  const rawCategory = text(value.category);
  return {
    category: GAP_CATEGORIES.includes(rawCategory as GapCategory)
      ? (rawCategory as GapCategory)
      : null,
    gap,
    why: text(value.why),
  };
}

function parseLearningStep(
  value: unknown,
): { step: LearningStep; order: number | null } | null {
  if (!isRecord(value)) return null;
  const topic = text(value.topic);
  if (!topic) return null;
  return {
    order: boundedInt(value.order, 1, Number.MAX_SAFE_INTEGER),
    step: {
      topic,
      rationale: text(value.rationale),
      estimatedWeeks: boundedInt(value.estimatedWeeks, 1, 52),
      resources: textList(value.resources),
    },
  };
}

/**
 * Kỹ năng thiếu, sắp theo độ ưu tiên giảm dần.
 *
 * Sắp ở đây chứ không tin thứ tự model trả về: `priority` là con số nó tự chấm,
 * còn thứ tự trong mảng thì không có gì bảo đảm. Mục thiếu `priority` xuống cuối
 * — không biết mức ưu tiên thì không thể xếp nó lên trên mục đã biết.
 */
export function parseHardGaps(value: unknown): HardGap[] {
  return objectList(value, parseHardGap).sort(
    (a, b) => (b.priority ?? -1) - (a.priority ?? -1),
  );
}

export function parseSynthesisedGaps(value: unknown): SynthesisedGap[] {
  return objectList(value, parseSynthesisedGap);
}

/**
 * Lộ trình học, sắp theo `order` của model.
 *
 * Số thứ tự hiển thị được đánh lại theo vị trí sau khi sắp, KHÔNG dùng thẳng
 * `order`: model hay để lỗ (1, 2, 4) hoặc trùng số, và một danh sách nhảy cóc
 * làm người đọc tưởng mình bị thiếu mất một bước.
 */
export function parseLearningPlan(value: unknown): LearningStep[] {
  return objectList(value, parseLearningStep)
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => {
      const left = a.order ?? Number.MAX_SAFE_INTEGER;
      const right = b.order ?? Number.MAX_SAFE_INTEGER;
      // Cùng order thì giữ nguyên thứ tự model trả về.
      return left === right ? a.index - b.index : left - right;
    })
    .map((item) => item.step);
}

/**
 * Báo cáo đã DONE nhưng không đọc được gì dùng được.
 *
 * `summary` một mình KHÔNG đủ để coi là có nội dung: một đoạn tóm tắt không kèm
 * khoảng trống nào hay bước học nào thì người dùng không làm gì được với nó.
 */
export function isUpskillReportEmpty(report: {
  hardGaps: unknown;
  synthesisedGaps: unknown;
  learningPlan: unknown;
}): boolean {
  return (
    parseHardGaps(report.hardGaps).length === 0 &&
    parseSynthesisedGaps(report.synthesisedGaps).length === 0 &&
    parseLearningPlan(report.learningPlan).length === 0
  );
}
