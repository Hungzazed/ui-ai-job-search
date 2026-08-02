import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CompanyLogoProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-12 text-base" };

export function CompanyLogo({ initials, color, size = "md", className, ...props }: CompanyLogoProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-bold text-white",
        color,
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  );
}
