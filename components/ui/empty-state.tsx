import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Nút dẫn người dùng tới việc tiếp theo làm được. */
  action?: ReactNode;
  className?: string;
}

/**
 * "Chưa có gì" là một câu trả lời hợp lệ, không phải một lỗi.
 *
 * Vì vậy khối này không dùng màu cảnh báo, và luôn nói rõ VÌ SAO chưa có gì —
 * một dòng "Không có dữ liệu" để người dùng tự đoán là cách chắc chắn nhất
 * khiến họ nghĩ hệ thống hỏng.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 py-14 text-center",
        className,
      )}
    >
      {Icon && <Icon className="size-8 text-slate-300" />}
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="max-w-md text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Dạng gọn một dòng, viền đứt — dùng khi bộ lọc không khớp gì. */
export function EmptyHint({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500",
        className,
      )}
    >
      {children}
    </p>
  );
}
