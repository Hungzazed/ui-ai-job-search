"use client";

import { useMemo } from "react";
import type { FilterOption, JobFilters, JobSort } from "@/services";
import { Button } from "@/components/ui/button";
import {
  FilterChip,
  MultiSelect,
  Select,
  type SelectOption,
} from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { formatCount } from "@/utils";

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

const SORT_OPTIONS: SelectOption[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "salary", label: "Lương cao nhất" },
  { value: "match", label: "Điểm AI Match" },
];

/** Mốc lương, đơn vị triệu đồng. Khớp với các bậc portal Việt Nam hay dùng. */
const SALARY_STEPS = [10, 15, 20, 30, 50];

const SALARY_OPTIONS: SelectOption[] = [
  { value: "0", label: "Mọi mức lương" },
  ...SALARY_STEPS.map((step) => ({
    value: String(step * 1_000_000),
    label: `Từ ${step} triệu`,
  })),
];

const POSTED_OPTIONS: SelectOption[] = [
  { value: "0", label: "Mọi thời điểm" },
  { value: "1", label: "Trong 24 giờ" },
  { value: "3", label: "Trong 3 ngày" },
  { value: "7", label: "Trong 7 ngày" },
  { value: "30", label: "Trong 30 ngày" },
];

/** Danh mục của backend đổi sang hình dạng mà menu chung nhận. */
const toOptions = (filters: FilterOption[]): SelectOption[] =>
  filters.map((option) => ({
    value: option.code,
    label: option.name,
    meta: formatCount(option.count),
  }));

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

  const provinces = useMemo(
    () => (filters ? [...filters.provinces, filters.remote] : []),
    [filters],
  );
  const occupations = useMemo(
    () => filters?.occupations ?? [],
    [filters],
  );

  const provinceOptions = useMemo(() => toOptions(provinces), [provinces]);
  const occupationOptions = useMemo(() => toOptions(occupations), [occupations]);

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
          options={occupationOptions}
          selected={value.occupation}
          onToggle={(code) => toggle("occupation", code)}
          onClear={() => set("occupation", [])}
          searchPlaceholder="Nhập ngành nghề"
        />

        <Select
          aria-label="Mức lương tối thiểu"
          className="w-40"
          options={SALARY_OPTIONS}
          value={String(value.salaryMin)}
          onChange={(next) => set("salaryMin", Number(next))}
        />

        <Select
          aria-label="Thời gian đăng"
          className="w-40"
          options={POSTED_OPTIONS}
          value={String(value.postedWithin)}
          onChange={(next) => set("postedWithin", Number(next))}
        />

        <Select
          aria-label="Sắp xếp"
          className="w-44"
          options={SORT_OPTIONS}
          value={value.sort}
          onChange={(next) => set("sort", next as JobSort)}
        />
      </div>

      {active > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {value.province.map((code) => (
            <FilterChip
              key={`province-${code}`}
              label={labelOf(provinces, code)}
              onRemove={() => toggle("province", code)}
            />
          ))}
          {value.occupation.map((code) => (
            <FilterChip
              key={`occupation-${code}`}
              label={labelOf(occupations, code)}
              onRemove={() => toggle("occupation", code)}
            />
          ))}
          {value.salaryMin > 0 && (
            <FilterChip
              label={`Từ ${value.salaryMin / 1_000_000} triệu`}
              onRemove={() => set("salaryMin", 0)}
            />
          )}
          {value.postedWithin > 0 && (
            <FilterChip
              label={`Đăng trong ${value.postedWithin} ngày`}
              onRemove={() => set("postedWithin", 0)}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({ ...EMPTY_FILTER, q: value.q, sort: value.sort })
            }
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
