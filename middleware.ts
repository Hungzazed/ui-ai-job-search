import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "aijob_token";

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
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (token) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  // Nhớ nơi người dùng định vào để đăng nhập xong quay lại đúng chỗ đó.
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
