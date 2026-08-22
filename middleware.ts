import { NextResponse, type NextRequest } from "next/server";

/**
 * Cookie "còn phiên hay không" — KHÔNG httpOnly, giá trị luôn là '1'.
 *
 * Cố ý KHÔNG đọc `aijob_token` ở đây: access token chỉ sống 15 phút, nên lấy
 * nó làm dấu hiệu "đã đăng nhập" thì người dùng hợp lệ bị đá về /login mỗi 15
 * phút dù refresh token còn nguyên 7 ngày. Mà `aijob_refresh` thì cũng không
 * dùng được: nó bị giới hạn `path=/api/auth/refresh` nên trình duyệt không
 * đính kèm khi request một trang của frontend.
 */
const SESSION_HINT_COOKIE = "aijob_session";

/**
 * Chặn /dashboard và /admin khi chưa đăng nhập.
 *
 * Đây CHỈ là chặn ở tầng điều hướng, không phải tầng bảo mật: middleware chỉ
 * nhìn xem cookie có tồn tại hay không, nó không xác thực chữ ký JWT. Người
 * bảo vệ dữ liệu thật vẫn là JwtAuthGuard ở backend — một cookie giả sẽ qua
 * được cửa này nhưng nhận 401 ở mọi lời gọi API.
 *
 * Cố ý không xác thực chữ ký ở đây: làm vậy phải nhét JWT_SECRET vào tiến
 * trình frontend, tức là nhân đôi số nơi giữ bí mật để đổi lấy một lần
 * chuyển hướng sớm hơn.
 */
export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_HINT_COOKIE)?.value;
  if (session) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  // Nhớ nơi người dùng định vào để đăng nhập xong quay lại đúng chỗ đó.
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
