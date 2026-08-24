import type { Job, SalaryRange } from "@/types";
export function formatJobSalary(job: Pick<Job, "salary" | "salaryRaw">): string {
  if (job.salary) return formatSalary(job.salary);
  return job.salaryRaw?.trim() || "Lương thoả thuận";
}
export function formatSalary(salary: SalaryRange): string {
  const period = salary.period === "year" ? "/năm" : "/tháng";
  const format =
    salary.currency === "VND"
      ? (value: number) =>
          (value / 1_000_000).toLocaleString("vi-VN", {
            maximumFractionDigits: 1,
          })
      : (value: number) => `$${value.toLocaleString("en-US")}`;
  const unit = salary.currency === "VND" ? " triệu" : "";

  if (salary.min === salary.max) {
    return `${format(salary.min)}${unit}${period}`;
  }
  return `${format(salary.min)} – ${format(salary.max)}${unit}${period}`;
}
