/** Chờ bao lâu rồi mới thu hồi URL tạm. */
const REVOKE_AFTER_MS = 60_000;

/**
 * Mở một Blob trong tab mới rồi thu hồi URL tạm sau một nhịp.
 *
 * KHÔNG dùng `<a href>` trỏ thẳng tới endpoint: xác thực đi bằng cookie httpOnly
 * và header Bearer qua instance axios, còn thẻ `<a>` chỉ gửi cookie - nó sẽ chạy
 * ở môi trường này rồi vỡ ngay khi đổi sang Bearer. Lấy Blob qua axios là dùng
 * đúng một đường xác thực cho mọi request.
 *
 * `revokeObjectURL` phải chờ: gọi ngay thì tab mới chưa kịp nạp xong blob và
 * hiện ra trang trắng - một lỗi không có gì báo, chỉ thấy khi bấm thật.
 */
export function openBlobInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS);
}
