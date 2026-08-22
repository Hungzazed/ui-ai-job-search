import type { AuthUser } from "@/types";
import { api } from "@/lib/axios";
import type { AuthResult } from "./types";

/**
 * Đăng nhập và đăng ký vừa trả token trong body vừa khiến backend đặt cookie
 * httpOnly. Giao diện web KHÔNG dùng tới `accessToken` — nó đi cùng để script
 * và ứng dụng di động sau này có đường Bearer. Đừng lưu token vào localStorage:
 * làm vậy là vứt bỏ toàn bộ lợi ích của httpOnly.
 */
export const authService = {
  login: (email: string, password: string) =>
    api
      .post<AuthResult>("/auth/login", { email, password })
      .then((r) => r.data),

  register: (email: string, password: string, name: string) =>
    api
      .post<AuthResult>("/auth/register", { email, password, name })
      .then((r) => r.data),

  logout: () => api.post<{ ok: true }>("/auth/logout").then((r) => r.data),

  /**
   * Kết thúc phiên trên MỌI thiết bị, không chỉ trình duyệt đang dùng.
   *
   * Khác `logout` ở chỗ nó chạm vào server: `logout` chỉ xoá cookie tại chỗ,
   * còn route này tăng `tokenVersion` nên mọi token đã phát chết ngay.
   */
  logoutAll: () =>
    api.post<{ ok: true }>("/auth/logout-all").then((r) => r.data),

  /**
   * Đổi refresh token lấy access token mới. Giao diện gần như không gọi trực
   * tiếp - `lib/axios.ts` tự gọi khi gặp 401. Refresh token đi trong cookie
   * httpOnly nên KHÔNG có tham số nào ở đây, và cũng không được có.
   */
  refresh: () => api.post<AuthResult>("/auth/refresh").then((r) => r.data),

  /** Vai trò được đọc tươi từ database mỗi lần gọi, không nằm trong token. */
  me: () => api.get<AuthUser>("/auth/me").then((r) => r.data),
};
