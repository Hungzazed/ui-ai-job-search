import { displayLocation } from "@/utils";
import { cn } from "@/utils";

/**
 * Địa điểm tin tuyển dụng trong một ô bảng: cắt ngắn, nguyên văn ở `title`.
 *
 * Là component chứ không phải một lời gọi hàm rải rác trong JSX vì có hai bảng
 * cùng cần nó (Lịch sử ứng tuyển và Tất cả việc làm), và cả hai phải cắt giống
 * hệt nhau — một chỗ hiện "Hà Nội…" còn chỗ kia hiện nguyên 121 ký tự thì người
 * dùng sẽ tưởng là hai địa điểm khác nhau.
 *
 * Lý do cắt, cùng lý do KHÔNG tự suy ra tên tỉnh/thành: xem `utils/location.ts`.
 */
export function LocationText({
  location,
  className,
}: {
  location?: string | null;
  className?: string;
}) {
  const place = displayLocation(location);

  return (
    // Hai tầng chặn bề rộng, và cần cả hai. `displayLocation` cắt theo SỐ KÝ TỰ
    // nên nó không biết gì về bề rộng thật của chữ — một địa điểm 28 ký tự chữ
    // hoa rộng hơn hẳn 28 ký tự chữ thường. `max-w-*` cùng `truncate` chặn theo
    // pixel, tức đúng đại lượng làm bảng vỡ.
    <span
      title={place.full}
      className={cn("inline-block max-w-56 truncate align-middle", className)}
    >
      {place.text}
    </span>
  );
}
