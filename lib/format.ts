import type { SalaryRange } from "@/types";

export function formatSalary(salary: SalaryRange): string {
  const format = (value: number) =>
    salary.currency === "VND"
      ? `${value.toLocaleString("vi-VN")}`
      : `$${value.toLocaleString("en-US")}`;

  const range = `${format(salary.min)} – ${format(salary.max)}`;
  const unit = salary.currency === "VND" ? "triệu/tháng" : "k/tháng";
  return `${range} ${unit}`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function matchTone(score: number): "good" | "mid" | "low" {
  if (score >= 80) return "good";
  if (score >= 60) return "mid";
  return "low";
}

export function matchToneClasses(score: number): {
  text: string;
  bg: string;
  bar: string;
} {
  const tone = matchTone(score);
  switch (tone) {
    case "good":
      return { text: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500" };
    case "mid":
      return { text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-500" };
    default:
      return { text: "text-rose-600", bg: "bg-rose-50", bar: "bg-rose-500" };
  }
}
