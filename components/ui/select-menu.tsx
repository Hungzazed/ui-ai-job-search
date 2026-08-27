"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CaretDown, Check, MagnifyingGlass } from "@phosphor-icons/react/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn, fold } from "@/utils";

export interface SelectMenuOption<T extends string | number> {
  value: T;
  label: string;
  /*
    Dòng phụ mờ hơn dưới nhãn - tên công ty, mã tỉnh, thứ gì đó phân biệt hai
    lựa chọn trùng tên. Cũng được tính vào khi gõ tìm.
  */
  hint?: string;
}

interface SelectMenuProps<T extends string | number> {
  value: T;
  options: SelectMenuOption<T>[];
  onChange: (next: T) => void;
  /*
    Chữ hiện trên nút khi chưa có lựa chọn nào khớp. Ở dáng `chip` nó còn là
    nhãn cố định của bộ lọc.
  */
  label: string;
  icon?: PhosphorIcon;
  disabled?: boolean;
  align?: "left" | "right";
  className?: string;
  /*
    `chip` là nút lọc tròn trên trang việc làm: đổi màu khi khác mặc định.
    `field` là ô nhập trong biểu mẫu: rộng hết khung, luôn một màu viền.
  */
  variant?: "chip" | "field";
  /** Đặt chuỗi này thì hiện ô gõ tìm ở đầu danh sách. */
  searchPlaceholder?: string;
  /** Trỏ từ `<label htmlFor>` sang nút mở, cho ô nhập trong biểu mẫu. */
  id?: string;
}

/**
 * Danh sách chọn một, tự dựng thay cho `<select>` gốc.
 *
 * Lý do không dùng `<select>`: trình duyệt vẽ danh sách bung ra bằng widget của
 * hệ điều hành, nên nó KHÔNG nhận CSS của trang - không bo góc, không theo chủ
 * đề tối, không xuống được hai dòng để kèm tên công ty, và không nhét được ô gõ
 * tìm. Với danh sách vài chục việc làm thì ba thứ đó đều cần.
 *
 * Đổi lại phải tự lo bàn phím và việc đóng khi bấm ra ngoài - phần bên dưới.
 */
export function SelectMenu<T extends string | number>({
  value,
  options,
  onChange,
  label,
  icon: Icon,
  disabled,
  align = "left",
  className,
  variant = "chip",
  searchPlaceholder,
  id,
}: SelectMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const listId = useId();

  const current = options.find((option) => option.value === value);
  const field = variant === "field";
  const active = field ? Boolean(current) : value !== options[0]?.value;

  const shown = useMemo(() => {
    const needle = fold(query.trim());
    if (!needle) return options;
    return options.filter((option) =>
      fold(`${option.label} ${option.hint ?? ""}`).includes(needle),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [open]);

  useEffect(() => {
    if (open) search.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    list.current
      ?.querySelector<HTMLElement>(`[data-at="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor, open]);

  /*
    Đặt lại ngay lúc mở chứ không để trong `useEffect`: gọi `setState` trong
    effect sẽ sinh thêm một vòng vẽ sau khi danh sách đã hiện, nên con trỏ chớp
    từ dòng đầu sang dòng đang chọn - vừa thấy được vừa bị eslint chặn.

    Xoá chữ đã gõ và đặt con trỏ lên đúng dòng đang chọn, để bấm mở rồi gõ mũi
    tên là đi tiếp từ chỗ hiện tại chứ không nhảy về đầu danh sách.
  */
  const openMenu = () => {
    setQuery("");
    const at = options.findIndex((option) => option.value === value);
    setCursor(at < 0 ? 0 : at);
    setOpen(true);
  };

  const commit = (next: T) => {
    onChange(next);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setCursor((at) => {
        if (shown.length === 0) return 0;
        return (at + step + shown.length) % shown.length;
      });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const picked = shown[cursor];
      if (picked) commit(picked.value);
    }
  };

  return (
    <div
      ref={root}
      className={cn("relative", field && "w-full", className)}
      onKeyDown={onKeyDown}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={cn(
          "flex w-full items-center gap-2 border bg-white text-sm shadow-sm transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "focus:border-primary-500 focus:ring-primary-100 focus:ring-2 focus:outline-none",
          field
            ? "h-10 rounded-lg px-3 text-left"
            : "h-10 rounded-xl px-3 whitespace-nowrap",
          active && !field
            ? "border-primary-400 text-primary-700"
            : "border-slate-200 text-slate-700",
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "size-4.5 shrink-0",
              active && !field ? "text-primary-500" : "text-slate-400",
            )}
          />
        )}
        <span
          className={cn(
            "truncate",
            field && "flex-1",
            field && !current && "text-slate-400",
          )}
        >
          {current?.label ?? label}
        </span>
        <CaretDown
          className={cn(
            "size-4.5 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          className={cn(
            "absolute top-11 z-20 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg",
            field ? "w-full" : "w-max min-w-full max-w-72",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {searchPlaceholder && (
            <div className="relative mb-1.5">
              <MagnifyingGlass className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={search}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCursor(0);
                }}
                placeholder={searchPlaceholder}
                className="focus:border-primary-500 w-full rounded-lg border border-slate-200 py-1.5 pr-2.5 pl-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          )}

          <div ref={list} className="scrollbar-thin max-h-72 overflow-y-auto">
            {shown.length === 0 ? (
              <p className="px-2.5 py-3 text-center text-xs text-slate-500">
                Không có mục nào khớp
              </p>
            ) : (
              shown.map((option, at) => (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  data-at={at}
                  aria-selected={option.value === value}
                  onMouseEnter={() => setCursor(at)}
                  onClick={() => commit(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    at === cursor && "bg-slate-50",
                    option.value === value
                      ? "text-primary-700 font-medium"
                      : "text-slate-700",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.hint && (
                      <span className="block truncate text-xs text-slate-500">
                        {option.hint}
                      </span>
                    )}
                  </span>
                  {option.value === value && (
                    <Check className="text-primary-600 size-4.5 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
