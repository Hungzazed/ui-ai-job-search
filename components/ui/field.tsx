"use client";

import type { ReactNode } from "react";
import { Input, Label, Textarea } from "@/components/ui/form";
import { isJsonText, parseList } from "@/utils";

export interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

/** Nhãn ở trên, ô nhập ở giữa, dòng gợi ý ở dưới — bố cục chung của mọi ô. */
export function FieldShell({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function TextField({
  id,
  label,
  hint,
  placeholder,
  value,
  onChange,
}: FieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

export function AreaField({
  id,
  label,
  hint,
  placeholder,
  rows = 4,
  value,
  onChange,
}: FieldProps & { rows?: number }) {
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

/** Ô nhập danh sách: gõ phân tách bằng dấu phẩy, đếm số mục ngay bên dưới. */
export function ListField({
  id,
  label,
  hint,
  placeholder,
  value,
  onChange,
}: FieldProps) {
  const count = parseList(value).length;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={
        <>
          Phân tách bằng dấu phẩy
          {count > 0 && ` · ${count} mục`}
          {hint && ` · ${hint}`}
        </>
      }
    >
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

export function JsonField({
  id,
  label,
  placeholder,
  value,
  onChange,
  icon,
  rows = 8,
}: FieldProps & { icon: ReactNode; rows?: number }) {
  // Báo JSON sai ngay lúc gõ, chứ không đợi tới lúc bấm Lưu mới nói.
  const invalid = value.trim().length > 0 && !isJsonText(value);
  return (
    <div>
      <Label htmlFor={id} className="flex items-center gap-1.5">
        <span className="text-primary-600">{icon}</span>
        {label}
      </Label>
      <Textarea
        id={id}
        rows={rows}
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={
          invalid ? "border-red-300 font-mono text-xs" : "font-mono text-xs"
        }
      />
      <p
        className={
          invalid ? "mt-1 text-xs text-red-600" : "mt-1 text-xs text-slate-400"
        }
      >
        {invalid
          ? "JSON chưa hợp lệ — sửa lại trước khi lưu"
          : "Để trống nghĩa là giữ nguyên; gõ [] hoặc {} để xoá nội dung"}
      </p>
    </div>
  );
}
