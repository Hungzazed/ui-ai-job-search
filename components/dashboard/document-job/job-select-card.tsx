"use client";

import type { ReactNode } from "react";
import { Wand2 } from "lucide-react";
import type { JobMatchWithJob } from "@/types";
import { Label } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { SectionCard } from "@/components/ui/section-card";

interface JobSelectCardProps {
  title: string;
  description: string;
  /** Id của thẻ `select`, phải khác nhau giữa hai trang để nhãn trỏ đúng ô. */
  selectId: string;
  matches: JobMatchWithJob[];
  value: string;
  onChange: (jobId: string) => void;
  disabled?: boolean;
  /** Nhãn của lựa chọn rỗng — "CV tổng quát" hay "— Chọn một công việc —". */
  emptyOptionLabel: string;
  /** Dòng chữ nhỏ dưới ô chọn, ví dụ khi chưa có việc nào được chấm điểm. */
  hint?: ReactNode;
  /** Nút bấm sinh tài liệu. */
  action: ReactNode;
}

/**
 * Ô chọn công việc dùng chung cho trang CV và trang thư xin việc.
 *
 * Khác biệt duy nhất giữa hai trang nằm ở ý nghĩa của lựa chọn rỗng: bên CV nó
 * là "sinh bản tổng quát", bên thư xin việc là "chưa chọn" và nút sẽ bị khoá.
 * Chuyện đó do nơi dùng quyết định qua `emptyOptionLabel` và trạng thái nút.
 */
export function JobSelectCard({
  title,
  description,
  selectId,
  matches,
  value,
  onChange,
  disabled,
  emptyOptionLabel,
  hint,
  action,
}: JobSelectCardProps) {
  return (
    <SectionCard
      compact
      icon={Wand2}
      iconClassName="size-4"
      title={title}
      description={description}
      className="border-slate-200/90"
      contentClassName="flex flex-wrap items-end gap-4 space-y-0"
    >
      <div className="min-w-64 flex-1">
        <Label htmlFor={selectId}>Công việc</Label>
        <Select
          id={selectId}
          value={value}
          disabled={disabled}
          options={[
            { value: "", label: emptyOptionLabel },
            ...matches.map((match) => ({
              value: match.jobId,
              label: `${match.job.title} — ${match.job.company}`,
            })),
          ]}
          onChange={onChange}
        />
        {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      </div>
      {action}
    </SectionCard>
  );
}
