"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  GraduationCap,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Send,
  Settings,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { cn, personInitials } from "@/utils";
import { useSession } from "@/components/dashboard/session";

const navItems = [
  { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Hồ sơ của tôi", href: "/dashboard/profile", icon: User },
  { label: "Việc làm phù hợp", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Tất cả việc làm", href: "/dashboard/jobs/all", icon: Layers },
  { label: "CV Optimizer", href: "/dashboard/cv-optimizer", icon: FileText },
  { label: "Cover Letter", href: "/dashboard/cover-letter", icon: Mail },
  { label: "Ứng tuyển", href: "/dashboard/applications/apply", icon: Send },
  { label: "Lịch sử ứng tuyển", href: "/dashboard/applications", icon: History },
  { label: "Chuẩn bị phỏng vấn", href: "/dashboard/interview", icon: MessageSquare },
  { label: "Lộ trình học", href: "/dashboard/upskill", icon: GraduationCap },
  // Nhãn phải khớp tiêu đề trang ("Tài khoản"). Trước đây sidebar ghi "Thiết
  // lập" trong khi trang hiện "Tài khoản" — người dùng bấm một chữ rồi đọc thấy
  // chữ khác, và đó là kiểu lệch chỉ lộ ra khi xem màn hình thật.
  { label: "Tài khoản", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, loading, logout } = useSession();

  /**
   * Mục khớp DÀI NHẤT thắng, chỉ một mục sáng tại một thời điểm.
   *
   * `startsWith` trần không đủ vì các đường dẫn lồng nhau: ở
   * /dashboard/applications/apply thì cả "Ứng tuyển" lẫn "Lịch sử ứng tuyển"
   * cùng khớp, và /dashboard/jobs/all làm sáng luôn "Việc làm phù hợp".
   */
  const activeHref = useMemo(() => {
    const matched = navItems.filter((item) =>
      item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    return matched.sort((a, b) => b.href.length - a.href.length)[0]?.href;
  }, [pathname]);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-4.5 border-b border-slate-100">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-xs">
          <Sparkles className="size-4.5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-slate-900">AI Career Agent</p>
          <p className="text-[11px] font-mono font-medium text-slate-400">Multi-Agent v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === activeHref;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary-50 text-primary-900 font-semibold border-l-2 border-primary-600 pl-2.5"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className={cn("size-4 shrink-0", active ? "text-primary-600" : "text-slate-400")} />
              {/* Trước đây có một Badge "24" viết cứng cạnh "Việc làm phù hợp",
                  hiện đúng con số đó cho mọi tài khoản bất kể thực tế có bao
                  nhiêu. Số thật đã có ở màn Tổng quan, lấy từ backend. */}
              <span className="truncate">{label}</span>
            </Link>
          );
        })}

        <div className="!mt-4 border-t border-slate-100/90 pt-3">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150",
              pathname.startsWith("/admin")
                ? "bg-primary-50 text-primary-900 font-semibold border-l-2 border-primary-600 pl-2.5"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <Zap className="size-4 shrink-0 text-slate-400" />
            Admin Control Panel
          </Link>
        </div>
      </nav>

      {/* Ở đây từng có thẻ "Nâng cấp Pro Agent" hứa "CV tối ưu không giới hạn &
          RPA tự động ứng tuyển", với một nút không có onClick. Hệ thống không có
          gói dịch vụ, không có thanh toán, và RPA tự động ứng tuyển thì chưa tồn
          tại — quảng cáo cả ba thứ đó là hứa suông. */}

      {/* Profile card */}
      <div className="flex items-center gap-2.5 border-t border-slate-100 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-100 text-xs font-bold text-slate-800">
          {loading ? "…" : personInitials(user?.name)}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-xs font-semibold text-slate-900">
            {loading ? "Đang tải…" : (user?.name ?? "Chưa đăng nhập")}
          </p>
          <p className="truncate font-mono text-[11px] text-slate-400">
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
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}
