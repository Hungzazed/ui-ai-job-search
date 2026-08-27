"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Robot } from "@phosphor-icons/react/ssr";
import type { AuthUser } from "@/types";
import type { AiFailureRecord, AiHealth } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { adminService, authService } from "@/services";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, PageError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { FAILURE_LIMIT, RANGE_TABS } from "./admin-constants";
import { AccessDenied, AdminSkeleton, HealthSkeleton } from "./admin-states";
import { HealthReport } from "./health-report";
import { ScrapePanel } from "./scrape-panel";

export function AdminView() {
  const [days, setDays] = useState(7);

  const me = useApiQuery(["auth", "me"], () => authService.me(), {
    errorMessage: "Không xác định được tài khoản",
  });

  const user: AuthUser | null = me.data;
  const role = user?.role;

  /**
   * Chỉ đọc số liệu SAU KHI biết tài khoản là ADMIN — `enabled: false` nghĩa là
   * chưa tới lúc, thay cho `load = null` của `useAsyncData`.
   *
   * Gộp hai request vào một `queryFn` là có chủ đích: màn hình chỉ hiện báo cáo khi
   * có cả hai (`!report.data` cho ra khung xám), nên tách thành hai query riêng chỉ
   * tạo ra một trạng thái nửa vời mà không màn nào dùng.
   *
   * `days` nằm trong queryKey chứ không nằm trong thân hàm: đó là thứ khiến đổi tab
   * khoảng thời gian trở thành một truy vấn KHÁC — nạp đúng một lần, và lần quay
   * lại mốc cũ thì dùng cache. Có spec Playwright đếm đúng số request này.
   */
  const report = useApiQuery(
    ["admin", "report", days],
    async (): Promise<{ health: AiHealth; failures: AiFailureRecord[] }> => {
      const [health, failures] = await Promise.all([
        adminService.aiHealth(days),
        adminService.aiFailures(FAILURE_LIMIT),
      ]);
      return { health, failures: failures.items };
    },
    {
      enabled: role === "ADMIN",
      errorMessage: "Không tải được số liệu AI gateway",
    },
  );

  if (me.error) {
    return (
      <PageError title="Không tải được trang quản trị" message={me.error} />
    );
  }

  if (!user) return <AdminSkeleton />;

  // 403 nghĩa là tài khoản vừa bị hạ quyền giữa phiên — không phải hỏng hóc.
  if (user.role !== "ADMIN" || report.errorStatus === 403) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng điều khiển vận hành"
        subtitle="Sức khoẻ AI Gateway và điều khiển việc quét tin tuyển dụng"
        actions={
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="size-4.5" />
              Về trang chính
            </Button>
          </Link>
        }
      />

      <ScrapePanel />

      {/* Từ đây xuống là phần đo sức khoẻ gateway; khoảng thời gian chỉ áp cho
          phần này, không liên quan tới bảng quét ở trên. */}
      <Tabs
        tabs={RANGE_TABS}
        value={String(days)}
        onChange={(value) => setDays(Number(value))}
        className="max-w-sm"
      />

      {report.error ? (
        <Alert tone="danger">{report.error}</Alert>
      ) : !report.data ? (
        // Khung xám theo "chưa có dữ liệu cho khoảng thời gian đang chọn". Trước
        // đây phải tự `setHealth(null)` đầu mỗi lượt tải để được điều này; nay
        // `useAsyncData` bỏ dữ liệu cũ khi `load` đổi nên nó tự đúng.
        <HealthSkeleton />
      ) : report.data.health.total === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Robot}
              title="Chưa có lần gọi model nào trong khoảng thời gian này"
              description="Chưa có gì để đo, nên trang này chưa nói được gì về sức khoẻ gateway. Hãy chọn khoảng thời gian rộng hơn hoặc chờ hệ thống chạy thêm."
            />
          </CardContent>
        </Card>
      ) : (
        <HealthReport
          health={report.data.health}
          failures={report.data.failures}
        />
      )}
    </div>
  );
}
