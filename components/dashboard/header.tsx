"use client";

import { Menu } from "lucide-react";
import { useSession } from "@/components/dashboard/session";
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

      {/*
        Ba thứ đã bị gỡ khỏi đây, tất cả đều là giao diện không nối vào gì:

        - **Ô tìm kiếm**: không có handler, không có state, và placeholder còn
          quảng cáo phím tắt "/" mà không chỗ nào trong ứng dụng lắng nghe. Tìm
          kiếm thật đã có ở màn Tất cả việc làm, nơi backend hỗ trợ `?q=`.
        - **Chuông thông báo**: chấm đỏ "chưa đọc" hiện vĩnh viễn trong khi không
          có hệ thống thông báo nào tồn tại.
        - **Nhãn "Agent Engine: Active"**: chữ cứng, không bao giờ phản ánh trạng
          thái thật. Sức khoẻ gateway đo được thật thì nằm ở màn Admin.
      */}
      <div className="ml-auto flex items-center gap-3">
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
            <p className="font-mono text-2xs text-slate-400">
              {user?.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
