/**
 * Bảng màu cho logo công ty. Backend không lưu màu — đây thuần là chuyện
 * trình bày, nên suy ra ở phía giao diện.
 */
const LOGO_COLORS = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
] as const;

/**
 * Chọn màu theo tên công ty, KHÔNG chọn ngẫu nhiên.
 *
 * Cùng một công ty phải luôn ra cùng một màu, nếu không thì logo đổi màu mỗi
 * lần tải trang và người dùng mất khả năng nhận ra công ty quen bằng mắt.
 */
export function companyColor(company: string): string {
  let hash = 0;
  for (let index = 0; index < company.length; index += 1) {
    hash = (hash * 31 + company.charCodeAt(index)) | 0;
  }
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length];
}

/** Lấy tối đa hai chữ cái đầu, ví dụ "FPT Software" -> "FS". */
export function companyInitials(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Chữ cái đầu để hiện trên avatar người dùng, ví dụ "Nguyễn Văn Demo" -> "VD".
 *
 * Lấy hai từ CUỐI chứ không phải hai từ đầu như tên công ty: tiếng Việt đặt tên
 * riêng ở cuối, nên "NV" thì ai họ Nguyễn cũng giống nhau.
 */
export function personInitials(name: string | undefined | null): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return words
    .slice(-2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
