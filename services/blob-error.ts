import { AxiosError } from "axios";

/**
 * Đổi một lỗi có thân là Blob thành lỗi mà `apiErrorMessage` đọc được.
 *
 * Khi request dùng `responseType: "blob"`, axios trả **cả thân lỗi** dưới dạng Blob,
 * nên `error.response.data.message` là `undefined` và giao diện hiện câu mặc định
 * thay vì câu backend đã soạn ("Quá thời gian khi tạo PDF...", "Máy chủ chưa có bộ
 * công cụ LaTeX..."). Đọc Blob ra chữ rồi gắn lại `data` đã parse để phần còn lại
 * của giao diện không phải biết gì về chuyện này.
 */
export async function blobErrorToError(error: unknown): Promise<unknown> {
  if (!(error instanceof AxiosError)) return error;

  const data: unknown = error.response?.data;
  if (!(data instanceof Blob)) return error;

  try {
    const text = await data.text();
    if (error.response) error.response.data = JSON.parse(text);
  } catch {
    // Thân lỗi không phải JSON: để nguyên, `apiErrorMessage` sẽ dùng câu mặc định.
  }
  return error;
}

/**
 * Đổi một lỗi có thân là CHỮ THÔ thành lỗi mà `apiErrorMessage` đọc được.
 *
 * Cùng một cái bẫy với `blobErrorToError`, chỉ khác `responseType`: request dùng
 * `"text"` (xem trước CV) thì axios KHÔNG parse thân lỗi, nên `data.message` là
 * `undefined` và giao diện hiện câu mặc định thay vì câu backend đã soạn - người
 * dùng thấy "Không tải được bản xem trước" mà không biết trường nào sai.
 */
export function textErrorToError(error: unknown): unknown {
  if (!(error instanceof AxiosError)) return error;

  const data: unknown = error.response?.data;
  if (typeof data !== "string") return error;

  try {
    if (error.response) error.response.data = JSON.parse(data);
  } catch {
    // Thân lỗi không phải JSON: để nguyên, `apiErrorMessage` dùng câu mặc định.
  }
  return error;
}
