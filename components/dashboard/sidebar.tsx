"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  History,
  LayoutDashboard,
  Mail,
  Send,
  Settings,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Hồ sơ của tôi", href: "/dashboard/profile", icon: User },
  { label: "Việc làm phù hợp", href: "/dashboard/jobs", icon: Briefcase },
  { label: "CV Optimizer", href: "/dashboard/cv-optimizer", icon: FileText },
  { label: "Cover Letter", href: "/dashboard/cover-letter", icon: Mail },
  { label: "Ứng tuyển", href: "/dashboard/applications/apply", icon: Send },
  { label: "Lịch sử ứng tuyển", href: "/dashboard/applications", icon: History },
  { label: "Thiết lập", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

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
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
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
              <span className="truncate">{label}</span>
              {label === "Việc làm phù hợp" && (
                <Badge variant="primary" className="ml-auto font-mono text-[10px] px-1.5 py-0">
                  24
                </Badge>
              )}
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

      {/* Upgrade Pro card — Crisp anti-slop styling */}
      <div className="mx-3 mb-3 rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-400" />
          <p className="text-xs font-semibold tracking-wide text-slate-100">Nâng cấp Pro Agent</p>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
          Mở khóa CV tối ưu không giới hạn & RPA tự động ứng tuyển.
        </p>
        <Button
          size="sm"
          className="mt-3 w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs border-0"
        >
          Nâng cấp ngay
        </Button>
      </div>

      {/* Profile card */}
      <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200/80">
          {currentUser.initials}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-xs font-semibold text-slate-900">{currentUser.name}</p>
          <p className="truncate text-[11px] font-mono text-slate-400">{currentUser.email}</p>
        </div>
      </div>
    </aside>
  );
}
