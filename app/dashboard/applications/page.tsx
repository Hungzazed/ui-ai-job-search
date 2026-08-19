"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { } from "lucide-react";
import type {
  Application,
  ApplicationGroup,
  ApplicationList,
  ApplicationStatus,
} from "@/types";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { applicationsService } from "@/services";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_VARIANTS,
  APPLICATION_TABS,
  NEXT_STATUSES,
} from "@/lib/application-status";
import { Select } from "@/components/ui/select";
import { companyColor, companyInitials, formatDate } from "@/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { LocationText } from "@/components/dashboard/location-text";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
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

/** Số đơn hiện một lúc. Bảng dài hơn thế là phải cuộn để tìm, không phải đọc. */
const PAGE_SIZE = 20;

export default function ApplicationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<ApplicationList | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Tăng lên để tải lại danh sách sau khi đổi trạng thái thành công. */
  const [reloadToken, setReloadToken] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(
    null,
  );

  // Lọc ở phía backend chứ không lọc mảng đã tải: `counts` phải là tổng thật
  // trên toàn bộ đơn, không phải đếm lại sau khi đã lọc theo chính tab đang mở.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await applicationsService.list(
          filter === "all" ? undefined : filter,
          { limit: PAGE_SIZE, offset },
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
  }, [filter, offset, router, reloadToken]);

  /**
   * Đổi trạng thái rồi TẢI LẠI cả danh sách, thay vì vá bản ghi tại chỗ.
   *
   * Cập nhật tại chỗ sẽ nhanh hơn nhưng sai hai chỗ: `counts` trên các tab là
   * tổng thật do máy chủ đếm, và bản ghi vừa đổi có thể không còn thuộc tab đang
   * mở nữa. Một request thêm đổi lấy việc màn hình không nói dối.
   *
   * CỐ Ý không cập nhật lạc quan: máy chủ mới là bên quyết định một lần chuyển
   * có hợp lệ hay không, và khi nó từ chối thì lý do của nó (ví dụ "chưa từng ở
   * trạng thái OFFER") là thứ người dùng cần đọc — hiện trạng thái mới rồi rút
   * lại chỉ làm người dùng tưởng mình bấm hụt.
   */
  const changeStatus = async (
    application: Application,
    next: ApplicationStatus,
  ) => {
    setSavingId(application.id);
    setRowError(null);
    try {
      await applicationsService.updateStatus(application.id, next);
      setReloadToken((current) => current + 1);
    } catch (err) {
      if (apiErrorStatus(err) === 401) {
        router.replace("/login?next=/dashboard/applications");
        return;
      }
      setRowError({
        id: application.id,
        message: apiErrorMessage(err, "Không đổi được trạng thái"),
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử ứng tuyển"
        subtitle="Theo dõi trạng thái từng đơn ứng tuyển của bạn"
      />

      {/* Đổi tab thì về trang đầu: giữ offset cũ rất dễ ra một bảng trống. */}
      <CountTabs
        tabs={APPLICATION_TABS}
        value={filter}
        onChange={(next) => {
          setFilter(next);
          setOffset(0);
        }}
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
                <TableHead>Cập nhật</TableHead>
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
                    <LocationText location={application.job.location} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={APPLICATION_STATUS_VARIANTS[application.status]}
                    >
                      {APPLICATION_STATUS_LABELS[application.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/*
                      `value` ghim ở chuỗi rỗng nên ô luôn quay về dòng gợi ý sau
                      mỗi lần chọn — trạng thái thật đã nằm ở Badge bên cạnh, để
                      hai chỗ cùng hiển thị một thứ chỉ tạo cơ hội cho chúng lệch
                      nhau.
                    */}
                    <Select
                      aria-label={`Đổi trạng thái đơn ${application.job.title}`}
                      className="min-w-40"
                      value=""
                      placeholder={
                        savingId === application.id
                          ? "Đang lưu…"
                          : "Đổi trạng thái…"
                      }
                      disabled={savingId === application.id}
                      options={NEXT_STATUSES[application.status].map(
                        (status) => ({
                          value: status,
                          label: APPLICATION_STATUS_LABELS[status],
                        }),
                      )}
                      onChange={(next) =>
                        void changeStatus(application, next as ApplicationStatus)
                      }
                    />
                    {rowError?.id === application.id && (
                      // Nguyên văn lý do máy chủ trả về. Nó biết những thứ dữ
                      // liệu ở đây không biết, ví dụ đơn đã từng ở OFFER hay chưa.
                      <p className="mt-1 text-xs text-rose-600">
                        {rowError.message}
                      </p>
                    )}
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

          <Pagination
            offset={offset}
            limit={PAGE_SIZE}
            total={data.total}
            noun="đơn"
            onOffsetChange={setOffset}
          />
        </Card>
      )}
    </div>
  );
}
