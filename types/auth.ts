/**
 * Người dùng đang đăng nhập, do `GET /api/auth/me` trả về.
 *
 * `role` được backend đọc tươi từ database mỗi request, KHÔNG nằm trong token.
 * Nghĩa là hạ quyền một tài khoản có hiệu lực ngay, không phải đợi token hết
 * hạn — nhưng cũng nghĩa là giao diện không được nhớ vai trò quá lâu.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}
