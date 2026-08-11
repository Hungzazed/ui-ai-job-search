import type { DocumentRecord } from "@/services";
import { formatDate } from "@/utils";

/**
 * Dòng mô tả dưới tiêu đề tài liệu: sinh lúc nào, bằng model nào.
 *
 * `generatedAt` có thể trống khi worker chết trước lúc ghi xong — nói thẳng là
 * chưa rõ, đừng lấy `createdAt` thay vào: đó là lúc XẾP HÀNG chứ không phải lúc
 * model viết xong, và hai mốc này có thể cách nhau vài phút.
 */
export function documentSubtitle(record: DocumentRecord): string {
  const when = record.generatedAt
    ? `Sinh lúc ${formatDate(record.generatedAt)}`
    : "Chưa rõ thời điểm sinh";
  return record.modelId ? `${when} · ${record.modelId}` : when;
}

/** Câu báo dùng chung khi bản ghi đã DONE nhưng nội dung không đọc được. */
export const UNREADABLE_CONTENT_MESSAGE =
  "Tài liệu đã chạy xong nhưng nội dung trả về không đọc được. Bạn có thể xem mã .tex bên dưới hoặc tạo lại.";
