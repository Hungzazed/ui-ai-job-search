/**
 * Bộ đọc phòng thủ cho JSON do model sinh ra.
 *
 * Backend khai những khối này là `unknown` và đó không phải sự lười biếng: nội
 * dung đi qua một lượt sinh của model rồi mới được ghi xuống, nên không có gì
 * bảo đảm nó đủ trường hay đúng kiểu. Một lần chạy hỏng nửa chừng vẫn có thể để
 * lại mảng thành chuỗi, hoặc thiếu hẳn một khối.
 *
 * Nguyên tắc chung cho mọi hàm ở đây: **không bao giờ ném lỗi, không bao giờ ép
 * kiểu**. Dữ liệu hỏng thì mất đúng phần hỏng đó — giao diện thiếu một mục còn
 * hơn cả trang trắng vì `undefined.map`.
 *
 * Tách khỏi `document-content.ts` khi parser thứ hai (`interview-content.ts`)
 * cần đúng bộ này. Chép lần thứ hai đã là thừa, lần thứ ba thì chắc chắn sẽ có
 * một bản trôi khác các bản kia.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Chuỗi rỗng coi như thiếu: in một dòng trống chỉ làm rối bố cục. */
export function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(text).filter((item): item is string => item !== null);
}

export function objectList<T>(
  value: unknown,
  parse: (item: unknown) => T | null,
): T[] {
  if (!Array.isArray(value)) return [];
  return value.map(parse).filter((item): item is T => item !== null);
}

/**
 * Số nguyên trong khoảng cho trước, ngoài khoảng thì coi như thiếu.
 *
 * Model rất hay trả điểm sai thang — chuyện đã gặp thật ở phía backend: nó chấm
 * theo thang 0-5 rồi trả 4 trong khi schema đòi 0-100. Ở đây chặn lại thay vì để
 * một thanh tiến trình 4% trông như dữ liệu thật.
 */
export function boundedInt(
  value: unknown,
  min: number,
  max: number,
): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  return value >= min && value <= max ? value : null;
}
