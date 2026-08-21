import { cn } from "@/utils";
import type { AgentRunStatus } from "@/services";

/**
 * Năm trạng thái, và `WAITING_USER` phải NỔI hơn bốn cái kia.
 *
 * Nó là trạng thái duy nhất mà hệ thống không tự thoát ra được: agent nằm im
 * cho tới khi người dùng trả lời. Cho nó cùng một màu xám như "đang chạy" là
 * cách chắc chắn để một lượt chạy bị bỏ quên.
 */
const STYLES: Record<AgentRunStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Đang xếp hàng",
    className: "bg-slate-100 text-slate-600",
  },
  RUNNING: {
    label: "Đang chạy",
    className: "bg-primary-50 text-primary-700",
  },
  WAITING_USER: {
    label: "Chờ bạn trả lời",
    className: "bg-amber-100 text-amber-900 ring-1 ring-amber-300",
  },
  DONE: { label: "Hoàn tất", className: "bg-emerald-50 text-emerald-700" },
  FAILED: { label: "Thất bại", className: "bg-rose-50 text-rose-700" },
};

export function AgentStatusBadge({ status }: { status: AgentRunStatus }) {
  const style = STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        style.className,
      )}
    >
      {style.label}
    </span>
  );
}
