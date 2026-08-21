"use client";

import { useCallback, useState } from "react";

/**
 * Một ô nhập giữ được nội dung qua việc đổi tab và tải lại trang.
 *
 * Vì sao cần: form dán JD nằm trong một tab, và React tháo cả panel khi người
 * dùng bấm sang tab kia — ba nghìn ký tự vừa dán biến mất, không cảnh báo,
 * không hoàn tác. Lift state lên component cha cũng chữa được, nhưng phải kéo
 * bốn cặp value/onChange xuống lại, và nó vẫn không cứu được lần tải lại trang
 * — vốn là cách mất dữ liệu thứ hai.
 *
 * `sessionStorage` chứ không `localStorage`: bản nháp thuộc về phiên làm việc
 * này. Mở lại trình duyệt tuần sau mà thấy JD cũ hiện ra là một bất ngờ khó
 * chịu chứ không phải một tiện ích.
 *
 * CHỈ nhận chuỗi. Đủ cho mọi ô nhập, và nhờ vậy không cần serialize — thứ sẽ
 * kéo theo cả chuyện so sánh tham chiếu nếu sau này đọc bằng
 * `useSyncExternalStore`.
 */
export function useDraftState(
  key: string,
  initial = "",
): [string, (next: string) => void] {
  /*
   * Đọc trong hàm khởi tạo LƯỜI, không đọc trong effect.
   *
   * Đọc trong effect thì phải `setState` ngay trong effect — điều eslint của dự
   * án cấm, và cấm có lý: nó thêm một lượt render thừa cho mọi lần mount.
   *
   * Đổi lại phải chấp nhận một điều kiện: component này chỉ được render ở phía
   * trình duyệt. Đúng như vậy — panel mail chỉ mount sau khi dữ liệu tải xong ở
   * client, nên lượt dựng HTML phía máy chủ không bao giờ chạm tới nó và không
   * có chuyện hydration lệch. Nhánh `typeof window` chỉ là lưới an toàn nếu ai
   * đó đem hook này sang một chỗ render sẵn từ máy chủ.
   */
  const [value, setValue] = useState<string>(() => {
    if (typeof window === "undefined") return initial;
    try {
      return window.sessionStorage.getItem(key) ?? initial;
    } catch {
      // Trình duyệt chặn lưu trữ (chế độ riêng tư, chính sách site).
      return initial;
    }
  });

  const update = useCallback(
    (next: string) => {
      setValue(next);
      try {
        window.sessionStorage.setItem(key, next);
      } catch {
        // Không lưu được thì vẫn gõ tiếp được, chỉ mất khả năng khôi phục.
      }
    },
    [key],
  );

  return [value, update];
}
