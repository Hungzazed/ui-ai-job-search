import type { ReactNode } from "react";
import {
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@/utils";

/**
 * Bốn sắc thái, và chúng KHÔNG thay thế được cho nhau.
 *
 * `danger` dành cho sự cố hệ thống. `warning` dành cho kết luận của backend mà
 * người dùng cần xử lý (không đủ điều kiện, chờ quá lâu). `info` dành cho việc
 * đã xảy ra đúng như thiết kế. Gộp tất cả vào hộp đỏ thì người dùng không phân
 * biệt được "hệ thống hỏng" với "hồ sơ của bạn chưa đạt".
 */
export type AlertTone = "danger" | "warning" | "info" | "success";

interface ToneStyle {
  box: string;
  body: string;
  icon: PhosphorIcon;
}

const TONE_STYLES: Record<AlertTone, ToneStyle> = {
  danger: {
    box: "border-red-200 bg-red-50 text-red-800",
    body: "text-red-700",
    icon: WarningCircle,
  },
  warning: {
    box: "border-amber-200 bg-amber-50 text-amber-900",
    body: "text-amber-800",
    icon: Warning,
  },
  info: {
    box: "border-sky-200 bg-sky-50 text-sky-900",
    body: "text-sky-800",
    icon: Info,
  },
  success: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-800",
    body: "text-emerald-700",
    icon: CheckCircle,
  },
};

interface AlertProps {
  tone?: AlertTone;
  /** Bỏ trống thì nội dung nằm một dòng ngang hàng với biểu tượng. */
  title?: ReactNode;
  /** Ghi đè biểu tượng mặc định của sắc thái. */
  icon?: PhosphorIcon;
  /** Nút hoặc liên kết đặt dưới phần nội dung. */
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function Alert({
  tone = "danger",
  title,
  icon,
  actions,
  className,
  children,
}: AlertProps) {
  const style = TONE_STYLES[tone];
  const Icon = icon ?? style.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border p-4 text-sm",
        style.box,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4.5 shrink-0" />
      {title === undefined ? (
        <div className="min-w-0">
          {children}
          {actions && <div className="mt-2.5">{actions}</div>}
        </div>
      ) : (
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          {children && (
            <div className={cn("mt-1 text-xs leading-relaxed", style.body)}>
              {children}
            </div>
          )}
          {actions && <div className="mt-2.5">{actions}</div>}
        </div>
      )}
    </div>
  );
}

/**
 * Hộp lỗi chiếm chỗ của cả trang, dùng khi lần tải đầu tiên hỏng.
 *
 * Khác với `Alert` đặt xen giữa nội dung: ở đây không có gì khác để xem, nên
 * hộp lỗi được đưa vào giữa màn hình thay vì nằm nép trên cùng.
 */
export function PageError({
  title,
  message,
}: {
  title: string;
  message: ReactNode;
}) {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Alert tone="danger" title={title} className="max-w-md">
        {message}
      </Alert>
    </div>
  );
}
