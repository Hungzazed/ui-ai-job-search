"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import type {
  Application,
  ApplicationGroup,
  ApplicationStatus,
} from "@/types";
import { apiErrorMessage } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { invalidateAfter, keys } from "@/lib/query-keys";
import { applicationsService } from "@/services";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_VARIANTS,
  APPLICATION_TABS,
  NEXT_STATUSES,
} from "@/lib/application-status";
import { Select } from "@/components/ui/form";
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
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [offset, setOffset] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(
    null,
  );

  // Lọc ở phía backend chứ không lọc mảng đã tải: `counts` phải là tổng thật
  // trên toàn bộ đơn, không phải đếm lại sau khi đã lọc theo chính tab đang mở.
  const { data, error } = useApiQuery(
    keys.applicationList(filter, offset),
    () =>
      applicationsService.list(filter === "all" ? undefined : filter, {
        limit: PAGE_SIZE,
        offset,
      }),
    {
      errorMessage: "Không tải được danh sách đơn",
      // Đổi tab hay lật trang thì giữ bảng cũ trên màn cho tới khi trang mới
      // về, thay vì chớp một nhịp khung xám.
      keepPrevious: true,
    },
  );

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
      // Không chỉ tải lại bảng này: màn Tổng quan đếm đơn theo trạng thái từ
      // cùng một nguồn, nên nó cũng vừa cũ đi.
      invalidateAfter(queryClient, "applicationStatus");
    } catch (err) {
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
                      Dùng <select> gốc thay vì dựng một menu riêng: nó có sẵn
                      điều hướng bàn phím và hoạt động với trình đọc màn hình mà
                      không phải tự cài lại ARIA.

                      `value` ghim ở chuỗi rỗng nên ô luôn quay về dòng gợi ý sau
                      mỗi lần chọn — trạng thái thật đã nằm ở Badge bên cạnh, để
                      hai chỗ cùng hiển thị một thứ chỉ tạo cơ hội cho chúng lệch
                      nhau.
                    */}
                    <Select
                      aria-label={`Đổi trạng thái đơn ${application.job.title}`}
                      className="h-9 min-w-40 text-xs"
                      value=""
                      disabled={savingId === application.id}
                      onChange={(event) => {
                        const next = event.target.value;
                        if (!next) return;
                        void changeStatus(
                          application,
                          next as ApplicationStatus,
                        );
                      }}
                    >
                      <option value="">
                        {savingId === application.id
                          ? "Đang lưu…"
                          : "Đổi trạng thái…"}
                      </option>
                      {NEXT_STATUSES[application.status].map((status) => (
                        <option key={status} value={status}>
                          {APPLICATION_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </Select>
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
