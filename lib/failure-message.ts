/**
 * Phân loại thất bại của một lượt gọi model, do backend trả về.
 *
 * Khớp `FailureKind` ở `server/src/modules/ai/failure-kind.ts`.
 */
export type AiFailureKind = "SCHEMA" | "TIMEOUT" | "UPSTREAM" | "OTHER";

/**
 * Câu để hiện cho người dùng khi một tác vụ AI thất bại.
 *
 * Trước đây giao diện in nguyên chuỗi lỗi của backend, nên màn Chuẩn bị phỏng vấn
 * hiện đúng dòng này cho người dùng cuối:
 *
 *   "Failed after 3 attempts. Last error: AI_APICallError: Error from provider
 *    (Console): Rate limit exceeded. Please try again later."
 *
 * Câu đó nói cho lập trình viên, không nói cho người dùng: không ai đọc
 * "AI_APICallError" rồi biết mình nên chờ hay nên báo lỗi. Nay backend chỉ trả
 * `failureKind`, và bảng dưới đây quyết định người dùng NÊN LÀM GÌ.
 *
 * Mỗi câu phải nêu được: chuyện gì không xong, và bước tiếp theo là gì. Bốn phân
 * loại này dẫn tới ba hành động khác nhau, nên chúng phải là bốn câu khác nhau —
 * gộp lại thành "Đã xảy ra lỗi" là ném đi đúng phần có ích.
 */
const MESSAGES: Record<AiFailureKind, string> = {
  SCHEMA:
    "Model trả về kết quả không đúng cấu trúc sau nhiều lần thử. Đây là lỗi của hệ thống, không phải do dữ liệu của bạn — hãy báo lại để được kiểm tra.",
  TIMEOUT:
    "Quá thời gian chờ khi gọi AI. Hệ thống đang chậm hơn bình thường — hãy thử lại sau vài phút.",
  UPSTREAM:
    "Nhà cung cấp AI đang từ chối yêu cầu, thường là do quá tải hoặc đã đạt giới hạn lượt gọi. Hãy thử lại sau vài phút.",
  OTHER: "Không hoàn thành được tác vụ. Hãy thử lại; nếu vẫn lỗi thì báo lại.",
};

/**
 * `kind` là null khi bản ghi FAILED mà không kèm lý do nào — hiếm, nhưng đã gặp
 * (worker bị giết giữa đường). Nói thẳng là không rõ lý do, đừng đoán.
 */
export function failureMessage(kind?: AiFailureKind | null): string {
  if (!kind) {
    return "Tác vụ thất bại nhưng hệ thống không ghi được lý do. Hãy thử lại.";
  }
  return MESSAGES[kind] ?? MESSAGES.OTHER;
}

/** Có nên mời người dùng bấm thử lại hay không. */
export function isWorthRetrying(kind?: AiFailureKind | null): boolean {
  return kind !== "SCHEMA";
}
