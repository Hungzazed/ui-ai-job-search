"use client";

import { useState } from "react";
import { CaretDown, FileText } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/utils";

const LONG_ENOUGH_TO_FOLD = 900;

export function JobDescriptionCard({
  description,
  defaultOpen = false,
}: {
  description: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const foldable = description.length > LONG_ENOUGH_TO_FOLD;

  return (
    <SectionCard
      icon={FileText}
      title="Mô tả công việc"
      description="Nội dung nguyên văn từ tin tuyển dụng gốc"
    >
      <div className={cn("relative", foldable && !open && "max-h-64 overflow-hidden")}>
        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">
          {description}
        </p>
        {foldable && !open && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-white/0 to-white" />
        )}
      </div>

      {foldable && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <CaretDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          {open ? "Thu gọn mô tả" : "Xem toàn bộ mô tả"}
        </Button>
      )}
    </SectionCard>
  );
}
