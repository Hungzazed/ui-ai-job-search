import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";

interface SectionCardProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  /** Mặc định là màu thương hiệu; đổi khi biểu tượng mang nghĩa cảnh báo. */
  iconClassName?: string;
  /** Nội dung căn phải trên cùng hàng với tiêu đề (nút, huy hiệu trạng thái). */
  actions?: ReactNode;
  /** Cỡ chữ nhỏ hơn và có đường kẻ dưới tiêu đề — dùng cho thẻ phụ trong trang. */
  compact?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/**
 * Thẻ có tiêu đề — bố cục lặp lại ở gần như mọi trang.
 *
 * Gom lại một chỗ để tiêu đề, khoảng cách và cỡ chữ giống nhau ở mọi nơi: khi
 * mỗi trang tự ghép Card + CardHeader + CardTitle thì chỉ vài lần sửa là các
 * trang lệch nhau vài pixel mà không ai cố ý.
 */
export function SectionCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  actions,
  compact = false,
  className,
  contentClassName,
  children,
}: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader
        className={cn(
          compact && "border-b border-slate-100 pb-3",
          actions && "flex-row items-start justify-between space-y-0",
        )}
      >
        <div className="min-w-0">
          <CardTitle
            className={cn("flex items-center gap-2", compact && "text-sm")}
          >
            {Icon && (
              <Icon
                className={cn("text-primary-600 size-4.5", iconClassName)}
              />
            )}
            {title}
          </CardTitle>
          {description && (
            <CardDescription className={cn("mt-1", compact && "text-xs")}>
              {description}
            </CardDescription>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent className={cn("space-y-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
