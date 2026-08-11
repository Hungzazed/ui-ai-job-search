import type { Job, SalaryRange } from "@/types";

/**
 * Mức lương để hiển thị trên thẻ công việc.
 *
 * Ưu tiên con số; nếu tin không công bố số thì hiện đúng chữ mà portal ghi
 * ("Đăng nhập để xem mức lương", "Thương lượng"). KHÔNG bao giờ rơi về 0 —
 * "0 – 0 triệu/tháng" là một con số bịa, và người đọc không có cách nào biết
 * nó là bịa.
 */
export function formatJobSalary(job: Pick<Job, "salary" | "salaryRaw">): string {
  if (job.salary) return formatSalary(job.salary);
  return job.salaryRaw?.trim() || "Lương thoả thuận";
}

export function formatSalary(salary: SalaryRange): string {
  const format = (value: number) =>
    salary.currency === "VND"
      ? `${value.toLocaleString("vi-VN")}`
      : `$${value.toLocaleString("en-US")}`;

  const range = `${format(salary.min)} – ${format(salary.max)}`;
  const unit = salary.currency === "VND" ? "triệu/tháng" : "k/tháng";
  return `${range} ${unit}`;
}
