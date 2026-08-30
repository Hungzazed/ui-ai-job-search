import {
  Briefcase,
  ChatText,
  ClockCounterClockwise,
  CurrencyCircleDollar,
  Envelope,
  FileText,
  Gear,
  GraduationCap,
  Robot,
  Sparkle,
  SquaresFour,
  Stack,
  User,
} from "@phosphor-icons/react/ssr";

export const navItems = [
  { label: "Tổng quan", href: "/dashboard", icon: SquaresFour, exact: true },
  { label: "Hồ sơ của tôi", href: "/dashboard/profile", icon: User },
  { label: "Việc làm phù hợp", href: "/dashboard/jobs?scored=1", icon: Briefcase },
  { label: "Tất cả việc làm", href: "/dashboard/jobs", icon: Stack },
  { label: "Đã chấm bằng AI", href: "/dashboard/matches", icon: Sparkle },
  // Trỏ vào bản trong dashboard chứ KHÔNG phải `/salary`. Hai đường cùng nội
  // dung, nhưng `/salary` nằm ngoài khung điều hướng để Google đọc được — bấm
  // từ sidebar sang đó là văng khỏi sidebar.
  { label: "Tra cứu lương", href: "/dashboard/salary", icon: CurrencyCircleDollar },
  { label: "CV đã tạo", href: "/dashboard/cv-optimizer", icon: FileText },
  { label: "Thư đã viết", href: "/dashboard/cover-letter", icon: Envelope },
  { label: "Ứng tuyển tự động", href: "/dashboard/apply", icon: Robot },
  { label: "Lịch sử ứng tuyển", href: "/dashboard/applications", icon: ClockCounterClockwise },
  { label: "Chuẩn bị phỏng vấn", href: "/dashboard/interview", icon: ChatText },
  { label: "Lộ trình học", href: "/dashboard/upskill", icon: GraduationCap },
  // Nhãn phải khớp tiêu đề trang ("Tài khoản"). Trước đây sidebar ghi "Thiết
  // lập" trong khi trang hiện "Tài khoản" — người dùng bấm một chữ rồi đọc thấy
  // chữ khác, và đó là kiểu lệch chỉ lộ ra khi xem màn hình thật.
  { label: "Tài khoản", href: "/dashboard/settings", icon: Gear },
];

export function pageTitle(pathname: string): string {
  const matched = navItems
    .filter((item) => !item.href.includes("?"))
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return matched?.label ?? "";
}
