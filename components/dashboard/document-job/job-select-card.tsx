"use client";

import type { ReactNode } from "react";
import { MagicWand } from "@phosphor-icons/react/ssr";
import type { JobMatchWithJob } from "@/types";
import { Label } from "@/components/ui/form";
import { SelectMenu } from "@/components/ui/select-menu";
import { SectionCard } from "@/components/ui/section-card";

interface JobSelectProps {
  /** Id của nút mở danh sách, phải khác nhau giữa các ô để nhãn trỏ đúng chỗ. */
  selectId: string;
  matches: JobMatchWithJob[];
  value: string;
  onChange: (jobId: string) => void;
  disabled?: boolean;
  /** Nhãn của lựa chọn rỗng — "CV tổng quát" hay "— Chọn một công việc —". */
  emptyOptionLabel: string;
  /** Dòng chữ nhỏ dưới ô chọn, ví dụ khi chưa có việc nào được chấm điểm. */
  hint?: ReactNode;
}

interface JobSelectCardProps extends JobSelectProps {
  title: string;
  description: string;
  /** Nút bấm sinh tài liệu. */
  action: ReactNode;
}

/**
 * Riêng ô chọn, không kèm thẻ bao quanh.
 *
 * Tách ra vì màn mail ứng tuyển đặt nó cạnh một ô dán JD trong cùng MỘT thẻ:
 * ở đó nguồn tin tuyển dụng là một lựa chọn hai nhánh, không phải hai thẻ rời.
 */
export function JobSelect({
  selectId,
  matches,
  value,
  onChange,
  disabled,
  emptyOptionLabel,
  hint,
}: JobSelectProps) {
  return (
    <div className="min-w-64 flex-1">
      <Label htmlFor={selectId}>Công việc</Label>
      <SelectMenu
        id={selectId}
        variant="field"
        label={emptyOptionLabel}
        value={value}
        disabled={disabled}
        onChange={onChange}
        searchPlaceholder="Tìm vị trí hoặc công ty…"
        options={[
          { value: "", label: emptyOptionLabel },
          ...matches.map((match) => ({
            value: match.jobId,
            label: match.job.title,
            hint: match.job.company,
          })),
        ]}
      />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
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
      icon={MagicWand}
      iconClassName="size-4"
      title={title}
      description={description}
      className="border-slate-200/90"
      contentClassName="flex flex-wrap items-end gap-4 space-y-0"
    >
      <JobSelect
        selectId={selectId}
        matches={matches}
        value={value}
        onChange={onChange}
        disabled={disabled}
        emptyOptionLabel={emptyOptionLabel}
        hint={hint}
      />
      {action}
    </SectionCard>
  );
}
