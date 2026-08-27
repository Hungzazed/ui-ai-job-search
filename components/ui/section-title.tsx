import type { ReactNode } from "react";
import { cn } from "@/utils";

/** Nhãn nhỏ in hoa mở đầu một khối nội dung bên trong thẻ. */
export function SectionTitle({
  icon,
  label,
  className,
}: {
  icon?: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "mb-2 flex items-center gap-1.5 font-mono text-2xs font-bold tracking-wider text-slate-500 uppercase",
        className,
      )}
    >
      {icon && <span className="text-slate-400">{icon}</span>}
      {label}
    </h3>
  );
}
