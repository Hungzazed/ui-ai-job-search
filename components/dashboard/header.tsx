"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  List,
  MagnifyingGlass,
  SidebarSimple,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import { toggleSidebar } from "@/lib/sidebar";
import { useSession } from "@/components/dashboard/session";
import { pageTitle } from "@/components/dashboard/nav-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [term, setTerm] = useState("");

  const title = pageTitle(pathname);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = term.trim();
    router.push(
      q ? `/dashboard/jobs?q=${encodeURIComponent(q)}` : "/dashboard/jobs",
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
        aria-label="Mở menu"
      >
        <List className="size-5.5" />
      </button>

      <button
        type="button"
        onClick={toggleSidebar}
        className="hidden size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:flex"
        aria-label="Thu gọn hoặc mở rộng thanh bên"
        title="Thu gọn / mở rộng thanh bên"
      >
        <SidebarSimple className="size-5.5" />
      </button>

      {title && (
        <h1 className="shrink-0 text-sm font-bold tracking-tight text-slate-900">
          {title}
        </h1>
      )}

      {/*
        Ô tìm kiếm ở đây là THẬT, khác hẳn cái đã bị gỡ khỏi chỗ này trước đây:
        nó đẩy thẳng sang `/dashboard/jobs?q=`, tham số mà backend đã hỗ trợ.
        Bản cũ không có handler, không có state, và còn quảng cáo phím tắt "/"
        mà không chỗ nào trong ứng dụng lắng nghe.

        Chuông thông báo và nhãn "Agent Engine: Active" thì KHÔNG quay lại: hệ
        thống không có thông báo, và sức khoẻ gateway đo được thật nằm ở màn Admin.
      */}
      <form onSubmit={submit} className="relative min-w-0 flex-1 sm:max-w-md">
        <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Tìm việc: chức danh, kỹ năng, công ty…"
          aria-label="Tìm việc làm"
          className="pl-9"
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        {/*
          Nhãn vai trò chỉ hiện với ADMIN. "Người dùng" là thứ người đang đăng
          nhập đã biết; giữ lại cho quản trị viên thì nó thành lời nhắc rằng họ
          đang thao tác bằng quyền cao. Danh tính đầy đủ (tên, email, đăng xuất)
          nằm ở chân sidebar, không lặp lại ở đây.
        */}
        {user?.role === "ADMIN" && (
          <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-2xs font-semibold text-amber-900 sm:inline">
            Quản trị viên
          </span>
        )}

        {pathname === "/dashboard" && (
          <Link href="/dashboard/cv-optimizer">
            <Button size="sm">
              <Sparkle className="size-4.5" />
              <span className="hidden sm:inline">Tối ưu CV với AI</span>
              <span className="sm:hidden">Tối ưu CV</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
