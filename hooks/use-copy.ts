"use client";

import { useCallback, useEffect, useState } from "react";

/** Nhãn "Đã sao chép" tự tắt sau chừng này — đủ để đọc, không đủ để gây nhiễu. */
const COPIED_RESET_MS = 2000;

export interface Copier {
  /** Khoá của phần vừa được sao chép; `null` = chưa sao chép gì. */
  copied: string | null;
  /**
   * Chép `value` vào clipboard và nhớ `key` để nút tương ứng đổi nhãn.
   *
   * `key` tồn tại vì một màn hình có thể có nhiều nút sao chép (tiêu đề mail và
   * thân mail là hai ô khác nhau ở mọi trình gửi thư); một cờ boolean dùng chung
   * sẽ làm cả hai nút cùng báo "đã sao chép".
   */
  copy: (key: string, value: string | null) => void;
}

/**
 * Sao chép vào clipboard kèm phản hồi "đã sao chép" tự tắt.
 *
 * Hẹn giờ được dọn khi rời trang — cùng một kỷ luật với vòng hỏi trạng thái tài
 * liệu, và cũng vì cùng một lý do: người dùng chuyển trang giữa chừng là chuyện
 * thường, còn `setState` trên component đã tháo thì không.
 */
export function useCopy(): Copier {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = useCallback((key: string, value: string | null) => {
    if (!value || !navigator.clipboard) return;
    void navigator.clipboard.writeText(value).then(() => setCopied(key));
  }, []);

  return { copied, copy };
}
