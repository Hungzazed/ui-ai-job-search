import { CalendarBlank, CloudArrowDown } from "@phosphor-icons/react/ssr";
import type { JobTimestamp } from "@/types";
import { cn } from "@/utils";

const META = {
  posted: {
    icon: CalendarBlank,
    prefix: "Đăng",
    title: "Ngày nhà tuyển dụng đăng tin, theo thông tin portal cung cấp",
  },
  scraped: {
    icon: CloudArrowDown,
    prefix: "Thu thập",
    title:
      "Portal không cho biết ngày đăng — đây là lúc hệ thống quét được tin, không phải lúc tin được đăng",
  },
} as const;

/**
 * Một dòng thời gian, dùng chung cho thẻ việc làm và bảng tất cả việc làm.
 *
 * Hai trang phải nói y hệt nhau: cùng một tin mà chỗ ghi "Đăng 3 ngày trước"
 * chỗ ghi "3 ngày trước" thì người đọc phải tự đoán hai con số có cùng nghĩa
 * hay không.
 */
export function JobTime({
  time,
  className,
}: {
  time: JobTimestamp;
  className?: string;
}) {
  const meta = META[time.source];
  const Icon = meta.icon;

  return (
    <span
      title={meta.title}
      className={cn("inline-flex items-center gap-1", className)}
    >
      <Icon className="size-4 shrink-0 text-slate-400" />
      {meta.prefix} {time.label}
    </span>
  );
}
