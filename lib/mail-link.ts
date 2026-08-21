/**
 * Đường mở sẵn một lá mail trong trình soạn thư.
 *
 * Tồn tại vì `mailto:` KHÔNG dùng được cho tiếng Việt. Percent-encode làm mỗi
 * ký tự có dấu nở thành chín ký tự URL, nên một lá mail 1.151 chữ - đo trên bản
 * hệ thống sinh thật - cho ra URL 3.364 ký tự, vượt xa mức ~2.048 mà trình xử
 * lý mail trên Windows chịu được. Tệ hơn: nó không báo lỗi, nó mở cửa sổ soạn
 * thư với thân mail bị cắt cụt.
 *
 * Gmail nhận nội dung qua query của một URL https thường, và trình duyệt chịu
 * được cỡ 8KB, nên đây là đường duy nhất mở được sẵn cả tiêu đề lẫn thân mail
 * mà không mất chữ.
 */

/**
 * Trần an toàn cho URL.
 *
 * Chrome/Firefox chịu được hơn nhiều, nhưng qua ngưỡng này thì đằng nào lá mail
 * cũng đã dài quá mức một mail ứng tuyển nên có, và nút sao chép vẫn luôn ở đó.
 */
const URL_LIMIT = 7000;

export interface MailDraft {
  subject: string | null;
  body: string;
}

/**
 * URL soạn thư Gmail, hoặc `null` khi nội dung dài tới mức không nên mở bằng
 * URL nữa.
 *
 * Trả `null` thay vì một URL cụt là chủ đích: nơi gọi ẩn nút đi, còn người dùng
 * vẫn sao chép được. Một cái nút mở ra bản thiếu chữ tệ hơn một cái nút vắng
 * mặt, vì không ai kiểm lại thứ máy đã điền sẵn.
 */
export function gmailComposeUrl(draft: MailDraft): string | null {
  if (!draft.body.trim()) return null;

  const url =
    'https://mail.google.com/mail/?view=cm&fs=1' +
    `&su=${encodeURIComponent(draft.subject ?? '')}` +
    `&body=${encodeURIComponent(draft.body)}`;

  return url.length <= URL_LIMIT ? url : null;
}
