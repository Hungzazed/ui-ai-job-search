"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";
import type { AuthUser } from "@/types";
import type { AiFailureRecord, AiHealth } from "@/services";
import { useAsyncData } from "@/hooks/use-async-data";
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

const LOGIN_NEXT = "/admin";

export function AdminView() {
  const [days, setDays] = useState(7);

  const loadMe = useCallback(() => authService.me(), []);
  const me = useAsyncData(loadMe, {
    loginNext: LOGIN_NEXT,
    errorMessage: "Không xác định được tài khoản",
  });

  const user: AuthUser | null = me.data;
  const role = user?.role;

  /**
   * Chỉ đọc số liệu SAU KHI biết tài khoản là ADMIN — `null` nghĩa là chưa tới lúc.
   *
   * Gộp hai request vào một `load` là có chủ đích: màn hình chỉ hiện báo cáo khi có
   * cả hai (`!health || !failures` cho ra khung xám), nên tách thành hai lượt tải
   * riêng chỉ tạo ra một trạng thái nửa vời mà không màn nào dùng.
   */
  const loadHealth = useMemo(
    () =>
      role === "ADMIN"
        ? async (): Promise<{
            health: AiHealth;
            failures: AiFailureRecord[];
          }> => {
            const [health, failures] = await Promise.all([
              adminService.aiHealth(days),
              adminService.aiFailures(FAILURE_LIMIT),
            ]);
            return { health, failures };
          }
        : null,
    [role, days],
  );

  const report = useAsyncData(loadHealth, {
    loginNext: LOGIN_NEXT,
    errorMessage: "Không tải được số liệu AI gateway",
  });

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
              <ArrowLeft className="size-4" />
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
              icon={Bot}
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
