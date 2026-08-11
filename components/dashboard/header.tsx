"use client";

import { Bell, Menu, Search, Sparkles } from "lucide-react";
import { useSession } from "@/components/dashboard/session";
import { Badge } from "@/components/ui/badge";
import { personInitials } from "@/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, loading } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
        aria-label="Mở menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Search Input */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Tìm việc làm, kỹ năng, công ty... (bấm / để tìm nhanh)"
          className="h-9.5 w-full rounded-lg border border-slate-200/90 bg-slate-50/70 pl-9.5 pr-4 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Status indicator & User menu */}
      <div className="ml-auto flex items-center gap-3">
        {/* AI Status Badge */}
        <Badge variant="success" dot className="hidden md:inline-flex bg-emerald-50 text-emerald-800 font-mono text-[11px]">
          Agent Engine: Active
        </Badge>

        <button
          type="button"
          className="relative flex size-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 active:translate-y-[1px]"
          aria-label="Thông báo"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="hidden items-center gap-2.5 border-l border-slate-200/80 pl-3 sm:flex">
          <div className="bg-primary-600 flex size-8.5 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs">
            {loading ? "…" : personInitials(user?.name)}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-slate-900">
              {loading ? "Đang tải…" : (user?.name ?? "Chưa đăng nhập")}
            </p>
            {/* Vai trò thật từ backend, thay cho nhãn "Basic Tier" bịa ra:
                hệ thống chỉ có hai vai trò USER và ADMIN, không có gói dịch vụ. */}
            <p className="font-mono text-[11px] text-slate-400">
              {user?.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
