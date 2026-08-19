"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export interface SelectOption {
  value: string;
  label: string;
  /** Chữ mờ nép bên phải nhãn — số tin, mã tỉnh, đơn vị… */
  meta?: string;
  disabled?: boolean;
}

/** Vỏ ngoài dùng chung cho cả hai loại menu, để chúng không trôi khỏi nhau. */
const TRIGGER =
  "flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 text-left text-sm shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none";

const MENU =
  "z-50 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5";

/** Vùng chạm 44px là mức tối thiểu dùng được bằng ngón tay. */
const OPTION =
  "flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 text-left text-sm transition-colors sm:min-h-9";

const EMPTY_HINT = "px-2.5 py-6 text-center text-xs text-slate-400";

const GAP = 6;
const EDGE = 8;

interface Anchor {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

/**
 * Toạ độ cố định của menu, đo từ nút mở.
 *
 * Menu treo thẳng ở `<body>` chứ không nằm cạnh nút: bảng và thẻ trong app đều
 * có `overflow` riêng, và một menu `absolute` bên trong chúng sẽ bị cắt cụt —
 * đúng thứ mà `<select>` gốc không bao giờ dính vì trình duyệt vẽ nó ngoài trang.
 */
function measure(el: HTMLElement | null): Anchor | null {
  if (!el) return null;
  const box = el.getBoundingClientRect();
  const below = window.innerHeight - box.bottom - GAP - EDGE;
  const above = box.top - GAP - EDGE;
  const flip = below < 220 && above > below;

  return {
    left: Math.max(EDGE, Math.min(box.left, window.innerWidth - box.width - EDGE)),
    width: box.width,
    maxHeight: Math.max(160, flip ? above : below),
    ...(flip
      ? { bottom: window.innerHeight - box.top + GAP }
      : { top: box.bottom + GAP }),
  };
}

/** Bấm ra ngoài thì đóng. Menu ở portal nên phải hỏi cả hai vùng, không chỉ nút. */
function useDismiss(
  open: boolean,
  zones: RefObject<HTMLElement | null>[],
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (zones.some((zone) => zone.current?.contains(target))) return;
      onClose();
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);
}

/** Menu treo ở toạ độ cố định nên phải bám theo trang mỗi khi trang cuộn. */
function useReanchor(
  open: boolean,
  trigger: RefObject<HTMLElement | null>,
  setAnchor: (anchor: Anchor | null) => void,
) {
  useEffect(() => {
    if (!open) return;
    const follow = () => setAnchor(measure(trigger.current));
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [open, trigger, setAnchor]);
}

/** Kéo mục đang trỏ vào vùng nhìn thấy khi di chuyển bằng bàn phím. */
function useScrollIntoView(id: string | undefined, open: boolean) {
  useEffect(() => {
    if (!open || !id) return;
    document.getElementById(id)?.scrollIntoView({ block: "nearest" });
  }, [id, open]);
}

/** Khung menu treo ở `<body>`. */
function Popover({
  anchor,
  panelRef,
  className,
  children,
}: {
  anchor: Anchor;
  panelRef: RefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
}) {
  const style: CSSProperties = {
    position: "fixed",
    left: anchor.left,
    top: anchor.top,
    bottom: anchor.bottom,
    minWidth: anchor.width,
  };

  return createPortal(
    <div ref={panelRef} style={style} className={cn(MENU, className)}>
      {children}
    </div>,
    document.body,
  );
}

/** Bỏ dấu để gõ "ha noi" vẫn tìm ra "Hà Nội". */
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();

/** Mục kế tiếp theo hướng đi, bỏ qua mục bị khoá. Vòng lại khi chạm mép. */
function step(options: SelectOption[], from: number, delta: number): number {
  if (options.length === 0) return -1;
  const base = from >= 0 ? from : delta > 0 ? -1 : 0;
  for (let hop = 1; hop <= options.length; hop += 1) {
    const next = (base + delta * hop + options.length * hop) % options.length;
    if (!options[next].disabled) return next;
  }
  return from;
}

const firstEnabled = (options: SelectOption[]) =>
  options.findIndex((option) => !option.disabled);

const lastEnabled = (options: SelectOption[]) => {
  for (let i = options.length - 1; i >= 0; i -= 1) {
    if (!options[i].disabled) return i;
  }
  return -1;
};

/**
 * Menu chọn MỘT mục, thay cho `<select>` gốc.
 *
 * Danh sách xổ ra của `<select>` do hệ điều hành vẽ nên không tô lại được: nó
 * luôn lạc khỏi bảng màu của app. Đổi lấy quyền tự vẽ thì phải tự cài lại phần
 * mà thẻ gốc cho không — ARIA và bàn phím — nên đừng cắt phần đó đi.
 */
export function Select({
  value,
  options,
  onChange,
  placeholder = "Chọn…",
  disabled,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [active, setActive] = useState(-1);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const typed = useRef({ needle: "", at: 0 });
  const listId = useId();

  const open = anchor !== null;
  const close = useCallback(() => setAnchor(null), []);
  useDismiss(open, useMemo(() => [trigger, panel], []), close);
  useReanchor(open, trigger, setAnchor);

  const selected = options.findIndex((option) => option.value === value);
  const activeId = active >= 0 ? `${listId}-${active}` : undefined;
  useScrollIntoView(activeId, open);

  const openWith = (index: number) => {
    setActive(index >= 0 ? index : firstEnabled(options));
    setAnchor(measure(trigger.current));
  };

  const commit = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    close();
    trigger.current?.focus();
  };

  /** Gõ chữ để nhảy tới mục, gộp các phím bấm cách nhau dưới 800ms. */
  const jumpTo = (char: string) => {
    const now = Date.now();
    typed.current = {
      needle: (now - typed.current.at < 800 ? typed.current.needle : "") + char,
      at: now,
    };
    const needle = fold(typed.current.needle);
    const found = options.findIndex(
      (option) => !option.disabled && fold(option.label).startsWith(needle),
    );
    if (found < 0) return;
    if (open) setActive(found);
    else commit(found);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Dấu cách chỉ là chữ khi đang gõ dở một cụm; đứng một mình nó là phím chọn.
    const typing = Date.now() - typed.current.at < 800;
    const printable =
      event.key.length === 1 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      (event.key !== " " || typing);

    if (printable) {
      event.preventDefault();
      jumpTo(event.key);
      return;
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        const delta = event.key === "ArrowDown" ? 1 : -1;
        if (!open) openWith(selected >= 0 ? selected : firstEnabled(options));
        else setActive((current) => step(options, current, delta));
        break;
      }
      case "Home":
      case "End": {
        if (!open) return;
        event.preventDefault();
        setActive(
          event.key === "Home" ? firstEnabled(options) : lastEnabled(options),
        );
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (open) commit(active);
        else openWith(selected);
        break;
      }
      case "Escape": {
        if (!open) return;
        event.preventDefault();
        close();
        break;
      }
      case "Tab": {
        close();
        break;
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? activeId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled}
        onClick={() => (open ? close() : openWith(selected))}
        onKeyDown={onKeyDown}
        className={cn(
          TRIGGER,
          open
            ? "border-primary-400 ring-primary-100 ring-2"
            : "border-slate-200 hover:border-slate-300",
        )}
      >
        <span
          className={cn(
            "flex-1 truncate",
            selected >= 0 ? "text-slate-900" : "text-slate-400",
          )}
        >
          {selected >= 0 ? options[selected].label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-slate-400 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {anchor && (
        <Popover anchor={anchor} panelRef={panel}>
          <ul
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={{ maxHeight: anchor.maxHeight }}
            className="overflow-y-auto"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === selected}
                aria-disabled={option.disabled}
                // `mousedown` chứ không `click`: chuột nhả ra sau khi menu đã
                // đóng thì cú click rơi vào khoảng không và lựa chọn im lặng mất.
                onMouseDown={(event) => {
                  event.preventDefault();
                  commit(index);
                }}
                onMouseEnter={() => !option.disabled && setActive(index)}
                className={cn(
                  OPTION,
                  option.disabled && "cursor-not-allowed text-slate-300",
                  !option.disabled &&
                    index === active &&
                    "bg-slate-50 text-slate-900",
                  index === selected && "text-primary-700 font-medium",
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {option.meta && (
                  <span className="font-mono text-xs text-slate-400">
                    {option.meta}
                  </span>
                )}
                <Check
                  className={cn(
                    "text-primary-600 size-4 shrink-0",
                    index === selected ? "opacity-100" : "opacity-0",
                  )}
                />
              </li>
            ))}
            {options.length === 0 && (
              <li className={EMPTY_HINT}>Chưa có mục nào</li>
            )}
          </ul>
        </Popover>
      )}
    </div>
  );
}

/**
 * Menu chọn NHIỀU mục, kèm ô lọc nhanh.
 *
 * Không dùng `<select multiple>`: bản gốc bắt giữ Ctrl để chọn nhiều, không
 * hiện được số đếm, và trên di động thì gần như không dùng được.
 */
export function MultiSelect({
  label,
  options,
  selected,
  onToggle,
  onClear,
  searchPlaceholder,
  className,
}: {
  label: string;
  options: SelectOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  searchPlaceholder: string;
  className?: string;
}) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [needle, setNeedle] = useState("");
  const [active, setActive] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const listId = useId();

  const open = anchor !== null;
  const close = useCallback(() => setAnchor(null), []);
  useDismiss(open, useMemo(() => [trigger, panel], []), close);
  useReanchor(open, trigger, setAnchor);

  const visible = useMemo(() => {
    const wanted = fold(needle.trim());
    return wanted
      ? options.filter((option) => fold(option.label).includes(wanted))
      : options;
  }, [needle, options]);

  const activeId = active < visible.length ? `${listId}-${active}` : undefined;
  useScrollIntoView(activeId, open);

  const shut = () => {
    close();
    trigger.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        setActive((current) =>
          step(visible, current, event.key === "ArrowDown" ? 1 : -1),
        );
        break;
      }
      case "Enter": {
        event.preventDefault();
        if (visible[active]) onToggle(visible[active].value);
        break;
      }
      case "Escape": {
        event.preventDefault();
        shut();
        break;
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={options.length === 0}
        onClick={() => {
          setActive(0);
          if (open) close();
          else setAnchor(measure(trigger.current));
        }}
        className={cn(
          TRIGGER,
          "w-auto",
          selected.length > 0
            ? "border-primary-400 text-primary-700"
            : "border-slate-200 text-slate-700 hover:border-slate-300",
          open && "ring-primary-100 ring-2",
        )}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-primary-100 text-primary-700 rounded-full px-1.5 text-xs font-semibold">
            {selected.length}
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-slate-400 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {anchor && (
        <Popover anchor={anchor} panelRef={panel} className="w-72">
          <div className="relative mb-1.5">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={activeId}
              aria-label={searchPlaceholder}
              value={needle}
              // Lọc lại thì mục đang trỏ có thể rơi ra ngoài danh sách còn lại.
              onChange={(event) => {
                setNeedle(event.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className="focus:border-primary-400 focus:ring-primary-100 h-9 w-full rounded-lg border border-slate-200 pr-3 pl-8.5 text-sm outline-none focus:ring-2"
            />
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-multiselectable
            aria-label={label}
            style={{ maxHeight: Math.max(140, anchor.maxHeight - 104) }}
            className="overflow-y-auto"
          >
            {visible.map((option, index) => {
              const checked = selected.includes(option.value);
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={checked}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onToggle(option.value);
                  }}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    OPTION,
                    index === active && "bg-slate-50",
                    checked ? "text-primary-700 font-medium" : "text-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                      checked
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-slate-300",
                    )}
                  >
                    {checked && <Check className="size-3" />}
                  </span>
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.meta && (
                    <span className="font-mono text-xs text-slate-400">
                      {option.meta}
                    </span>
                  )}
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className={EMPTY_HINT}>Không có mục nào khớp</li>
            )}
          </ul>

          <div className="mt-1 flex justify-between border-t border-slate-100 pt-1.5">
            <Button variant="ghost" size="sm" onClick={onClear}>
              Bỏ chọn tất cả
            </Button>
            <Button size="sm" onClick={shut}>
              Áp dụng
            </Button>
          </div>
        </Popover>
      )}
    </div>
  );
}

/** Thẻ tóm tắt một bộ lọc đang bật, bấm X để bỏ. */
export function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
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
