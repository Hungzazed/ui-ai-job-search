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
 * Cờ `eligibility` đã tải sẵn là tín hiệu đáng tin hơn câu chữ; chỉ khi nó
 * không nói gì (bản ghi cũ, hoặc dữ liệu đã lạc hậu so với máy chủ) mới phải
 * dò trong thông báo.
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
