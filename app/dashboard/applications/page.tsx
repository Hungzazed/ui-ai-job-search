"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import type { ApplicationGroup, ApplicationList } from "@/types";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { applicationsService } from "@/services";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_VARIANTS,
  APPLICATION_TABS,
} from "@/lib/application-status";
import { companyColor, companyInitials, formatDate } from "@/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CountTabs } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Filter = "all" | ApplicationGroup;

export default function ApplicationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [data, setData] = useState<ApplicationList | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lọc ở phía backend chứ không lọc mảng đã tải: `counts` phải là tổng thật
  // trên toàn bộ đơn, không phải đếm lại sau khi đã lọc theo chính tab đang mở.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await applicationsService.list(
          filter === "all" ? undefined : filter,
        );
        if (!cancelled) setData(response);
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace("/login?next=/dashboard/applications");
          return;
        }
        setError(apiErrorMessage(err, "Không tải được danh sách đơn"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filter, router]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử ứng tuyển"
        subtitle="Theo dõi trạng thái từng đơn ứng tuyển của bạn"
        actions={
          <Link href="/dashboard/applications/apply">
            <Button>
              <Send className="size-4" />
              Ứng tuyển mới
            </Button>
          </Link>
        }
      />

      <CountTabs
        tabs={APPLICATION_TABS}
        value={filter}
        onChange={setFilter}
        counts={data?.counts}
      />

      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : !data ? (
        <Skeleton className="h-64 animate-pulse" />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Vị trí / Công ty</TableHead>
                <TableHead className="hidden md:table-cell">Ngày nộp</TableHead>
                <TableHead className="hidden lg:table-cell">Địa điểm</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        initials={companyInitials(application.job.company)}
                        color={companyColor(application.job.company)}
                        src={application.job.companyLogo}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/jobs/${application.jobId}`}
                          className="hover:text-primary-600 block truncate font-medium text-slate-900"
                        >
                          {application.job.title}
                        </Link>
                        <p className="text-xs text-slate-400">
                          {application.job.company}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-slate-500 md:table-cell">
                    {/* Đơn ở trạng thái RANKED thì chưa nộp, nên chưa có ngày. */}
                    {application.appliedAt
                      ? formatDate(application.appliedAt)
                      : "Chưa nộp"}
                  </TableCell>
                  <TableCell className="hidden text-slate-500 lg:table-cell">
                    {application.job.location ?? "Không rõ"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={APPLICATION_STATUS_VARIANTS[application.status]}
                    >
                      {APPLICATION_STATUS_LABELS[application.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.items.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-400">
              Không có đơn ứng tuyển nào ở trạng thái này.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
