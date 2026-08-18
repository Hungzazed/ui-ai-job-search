"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import type { FilterOption, JobFilters, JobSort } from "@/services";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { SearchInput } from "@/components/ui/search-input";
import { cn, formatCount } from "@/utils";

export interface JobFilterValue {
  q: string;
  province: string[];
  occupation: string[];
  salaryMin: number;
  postedWithin: number;
  sort: JobSort;
}

export const EMPTY_FILTER: JobFilterValue = {
  q: "",
  province: [],
  occupation: [],
  salaryMin: 0,
  postedWithin: 0,
  sort: "newest",
};

const SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "salary", label: "Lương cao nhất" },
  { value: "match", label: "Điểm AI Match" },
];

/** Mốc lương, đơn vị triệu đồng. Khớp với các bậc portal Việt Nam hay dùng. */
const SALARY_STEPS = [10, 15, 20, 30, 50];

const POSTED_STEPS = [
  { value: 1, label: "Trong 24 giờ" },
  { value: 3, label: "Trong 3 ngày" },
  { value: 7, label: "Trong 7 ngày" },
  { value: 30, label: "Trong 30 ngày" },
];

/**
 * Thanh lọc của trang tìm việc.
 *
 * Mọi thay đổi đi thẳng lên `onChange` rồi lên URL - component này KHÔNG giữ
 * state của bộ lọc. Giữ một bản sao ở đây nghĩa là hai nguồn sự thật, và cái
 * hỏng đầu tiên là nút Back của trình duyệt.
 */
export function JobFilterBar({
  value,
  filters,
  onChange,
}: {
  value: JobFilterValue;
  /** `null` khi danh mục chưa tải xong; hai menu chọn sẽ bị khoá. */
  filters: JobFilters | null;
  onChange: (next: JobFilterValue) => void;
}) {
  const set = <K extends keyof JobFilterValue>(
    key: K,
    next: JobFilterValue[K],
  ) => onChange({ ...value, [key]: next });

  const toggle = (key: "province" | "occupation", code: string) => {
    const current = value[key];
    set(
      key,
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

  const provinceOptions = filters
    ? [...filters.provinces, filters.remote]
    : [];
  const active =
    value.province.length +
    value.occupation.length +
    (value.salaryMin ? 1 : 0) +
    (value.postedWithin ? 1 : 0);

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={value.q}
          onChange={(next) => set("q", next)}
          placeholder="Vị trí tuyển dụng, tên công ty…"
        />

        <MultiSelect
          label="Địa điểm"
          options={provinceOptions}
          selected={value.province}
          onToggle={(code) => toggle("province", code)}
          onClear={() => set("province", [])}
          searchPlaceholder="Nhập Tỉnh/Thành phố"
        />

        <MultiSelect
          label="Ngành nghề"
          options={filters?.occupations ?? []}
          selected={value.occupation}
          onToggle={(code) => toggle("occupation", code)}
          onClear={() => set("occupation", [])}
          searchPlaceholder="Nhập ngành nghề"
        />

        <Select
          aria-label="Mức lương tối thiểu"
          className="w-40"
          value={String(value.salaryMin)}
          onChange={(event) => set("salaryMin", Number(event.target.value))}
        >
          <option value="0">Mọi mức lương</option>
          {SALARY_STEPS.map((step) => (
            <option key={step} value={step * 1_000_000}>
              Từ {step} triệu
            </option>
          ))}
        </Select>

        <Select
          aria-label="Thời gian đăng"
          className="w-40"
          value={String(value.postedWithin)}
          onChange={(event) => set("postedWithin", Number(event.target.value))}
        >
          <option value="0">Mọi thời điểm</option>
          {POSTED_STEPS.map((step) => (
            <option key={step.value} value={step.value}>
              {step.label}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Sắp xếp"
          className="w-44"
          value={value.sort}
          onChange={(event) => set("sort", event.target.value as JobSort)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {active > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {value.province.map((code) => (
            <Chip
              key={`province-${code}`}
              label={labelOf(provinceOptions, code)}
              onRemove={() => toggle("province", code)}
            />
          ))}
          {value.occupation.map((code) => (
            <Chip
              key={`occupation-${code}`}
              label={labelOf(filters?.occupations ?? [], code)}
              onRemove={() => toggle("occupation", code)}
            />
          ))}
          {value.salaryMin > 0 && (
            <Chip
              label={`Từ ${value.salaryMin / 1_000_000} triệu`}
              onRemove={() => set("salaryMin", 0)}
            />
          )}
          {value.postedWithin > 0 && (
            <Chip
              label={`Đăng trong ${value.postedWithin} ngày`}
              onRemove={() => set("postedWithin", 0)}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ ...EMPTY_FILTER, q: value.q, sort: value.sort })}
          >
            Bỏ chọn tất cả
          </Button>
        </div>
      )}
    </div>
  );
}

/** Mã lạ vẫn hiện được ra chữ, thay vì biến chip thành một ô trống. */
const labelOf = (options: FilterOption[], code: string) =>
  options.find((option) => option.code === code)?.name ?? code;

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="bg-primary-50 text-primary-700 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Bỏ lọc ${label}`}
        className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-white/70"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

/**
 * Menu chọn nhiều mục, kèm ô lọc nhanh và số tin của từng mục.
 *
 * Dùng `<button>` + danh sách chứ không phải `<select multiple>`: bản gốc của
 * trình duyệt bắt giữ Ctrl để chọn nhiều, không hiển thị được số đếm, và trên
 * di động thì gần như không dùng được.
 */
function MultiSelect({
  label,
  options,
  selected,
  onToggle,
  onClear,
  searchPlaceholder,
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (code: string) => void;
  onClear: () => void;
  searchPlaceholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [needle, setNeedle] = useState("");
  const root = useRef<HTMLDivElement>(null);

  // Bấm ra ngoài thì đóng. Nghe trên `document` vì cú bấm có thể rơi vào bất kỳ
  // đâu trên trang, không riêng phần tử nào của component này.
  useEffect(() => {
    if (!open) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [open]);

  const normalized = needle.trim().toLowerCase();
  const visible = normalized
    ? options.filter((option) =>
        option.name.toLowerCase().includes(normalized),
      )
    : options;

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={options.length === 0}
        aria-expanded={open}
        className={cn(
          "flex h-10 cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 text-sm shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          selected.length > 0
            ? "border-primary-400 text-primary-700"
            : "border-slate-200 text-slate-700",
        )}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-primary-100 text-primary-700 rounded-full px-1.5 text-xs font-semibold">
            {selected.length}
          </span>
        )}
        <ChevronDown className="size-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute top-11 left-0 z-20 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <input
            value={needle}
            onChange={(event) => setNeedle(event.target.value)}
            placeholder={searchPlaceholder}
            className="focus:border-primary-400 mb-2 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none"
          />

          <ul className="max-h-64 overflow-y-auto">
            {visible.map((option) => {
              const checked = selected.includes(option.code);
              return (
                <li key={option.code}>
                  <button
                    type="button"
                    onClick={() => onToggle(option.code)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border",
                        checked
                          ? "border-primary-500 bg-primary-500 text-white"
                          : "border-slate-300",
                      )}
                    >
                      {checked && <Check className="size-3" />}
                    </span>
                    <span className="flex-1 truncate text-slate-700">
                      {option.name}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {formatCount(option.count)}
                    </span>
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="px-2 py-6 text-center text-xs text-slate-400">
                Không có mục nào khớp
              </li>
            )}
          </ul>

          <div className="mt-1 flex justify-between border-t border-slate-100 pt-2">
            <Button variant="ghost" size="sm" onClick={onClear}>
              Bỏ chọn tất cả
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
