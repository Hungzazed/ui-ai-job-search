"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Briefcase,
  CalendarDots,
  CaretDown,
  Check,
  MapPin,
  Money,
  PaperPlaneRight,
  SortDescending,
  X,
} from "@phosphor-icons/react/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type {
  FilterOption,
  JobFilters,
  JobSort,
  OccupationOption,
} from "@/services";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { OccupationPicker } from "@/components/dashboard/occupation-picker";
import { cn, formatCount } from "@/utils";

export interface JobFilterValue {
  q: string;
  province: string[];
  occupation: string[];
  salaryMin: number;
  postedWithin: number;
  sort: JobSort;
  saved: boolean;
  applied: boolean;
  subOccupation: string[];
}

export const EMPTY_FILTER: JobFilterValue = {
  q: "",
  province: [],
  occupation: [],
  salaryMin: 0,
  postedWithin: 0,
  sort: "newest",
  saved: false,
  applied: false,
  subOccupation: [],
};

const SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "salary", label: "Lương cao nhất" },
  { value: "match", label: "Điểm AI Match" },
];
const SALARY_STEPS = [10, 15, 20, 30, 50];

const POSTED_STEPS = [
  { value: 1, label: "Trong 24 giờ" },
  { value: 3, label: "Trong 3 ngày" },
  { value: 7, label: "Trong 7 ngày" },
  { value: 30, label: "Trong 30 ngày" },
];
export function JobFilterBar({
  value,
  filters,
  onChange,
}: {
  value: JobFilterValue;
  
  filters: JobFilters | null;
  onChange: (next: JobFilterValue) => void;
}) {
  const set = <K extends keyof JobFilterValue>(
    key: K,
    next: JobFilterValue[K],
  ) => onChange({ ...value, [key]: next });

  const toggle = (
    key: "province" | "occupation" | "subOccupation",
    code: string,
  ) => {
    const current = value[key];
    set(
      key,
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

  const provinceOptions = filters
    ? [filters.remote, ...filters.provinces]
        .filter(
          (option) => option.count > 0 || value.province.includes(option.code),
        )
        .sort((a, b) => b.count - a.count)
    : [];

  const active =
    value.province.length +
    value.occupation.length +
    value.subOccupation.length +
    (value.salaryMin ? 1 : 0) +
    (value.postedWithin ? 1 : 0) +
    (value.saved ? 1 : 0) +
    (value.applied ? 1 : 0);

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="mb-4 space-y-2.5">
      <OccupationPicker
        open={pickerOpen}
        groups={filters?.occupations ?? []}
        selectedGroups={value.occupation}
        selectedSubs={value.subOccupation}
        onClose={() => setPickerOpen(false)}
        onApply={(next) => {
          setPickerOpen(false);
          onChange({
            ...value,
            occupation: next.groups,
            subOccupation: next.subs,
          });
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          className="min-w-72 flex-1"
          value={value.q}
          onChange={(next) => set("q", next)}
          placeholder="Vị trí tuyển dụng, tên công ty…"
        />

        <MultiSelect
          label="Địa điểm"
          icon={MapPin}
          align="right"
          className="w-full sm:w-60"
          options={provinceOptions}
          selected={value.province}
          onToggle={(code) => toggle("province", code)}
          onClear={() => set("province", [])}
          searchPlaceholder="Nhập Tỉnh/Thành phố"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Toggle
          label="Đã lưu"
          icon={Bookmark}
          active={value.saved}
          onClick={() => set("saved", !value.saved)}
        />
        <Toggle
          label="Đã ứng tuyển"
          icon={PaperPlaneRight}
          active={value.applied}
          onClick={() => set("applied", !value.applied)}
        />

        <TriggerButton
          icon={Briefcase}
          label="Ngành nghề"
          active={value.occupation.length + value.subOccupation.length > 0}
          open={pickerOpen}
          onClick={() => setPickerOpen(true)}
        >
          {value.occupation.length + value.subOccupation.length > 0 && (
            <span className="bg-primary-100 text-primary-700 rounded-full px-1.5 text-xs font-semibold">
              {value.occupation.length + value.subOccupation.length}
            </span>
          )}
        </TriggerButton>
        <SingleSelect
          label="Mọi mức lương"
          icon={Money}
          value={value.salaryMin}
          onChange={(next) => set("salaryMin", next)}
          options={[
            { value: 0, label: "Mọi mức lương" },
            ...SALARY_STEPS.map((step) => ({
              value: step * 1_000_000,
              label: `Từ ${step} triệu`,
            })),
          ]}
        />

        <SingleSelect
          label="Mọi thời điểm"
          icon={CalendarDots}
          value={value.postedWithin}
          onChange={(next) => set("postedWithin", next)}
          options={[
            { value: 0, label: "Mọi thời điểm" },
            ...POSTED_STEPS.map((step) => ({
              value: step.value,
              label: step.label,
            })),
          ]}
        />
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
          {value.subOccupation.map((code) => (
            <Chip
              key={`sub-${code}`}
              label={subLabelOf(filters?.occupations ?? [], code)}
              onRemove={() => toggle("subOccupation", code)}
            />
          ))}
          {value.saved && (
            <Chip label="Đã lưu" onRemove={() => set("saved", false)} />
          )}
          {value.applied && (
            <Chip label="Đã ứng tuyển" onRemove={() => set("applied", false)} />
          )}
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
function Toggle({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: PhosphorIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-sm shadow-sm transition-colors",
        active
          ? "border-primary-400 bg-primary-50 text-primary-700"
          : "border-slate-200 bg-white text-slate-700",
      )}
    >
      
      <Icon
        className={cn(
          "size-4.5 shrink-0",
          active ? "text-primary-500" : "text-slate-400",
        )}
      />
      {label}
    </button>
  );
}
export function SortSelect({
  value,
  onChange,
}: {
  value: JobSort;
  onChange: (next: JobSort) => void;
}) {
  return (
    <SingleSelect
      label="Sắp xếp"
      icon={SortDescending}
      align="right"
      value={value}
      options={SORT_OPTIONS}
      onChange={onChange}
    />
  );
}
const labelOf = (options: FilterOption[], code: string) =>
  options.find((option) => option.code === code)?.name ?? code;

const subLabelOf = (groups: OccupationOption[], code: string) =>
  groups.flatMap((group) => group.subs ?? []).find((sub) => sub.code === code)
    ?.name ?? code;

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
        <X className="size-3.5" />
      </button>
    </span>
  );
}
function useDropdown() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [open]);

  return { open, setOpen, root };
}
function TriggerButton({
  icon: Icon,
  label,
  active,
  open,
  onClick,
  className,
  children,
}: {
  icon: PhosphorIcon;
  label: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={cn(
        "flex h-10 cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 text-sm whitespace-nowrap shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? "border-primary-400 text-primary-700"
          : "border-slate-200 text-slate-700",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-4.5 shrink-0",
          active ? "text-primary-500" : "text-slate-400",
        )}
      />
      {label}
      {children}
      <CaretDown className="size-4.5 shrink-0 text-slate-400" />
    </button>
  );
}
function SingleSelect<T extends string | number>({
  label,
  icon,
  value,
  options,
  onChange,
  align = "left",
  className,
}: {
  label: string;
  icon: PhosphorIcon;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const { open, setOpen, root } = useDropdown();
  const current = options.find((option) => option.value === value);
  const active = value !== options[0]?.value;

  return (
    <div ref={root} className={cn("relative", className)}>
      <TriggerButton
        className="w-full"
        icon={icon}
        label={current?.label ?? label}
        active={active}
        open={open}
        onClick={() => setOpen((state) => !state)}
      />

      {open && (
        <div
          className={cn(
            "absolute top-11 z-20 w-max min-w-full max-w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-slate-50",
                option.value === value
                  ? "text-primary-700 font-medium"
                  : "text-slate-700",
              )}
            >
              {option.label}
              {option.value === value && (
                <Check className="text-primary-600 size-4.5 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiSelect({
  label,
  icon: Icon,
  className,
  align = "left",
  options,
  selected,
  onToggle,
  onClear,
  searchPlaceholder,
}: {
  label: string;
  icon: PhosphorIcon;
  className?: string;
  
  align?: "left" | "right";
  options: FilterOption[];
  selected: string[];
  onToggle: (code: string) => void;
  onClear: () => void;
  searchPlaceholder: string;
}) {
  const { open, setOpen, root } = useDropdown();
  const [needle, setNeedle] = useState("");

  const normalized = needle.trim().toLowerCase();
  const visible = normalized
    ? options.filter((option) => option.name.toLowerCase().includes(normalized))
    : options;

  return (
    <div ref={root} className={cn("relative", className)}>
      <TriggerButton
        className="w-full"
        icon={Icon}
        label={label}
        active={selected.length > 0}
        open={open}
        onClick={() => setOpen((current) => !current)}
      >
        {selected.length > 0 && (
          <span className="bg-primary-100 text-primary-700 rounded-full px-1.5 text-xs font-semibold">
            {selected.length}
          </span>
        )}
      </TriggerButton>

      {open && (
        <div
          className={cn(
            "absolute top-11 z-20 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
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
                      {checked && <Check className="size-3.5" />}
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
