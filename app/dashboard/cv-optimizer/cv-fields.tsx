"use client";

import { X } from "@phosphor-icons/react/ssr";
import type { CvSectionKey } from "@/services";
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
        rows={rows}
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
