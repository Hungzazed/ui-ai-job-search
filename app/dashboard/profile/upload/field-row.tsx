"use client";


import type { ProposalRow } from "@/lib/profile-draft-content";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export function FieldRow({
  row,
  checked,
  onToggle,
}: {
  row: ProposalRow;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex gap-3 py-3.5">
      {/*
        Checkbox gốc, và nó bị `disabled` khi model không có gì cho trường này —
        hàng vẫn hiện để người dùng biết AI đã xem trường đó và không tìm ra, nhưng
        không thể tích một thứ không có nội dung.
      */}
      <input
        type="checkbox"
        checked={checked}
        disabled={row.isEmpty}
        onChange={onToggle}
        id={`field-${row.field}`}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={`field-${row.field}`}
            className={cn(
              "text-sm font-semibold",
              row.isEmpty
                ? "cursor-not-allowed text-slate-400"
                : "cursor-pointer text-slate-900",
            )}
          >
            {row.label}
          </label>
          {/*
            Ba nhãn cho ba tình huống khác nhau, và chúng phải khác nhau: trước đây
            chỉ có "ghi đè", nên trường "Quốc gia" bị dán nhãn cảnh báo trong khi cả
            hai bên đều là "Việt Nam". Cảnh báo về một mất mát không tồn tại làm
            người dùng bỏ qua cả những cảnh báo thật.
          */}
          {row.isEmpty ? (
            <Badge variant="neutral" className="text-[11px]">
              không tìm thấy
            </Badge>
          ) : row.unchanged ? (
            <Badge variant="neutral" className="text-[11px]">
              giống hồ sơ hiện tại
            </Badge>
          ) : row.overwrites ? (
            <Badge variant="warning" className="text-[11px]">
              ghi đè
            </Badge>
          ) : null}
        </div>

        {!row.isEmpty && (
          <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
            <ValueBlock
              caption="AI đề xuất"
              lines={row.proposed}
              tone="proposed"
            />
            {/* Cột "đang có" CHỈ hiện khi thật sự có dữ liệu sẽ bị ghi đè. Hiện một
                ô "chưa có" rỗng ở mọi hàng chỉ làm loãng đúng thứ cần chú ý. */}
            {row.overwrites && (
              <ValueBlock
                caption="Hồ sơ đang có"
                lines={row.current}
                tone="current"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/// Số dòng hiện tối đa trước khi gộp phần còn lại thành một dòng đếm.
///
/// Một CV có thể cho ra 25 kỹ năng; in hết thì một hàng cao hơn cả màn hình và bảng
/// xác nhận không còn đọc được theo chiều dọc.
const MAX_LINES = 6;

function ValueBlock({
  caption,
  lines,
  tone,
}: {
  caption: string;
  lines: string[];
  tone: "proposed" | "current";
}) {
  const shown = lines.slice(0, MAX_LINES);
  const hidden = lines.length - shown.length;

  return (
    <div
      className={cn(
        "rounded-lg border p-2.5",
        tone === "proposed"
          ? "border-primary-100 bg-primary-50/40"
          : "border-slate-200 bg-slate-50/60",
      )}
    >
      <p className="mb-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        {caption}
      </p>
      <ul className="space-y-0.5">
        {shown.map((line) => (
          <li key={line} className="text-xs leading-relaxed text-slate-700">
            {line}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <p className="mt-1 text-[11px] text-slate-400">
          … và {hidden} dòng nữa
        </p>
      )}
    </div>
  );
}
