"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { applications, applicationStatusLabels } from "@/lib/mock-data";
import type { ApplicationStatus } from "@/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

type Filter = "all" | ApplicationStatus;

const filterTabs: { value: Filter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "submitted", label: "Đã nộp" },
  { value: "reviewing", label: "Đang xem xét" },
  { value: "interview", label: "Đã phỏng vấn" },
  { value: "rejected", label: "Từ chối" },
];

const statusVariant: Record<ApplicationStatus, "info" | "warning" | "primary" | "danger" | "success"> = {
  submitted: "info",
  reviewing: "warning",
  interview: "primary",
  rejected: "danger",
  offered: "success",
};

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? applications : applications.filter((app) => app.status === filter)),
    [filter],
  );

  const counts = useMemo(() => {
    const result = { all: applications.length } as Record<Filter, number>;
    for (const status of Object.keys(applicationStatusLabels) as ApplicationStatus[]) {
      result[status] = applications.filter((app) => app.status === status).length;
    }
    return result;
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử ứng tuyển"
        subtitle="Theo dõi trạng thái đơn ứng tuyển của bạn — AI cập nhật tự động"
        actions={
          <Link href="/dashboard/applications/apply">
            <Button>
              <Send className="size-4" />
              Ứng tuyển mới
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {filterTabs.map((tab) => {
          const active = filter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={
                active
                  ? "inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-primary-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm"
                  : "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              }
            >
              {tab.label}
              <span
                className={
                  active
                    ? "rounded-full bg-white/20 px-1.5 text-xs"
                    : "rounded-full bg-slate-100 px-1.5 text-xs text-slate-500"
                }
              >
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Vị trí / Công ty</TableHead>
              <TableHead className="hidden md:table-cell">Ngày nộp</TableHead>
              <TableHead className="hidden lg:table-cell">AI Match</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CompanyLogo initials={app.companyInitials} color={app.companyColor} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{app.jobTitle}</p>
                      <p className="text-xs text-slate-400">
                        {app.company}
                        {app.note && <span className="text-primary-600"> · {app.note}</span>}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-slate-500 md:table-cell">
                  {formatDate(app.appliedAt)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span
                    className={
                      app.matchScore >= 80
                        ? "font-semibold text-emerald-600"
                        : app.matchScore >= 60
                          ? "font-semibold text-amber-600"
                          : "font-semibold text-rose-600"
                    }
                  >
                    {app.matchScore}%
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[app.status]}>
                    {applicationStatusLabels[app.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-slate-400">
            Không có đơn ứng tuyển nào ở trạng thái này.
          </div>
        )}
      </Card>
    </div>
  );
}
