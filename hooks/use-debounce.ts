"use client";

import { useEffect, useState } from "react";

/**
 * Trả về `value` sau khi nó ngừng đổi trong `delayMs`.
 *
 * Đây là hook GIÁ TRỊ chứ không phải hook callback, và đó là điểm chính: ô nhập
 * phải phản hồi tức thì - chữ hiện ngay khi gõ - còn thứ được trễ chỉ là giá trị
 * DẪN XUẤT từ nó. Nhét debounce vào trong `SearchInput` sẽ làm chính việc gõ bị
 * khựng, nên component đó cố ý không có tham số delay nào.
 *
 * Ba ô tìm kiếm khác trong app KHÔNG dùng hook này, và đừng "thêm cho đủ bộ":
 * thanh trên cùng chỉ chạy khi bấm Enter, còn ô chọn ngành và ô tra cứu lương
 * lọc mảng trong bộ nhớ. Trễ ở đó chỉ làm chậm mà không tiết kiệm được gì.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
