"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Ô tìm kiếm có biểu tượng kính lúp và nút xoá nhanh. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative min-w-56 flex-1", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="focus:border-primary-400 focus:ring-primary-100 h-10 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-10 text-sm shadow-sm outline-none focus:ring-2"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Xoá tìm kiếm"
          className="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-700"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
