import type { WorkStatus } from "@/services";
import { Badge, type BadgeProps } from "@/components/ui/badge";

const STATUS_LABELS: Record<WorkStatus, string> = {
  PENDING: "Đang xếp hàng",
  RUNNING: "Đang tạo",
  DONE: "Hoàn tất",
  FAILED: "Thất bại",
};

const STATUS_VARIANTS: Record<WorkStatus, NonNullable<BadgeProps["variant"]>> = {
  PENDING: "neutral",
  RUNNING: "info",
  DONE: "success",
  FAILED: "danger",
};

export function DocumentStatusBadge({ status }: { status: WorkStatus }) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status]}
      dot
      className="font-mono text-[11px]"
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
