import type { JobMatchWithJob } from "@/types";

/**
 * Bốn cách một lần tạo đơn có thể không thành, và chúng KHÔNG cùng loại.
 *
 * Chỉ `failed` là sự cố. Ba trường hợp còn lại là kết luận của backend về tình
 * trạng hồ sơ, mỗi cái dẫn người dùng đi một hướng khác nhau — gộp chung vào
 * một hộp đỏ "có lỗi" thì người dùng không biết phải làm gì tiếp.
 */
export type RefusalKind = "not-scored" | "ineligible" | "duplicate" | "failed";

export interface Refusal {
  jobId: string;
  kind: RefusalKind;
  message: string;
}

/**
 * Backend dùng CHUNG mã 400 cho "chưa chấm điểm" và "không đủ điều kiện", nên
 * mã trạng thái không đủ để phân biệt hai trường hợp.
 *
 * Hai tín hiệu bổ sung, và thứ tự giữa chúng là có chủ đích: cờ `eligibility`
 * đã tải sẵn HOẶC câu chữ trong thông báo, cái nào nói "không đủ điều kiện"
 * cũng đủ để kết luận. Nghĩa là **câu chữ thắng cả khi cờ nói `PASS`** — đúng
 * như vậy, vì cờ là dữ liệu client tải từ trước còn thông báo đến từ chính lần
 * gọi vừa rồi: nếu tin đã bị chấm lại thành FAIL ở phía máy chủ sau khi client
 * tải danh sách thì thông báo mới là thứ đúng.
 *
 * (Bản mô tả trước ở đây viết rằng chỉ dò câu chữ khi cờ "không nói gì". Điều đó
 * không khớp với code, và code mới là bản đúng - xem test trong
 * `test/unit/app/.../refusal.spec.ts`.)
 */
export function refusalKind(
  status: number | undefined,
  message: string,
  eligibility: JobMatchWithJob["eligibility"],
): RefusalKind {
  if (status === 409) return "duplicate";
  if (status !== 400) return "failed";
  if (eligibility === "FAIL" || message.includes("không đủ điều kiện")) {
    return "ineligible";
  }
  return "not-scored";
}
