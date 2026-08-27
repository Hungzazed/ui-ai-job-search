"use client";

import { CaretRight, X } from "@phosphor-icons/react/ssr";
import type { CvSectionKey } from "@/services";
import { cn } from "@/utils";
import { Input, Textarea } from "@/components/ui/form";

export const SECTION_LABELS: Record<CvSectionKey, string> = {
  profile: "Giới thiệu",
  competencies: "Năng lực chính",
  experience: "Kinh nghiệm",
  projects: "Dự án",
  education: "Học vấn",
  skills: "Kỹ năng",
};

/** Đổi một phần tử trong mảng mà không sửa mảng gốc. */
export const replaceAt = <T,>(list: T[], index: number, value: T): T[] =>
  list.map((item, at) => (at === index ? value : item));

/** Đổi chỗ hai phần tử. Trả về chính mảng cũ nếu chỉ số nằm ngoài. */
export const swap = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
};

/** Ô nhập nhiều dòng, mỗi dòng một mục. Dùng cho gạch đầu dòng vốn hay có dấu phẩy. */
export function LinesField({
  label,
  value,
  rows = 3,
  onChange,
}: {
  label: string;
  value: string[];
  rows?: number;
  onChange: (value: string[]) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label} <span className="text-slate-400">· mỗi dòng một ý</span>
      </span>
      <Textarea
        rows={Math.max(rows, value.length + 1)}
        value={value.join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
      />
    </label>
  );
}

/** Ô nhập một dòng kèm nhãn nhỏ. */
export function Line({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function Paragraph({
  label,
  value,
  rows = 2,
  onChange,
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <Textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

/** Khung một mục con, kèm nút xoá ở góc. */
export function EntryBox({
  onRemove,
  children,
}: {
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Xoá mục này"
        className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
      >
        <X className="size-4" />
      </button>
      {children}
    </div>
  );
}

/**
 * Panel sửa nội dung CV: chữ, thứ tự mục, mục bị ẩn.
 *
 * Component ĐƯỢC ĐIỀU KHIỂN - không giữ state riêng. Nhờ vậy khung xem trước và
 * nút Lưu ở component cha luôn nhìn thấy đúng một bản nháp duy nhất.
 */

export function CollapsibleEntry({
  title,
  subtitle,
  open,
  onToggle,
  onRemove,
  children,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border transition-colors",
        open
          ? "border-primary-300 bg-white"
          : "border-slate-200 bg-slate-50/60 hover:border-slate-300",
      )}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
        >
          <CaretRight
            className={cn(
              "size-3.5 shrink-0 text-slate-400 transition-transform",
              open && "rotate-90",
            )}
          />
          <span className="truncate text-xs font-semibold text-slate-800">
            {title.trim() || "(chưa đặt tên)"}
          </span>
          {subtitle?.trim() && (
            <span className="truncate text-2xs text-slate-500">
              · {subtitle}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Xoá mục này"
          className="shrink-0 cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
        >
          <X className="size-3.5" />
        </button>
      </div>
      {open && <div className="space-y-2 px-2.5 pb-2.5">{children}</div>}
    </div>
  );
}
