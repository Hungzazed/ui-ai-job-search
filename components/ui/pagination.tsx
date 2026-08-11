"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/utils";

interface PaginationProps {
  /** Vị trí bản ghi đầu tiên của trang hiện tại, tính từ 0. */
  offset: number;
  limit: number;
  total: number;
  onOffsetChange: (offset: number) => void;
  /** Khoá nút trong lúc đang tải trang kế, tránh bấm chồng nhiều lần. */
  disabled?: boolean;
}

/**
 * Phân trang chạy bằng offset, khớp với `?limit=&offset=` của backend.
 *
 * Hiện luôn khoảng bản ghi đang xem chứ không chỉ số trang: "21–40 / 342" trả
 * lời được câu hỏi "còn bao nhiêu nữa", còn "Trang 2" thì không.
 */
export function Pagination({
  offset,
  limit,
  total,
  onOffsetChange,
  disabled,
}: PaginationProps) {
  // Không có gì để lật thì không vẽ thanh điều hướng.
  if (total <= limit) return null;

  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.ceil(total / limit);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">
        <span className="font-mono font-semibold text-slate-700">
          {formatCount(from)}–{formatCount(to)}
        </span>{" "}
        trên tổng {formatCount(total)} tin
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || offset === 0}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          <ChevronLeft className="size-3.5" />
          Trước
        </Button>
        <span className="font-mono text-xs text-slate-500">
          {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || to >= total}
          onClick={() => onOffsetChange(offset + limit)}
        >
          Sau
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
