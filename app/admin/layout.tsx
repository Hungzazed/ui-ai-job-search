/**
 * Khung cho trang quản trị.
 *
 * `/admin` nằm NGOÀI `app/dashboard/`, nên nó không nhận `AppLayout` — thứ cung
 * cấp sidebar, header và **lề trang**. Thiếu file này, nội dung dán sát hai mép
 * màn hình. Lỗi đó đi qua được typecheck, lint, build và toàn bộ test; chỉ ảnh
 * chụp mới thấy.
 *
 * CỐ Ý không dùng lại `AppLayout`: trang quản trị không thuộc thanh điều hướng
 * của người dùng, và nó có nút "Về trang chính" riêng. Nó chỉ cần lề và một chiều
 * rộng tối đa để bảng số liệu không kéo dài hết màn hình rộng.
 *
 * Lề khớp `AppLayout` (`px-4 py-6 sm:px-6 lg:px-8`) để hai bên không lệch nhau
 * khi người dùng qua lại giữa hai khu vực.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-surface min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
