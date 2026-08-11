import type { AiFailureKind } from "@/services";

/** Backend chặn `days` trong khoảng 1–90; ba mốc này đủ để tách nhiễu tức thời khỏi xu hướng. */
export const RANGE_TABS = [
  { value: "1", label: "24 giờ" },
  { value: "7", label: "7 ngày" },
  { value: "30", label: "30 ngày" },
];

/** Trần của backend là 100. Lấy 20 vì bảng này để soi lỗi gần nhất, không phải để tra cứu lịch sử. */
export const FAILURE_LIMIT = 20;

export interface FailureKindMeta {
  kind: AiFailureKind;
  label: string;
  meaning: string;
  action: string;
  variant: "warning" | "danger" | "info" | "neutral";
  accent: string;
}

/**
 * Bốn loại hỏng KHÔNG được gộp thành một con số "lỗi".
 *
 * `SCHEMA` nói rằng model không đủ sức cho tác vụ; `UPSTREAM` nói rằng gateway
 * đang hỏng. Cộng chúng lại thì người trực nhìn thấy "12 lỗi" và không biết
 * phải đổi model hay đổi nhà cung cấp — hai hành động ngược nhau.
 */
export const FAILURE_KINDS: FailureKindMeta[] = [
  {
    kind: "SCHEMA",
    label: "SCHEMA",
    meaning: "Model trả về dữ liệu không khớp schema — nó quá yếu cho tác vụ.",
    action: "Siết schema, viết lại mô tả trường, hoặc đổi sang model mạnh hơn.",
    variant: "warning",
    accent: "text-amber-600",
  },
  {
    kind: "TIMEOUT",
    label: "TIMEOUT",
    meaning: "Lời gọi vượt hạn 90 giây và bị huỷ.",
    action: "Gateway đang có vấn đề — kiểm tra tình trạng nhà cung cấp.",
    variant: "danger",
    accent: "text-rose-600",
  },
  {
    kind: "UPSTREAM",
    label: "UPSTREAM",
    meaning: "Gateway trả về lỗi (429 quá tải, hoặc 5xx).",
    action: "Đổi nhà cung cấp hoặc giảm tải cho gateway hiện tại.",
    variant: "info",
    accent: "text-sky-600",
  },
  {
    kind: "OTHER",
    label: "OTHER",
    meaning: "Những nguyên nhân còn lại chưa phân loại được.",
    action: "Đọc thông báo lỗi trong bảng bên dưới để biết thêm.",
    variant: "neutral",
    accent: "text-slate-600",
  },
];

/**
 * `purpose` do backend ghi thẳng dưới dạng khoá kỹ thuật (`match.evaluate`).
 * Bản đồ này chỉ để dễ đọc — khoá lạ vẫn hiện nguyên văn chứ không bị nuốt.
 */
export const PURPOSE_LABELS: Record<string, string> = {
  "match.evaluate": "Chấm điểm phù hợp",
  "document.cv": "Tối ưu CV",
  "document.coverLetter": "Viết cover letter",
  "document.formAnswer": "Trả lời câu hỏi ứng tuyển",
  "interview.prep": "Chuẩn bị phỏng vấn",
  "upskill.report": "Báo cáo nâng cấp kỹ năng",
  "scrape.plan": "Lập kế hoạch thu thập tin",
};

/** Khoá lạ hiện nguyên văn thay vì bị nuốt thành ô trống. */
export const purposeLabel = (purpose: string): string =>
  PURPOSE_LABELS[purpose] ?? purpose;
