"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot } from "lucide-react";
import type { AuthUser } from "@/types";
import type { AiFailureRecord, AiHealth } from "@/services";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
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
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [days, setDays] = useState(7);
  const [health, setHealth] = useState<AiHealth | null>(null);
  const [failures, setFailures] = useState<AiFailureRecord[] | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const me = await authService.me();
        if (!cancelled) setUser(me);
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace("/login?next=/admin");
          return;
        }
        setAuthError(apiErrorMessage(err, "Không xác định được tài khoản"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const role = user?.role;

  useEffect(() => {
    if (role !== "ADMIN") return;

    let cancelled = false;
    // Xoá dữ liệu cũ để khung xám hiện lại khi đổi khoảng thời gian — giữ số cũ
    // dưới nhãn mới thì người đọc tin vào một con số không thuộc về nhãn đó.
    setHealth(null);
    setFailures(null);
    setDataError(null);

    void (async () => {
      try {
        const [nextHealth, nextFailures] = await Promise.all([
          adminService.aiHealth(days),
          adminService.aiFailures(FAILURE_LIMIT),
        ]);
        if (cancelled) return;
        setHealth(nextHealth);
        setFailures(nextFailures);
      } catch (err) {
        if (cancelled) return;
        const status = apiErrorStatus(err);
        if (status === 401) {
          router.replace("/login?next=/admin");
          return;
        }
        // Vai trò đọc tươi từ database mỗi request, nên một tài khoản có thể bị
        // hạ quyền ngay giữa phiên. Đó không phải hỏng hóc — đừng báo như lỗi.
        if (status === 403) {
          setForbidden(true);
          return;
        }
        setDataError(apiErrorMessage(err, "Không tải được số liệu AI gateway"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role, days, router]);

  if (authError) {
    return (
      <PageError title="Không tải được trang quản trị" message={authError} />
    );
  }

  if (!user) return <AdminSkeleton />;

  if (user.role !== "ADMIN" || forbidden) return <AccessDenied />;

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

      {dataError ? (
        <Alert tone="danger">{dataError}</Alert>
      ) : !health || !failures ? (
        <HealthSkeleton />
      ) : health.total === 0 ? (
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
        <HealthReport health={health} failures={failures} />
      )}
    </div>
  );
}
