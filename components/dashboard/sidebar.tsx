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
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 shadow-md shadow-primary-600/25">
          <Sparkles className="size-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-slate-900">AI Career Agent</p>
          <p className="text-[11px] font-medium text-slate-400">Career Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className={cn("size-4.5", active ? "text-primary-600" : "text-slate-400")} />
              {label}
              {label === "Việc làm phù hợp" && (
                <Badge variant="success" className="ml-auto">24</Badge>
              )}
            </Link>
          );
        })}

        <div className="!mt-4 border-t border-slate-100 pt-3">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-primary-50 text-primary-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <Zap className="size-4.5 text-slate-400" />
            Admin Dashboard
          </Link>
        </div>
      </nav>

      {/* Upgrade Pro card */}
      <div className="mx-3 mb-3 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-700 p-4 text-white shadow-lg shadow-primary-700/20">
        <p className="text-sm font-semibold">Nâng cấp Pro</p>
        <p className="mt-1 text-xs leading-relaxed text-primary-100">
          Mở khóa CV tối ưu không giới hạn, phân tích AI nâng cao và theo dõi ứng tuyển real-time.
        </p>
        <Button
          size="sm"
          className="mt-3 w-full bg-white text-primary-700 shadow-none hover:bg-primary-50"
        >
          Nâng cấp ngay
        </Button>
      </div>

      {/* Profile card */}
      <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-primary-600 text-sm font-bold text-white">
          {currentUser.initials}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-slate-900">{currentUser.name}</p>
          <p className="truncate text-xs text-slate-400">{currentUser.email}</p>
        </div>
      </div>
    </aside>
  );
}
