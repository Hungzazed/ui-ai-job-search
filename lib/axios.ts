import axios, { AxiosError } from "axios";

export const AUTH_COOKIE = "aijob_token";

/**
 * Client gọi thẳng backend NestJS từ trình duyệt.
 *
 * `withCredentials: true` bảo trình duyệt gửi kèm cookie httpOnly mà backend
 * đặt lúc đăng nhập. Không có nó thì cookie tồn tại nhưng không bao giờ được
 * đính vào request, và mọi lời gọi đều nhận 401 — một lỗi đặc biệt khó đoán vì
 * tab Application của DevTools vẫn thấy cookie nằm đó.
 *
 * Phía backend phải có `credentials: true` trong CORS và `origin` là một địa
 * chỉ cụ thể, không được là '*'. Đã cấu hình ở server/src/main.ts.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * Rút thông báo lỗi mà backend gửi kèm.
 *
 * NestJS trả `message` là chuỗi, hoặc MẢNG chuỗi khi ValidationPipe bắt nhiều
 * trường sai cùng lúc. Không xử lý cả hai dạng thì màn hình hiện
 * "[object Object]" đúng vào lúc người dùng cần biết mình nhập sai chỗ nào.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
    // Không có response nghĩa là request còn chưa tới được máy chủ.
    if (!error.response) return "Không kết nối được tới máy chủ";
  }
  return fallback;
}

/** Trạng thái HTTP, để giao diện phân biệt "sai mật khẩu" với "máy chủ hỏng". */
export const apiErrorStatus = (error: unknown): number | undefined =>
  error instanceof AxiosError ? error.response?.status : undefined;
