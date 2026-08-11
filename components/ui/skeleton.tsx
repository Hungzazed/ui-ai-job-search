import type { ReactNode } from "react";
import { cn } from "@/utils";

/**
 * Một khối xám. Chiều cao do nơi dùng quyết định, vì mục đích của khung xám là
 * giữ ĐÚNG bố cục trang thật — nội dung không được nhảy khi tải xong.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-xl bg-slate-200/70", className)} />;
}

/** Khung ngoài cho một trang đang tải: chỉ có đúng một chỗ khai `animate-pulse`. */
export function SkeletonPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("animate-pulse space-y-6", className)}>{children}</div>
  );
}

/** Lưới n khối giống nhau — thẻ việc làm, thẻ số liệu, hàng bảng... */
export function SkeletonGrid({
  count,
  className,
  itemClassName,
}: {
  count: number;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className={itemClassName} />
      ))}
    </div>
  );
}
