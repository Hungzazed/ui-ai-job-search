import { cn } from "@/utils";

export interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "scrollbar-thin flex w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "shrink-0 cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-white text-primary-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

interface CountTabsProps<T extends string> {
  tabs: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  /** Số bên cạnh mỗi nhãn; thiếu khoá nào thì hiện 0. */
  counts?: Partial<Record<T, number>>;
  className?: string;
}

/**
 * Dạng viên thuốc kèm số đếm, dùng khi con số là một phần của lựa chọn.
 *
 * Tách khỏi `Tabs` chứ không thêm cờ: hai kiểu này khác nhau cả về hình lẫn về
 * việc chúng trả lời câu hỏi gì — `Tabs` chuyển khung nhìn, còn cái này lọc một
 * danh sách và nói trước mỗi bộ lọc còn lại bao nhiêu dòng.
 */
export function CountTabs<T extends string>({
  tabs,
  value,
  onChange,
  counts,
  className,
}: CountTabsProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium",
              active
                ? "bg-primary-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs",
                active ? "bg-white/20" : "bg-slate-100 text-slate-500",
              )}
            >
              {counts?.[tab.value] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
