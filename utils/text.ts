/** Mảng -> chuỗi để đổ vào một ô nhập, ví dụ ["React","Vue"] -> "React, Vue". */
export const joinList = (values: string[]): string => values.join(", ");

/** Bỏ khoảng trắng thừa và phần tử rỗng, để "React, , TypeScript," không sinh ô trống. */
export const parseList = (input: string): string[] =>
  input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

/** Khối JSON -> văn bản có thụt lề; null/undefined thành ô trống. */
export const toJsonText = (value: unknown): string =>
  value === null || value === undefined ? "" : JSON.stringify(value, null, 2);

/** Kiểm tra nhanh để báo lỗi ngay lúc gõ, không đợi tới lúc bấm Lưu. */
export function isJsonText(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}
