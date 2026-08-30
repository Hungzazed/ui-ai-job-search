"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import type { SalaryOccupation, SalaryPositionSummary } from "@/services/salary";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fold, formatMonthlyVnd } from "@/utils";
import { SalaryBar } from "./salary-bar";


/**
 * Số dòng mỗi trang.
 *
 * Đặt bằng đúng ngành lớn nhất (25 vị trí) để lọc theo một ngành thì gọn trong
 * một trang, và `Pagination` tự ẩn đi.
 */
const PAGE_SIZE = 25;

/**
 * Thang CHUNG cho mọi dòng, luôn bắt đầu từ 0.
 *
 * Mỗi dòng một thang riêng thì thanh dài ngắn không còn nghĩa gì, mà mắt vẫn cứ
 * so chúng với nhau — đó chính là thứ làm lưới thẻ cũ không đọc được.
 */
function globalScale(positions: SalaryPositionSummary[]): [number, number] {
  const top = positions.reduce((max, p) => {
    const candidate = p.rangeMax ?? p.avgMonthly ?? 0;
    return candidate > max ? candidate : max;
  }, 0);

  return [0, Math.max(top, 1)];
}

export function SalaryBrowser({
  occupations,
  positions,
  basePath,
}: {
  occupations: SalaryOccupation[];
  positions: SalaryPositionSummary[];
  /** Tiền tố đường dẫn: trang công khai và trang trong dashboard dùng chung component này. */
  basePath: string;
}) {
  const [term, setTerm] = useState("");
  const [occupation, setOccupation] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const scale = useMemo(() => globalScale(positions), [positions]);

  const shown = useMemo(() => {
    const needle = fold(term.trim());
    return positions.filter((p) => {
      if (occupation && p.occupationCode !== occupation) return false;
      if (!needle) return true;
      return fold(p.positionName).includes(needle);
    });
  }, [positions, term, occupation]);

  const visible = shown.slice(offset, offset + PAGE_SIZE);

  const search = (value: string) => {
    setTerm(value);
    setOffset(0);
  };

  const pickOccupation = (code: string | null) => {
    setOccupation(code);
    setOffset(0);
  };

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        className="w-full flex-none"
        value={term}
        onChange={search}
        placeholder="Tìm chức danh — kế toán, backend, tuyển dụng…"
      />

      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="Tất cả"
          count={positions.length}
          active={occupation === null}
          onClick={() => pickOccupation(null)}
        />
        {occupations.map((o) => (
          <FilterChip
            key={o.code}
            label={o.name}
            count={o.positionCount}
            active={occupation === o.code}
            onClick={() => pickOccupation(o.code)}
          />
        ))}
      </div>

      <Card className="overflow-hidden">
        {shown.length === 0 ? (
          <EmptyState
            icon={MagnifyingGlass}
            title="Không có vị trí nào khớp"
            description="Thử bỏ bớt bộ lọc ngành hoặc gõ từ khoá ngắn hơn."
          />
        ) : (
          <>
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[30%] sm:w-[26%]">Vị trí</TableHead>
                  <TableHead className="hidden w-[20%] md:table-cell">Ngành</TableHead>
                  <TableHead className="hidden whitespace-nowrap sm:table-cell">
                    Khoảng lương phổ biến
                    <span className="ml-2 font-mono text-[11px] font-normal tracking-normal text-slate-400 normal-case">
                      0 – {formatMonthlyVnd(scale[1])}
                    </span>
                  </TableHead>
                  <TableHead className="w-28 pr-6 text-right whitespace-nowrap">
                    Trung bình
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {visible.map((p) => (
                  <TableRow key={p.positionSlug}>
                    <TableCell>
                      <Link
                        href={`${basePath}/${p.positionSlug}`}
                        title={p.positionName}
                        className="hover:text-primary-600 block truncate font-medium text-slate-900"
                      >
                        {p.positionName}
                      </Link>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <span
                        title={p.occupationName ?? undefined}
                        className="block truncate text-xs text-slate-500"
                      >
                        {p.occupationName ?? "—"}
                      </span>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <SalaryBar
                        from={p.rangeMin}
                        to={p.rangeMax}
                        marker={p.avgMonthly}
                        scale={scale}
                      />
                    </TableCell>

                    <TableCell className="pr-6 text-right font-mono font-semibold whitespace-nowrap text-slate-900">
                      {p.avgMonthly === null
                        ? "—"
                        : formatMonthlyVnd(p.avgMonthly).replace(" triệu", "")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              offset={offset}
              limit={PAGE_SIZE}
              total={shown.length}
              onOffsetChange={setOffset}
              noun="vị trí"
            />
          </>
        )}
      </Card>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "bg-primary-600 inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-white transition-colors active:translate-y-[1px]"
          : "inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] text-slate-700 ring-1 ring-slate-200 ring-inset transition-colors hover:bg-slate-50 active:translate-y-[1px]"
      }
    >
      {label}
      <span
        className={
          active ? "font-mono text-xs opacity-70" : "font-mono text-xs text-slate-400"
        }
      >
        {count}
      </span>
    </button>
  );
}
