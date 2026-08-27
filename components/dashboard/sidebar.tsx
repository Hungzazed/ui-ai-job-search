"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Lightning, SignOut } from "@phosphor-icons/react/ssr";
import { cn, personInitials } from "@/utils";
import { useSession } from "@/components/dashboard/session";
import { navItems } from "@/components/dashboard/nav-items";
import { BrandLogo } from "@/components/dashboard/brand-logo";

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading, logout } = useSession();

  /**
   * Mục khớp DÀI NHẤT thắng, chỉ một mục sáng tại một thời điểm.
   *
   * So cả query string, không chỉ pathname: "Việc làm phù hợp" và "Tất cả việc
   * làm" cùng trỏ `/dashboard/jobs`, chỉ khác `?scored=1`. `usePathname()` bỏ
   * query nên hai mục sẽ cùng khớp và mục sai sáng lên.
   */
  const activeHref = useMemo(() => {
    const query = searchParams.toString();
    const current = query ? `${pathname}?${query}` : pathname;

    const matched = navItems.filter((item) => {
      const [itemPath, itemQuery] = item.href.split("?");
      if (itemQuery) return current === item.href;
      // Mục không có query chỉ khớp khi URL cũng không có query, nếu không nó
      // sẽ nuốt luôn mọi biến thể lọc của chính đường dẫn đó.
      if (query && pathname === itemPath) return false;
      return item.exact
        ? pathname === itemPath
        : pathname === itemPath || pathname.startsWith(`${itemPath}/`);
    });

    return matched.sort((a, b) => b.href.length - a.href.length)[0]?.href;
  }, [pathname, searchParams]);

  return (
    <aside className="flex h-full w-(--sidebar-width) shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-white transition-[width] duration-200 ease-out">
      {/* Brand */}
      <div className="flex h-[65px] w-64 shrink-0 items-center border-b border-slate-100 pl-6">
        <BrandLogo className="h-[30.52px] w-[106.58px] shrink-0" />
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin w-64 flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === activeHref;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary-50 text-primary-900 font-semibold border-l-2 border-primary-600 pl-2.5"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className={cn("size-4.5 shrink-0", active ? "text-primary-600" : "text-slate-400")} />
              {/* Trước đây có một Badge "24" viết cứng cạnh "Việc làm phù hợp",
                  hiện đúng con số đó cho mọi tài khoản bất kể thực tế có bao
                  nhiêu. Số thật đã có ở màn Tổng quan, lấy từ backend. */}
              <span data-sidebar-label className="truncate">
                {label}
              </span>
            </Link>
          );
        })}

        {user?.role === "ADMIN" && (
          <div className="!mt-4 border-t border-slate-100/90 pt-3">
            <Link
              href="/admin"
              title="Admin Control Panel"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150",
                pathname.startsWith("/admin")
                  ? "bg-primary-50 text-primary-900 font-semibold border-l-2 border-primary-600 pl-2.5"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Lightning className="size-4.5 shrink-0 text-slate-400" />
              <span data-sidebar-label className="truncate">
                Admin Control Panel
              </span>
            </Link>
          </div>
        )}
      </nav>

      {/* Ở đây từng có thẻ "Nâng cấp Pro Agent" hứa "CV tối ưu không giới hạn &
          RPA tự động ứng tuyển", với một nút không có onClick. Hệ thống không có
          gói dịch vụ, không có thanh toán, và RPA tự động ứng tuyển thì chưa tồn
          tại — quảng cáo cả ba thứ đó là hứa suông. */}

      {/* Profile card */}
      <div className="flex shrink-0 items-center gap-2.5 border-t border-slate-100 px-4 py-3 collapsed:flex-col collapsed:gap-2 collapsed:px-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-100 text-xs font-bold text-slate-800">
          {loading ? "…" : personInitials(user?.name)}
        </div>
        <div className="min-w-0 flex-1 leading-tight collapsed:hidden">
          <p className="truncate text-xs font-semibold text-slate-900">
            {loading ? "Đang tải…" : (user?.name ?? "Chưa đăng nhập")}
          </p>
          <p className="truncate font-mono text-2xs text-slate-400">
            {user?.email ?? ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          title="Đăng xuất"
          aria-label="Đăng xuất"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <SignOut className="size-4.5" />
        </button>
      </div>
    </aside>
  );
}
