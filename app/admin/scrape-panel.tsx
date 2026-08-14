"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, RefreshCw, Radar } from "lucide-react";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { adminService, scraperService, type ScrapeRunRecord } from "@/services";
import { formatDateTime, formatDuration } from "@/utils";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** Chỉ hiện những lượt gần đây; lịch sử dài không giúp gì cho việc vận hành. */
const VISIBLE_RUNS = 15;

const STATUS_VARIANT: Record<
  ScrapeRunRecord["status"],
  "info" | "warning" | "success" | "danger"
> = {
  PENDING: "info",
  RUNNING: "warning",
  DONE: "success",
  FAILED: "danger",
};

const STATUS_LABEL: Record<ScrapeRunRecord["status"], string> = {
  PENDING: "Chờ",
  RUNNING: "Đang chạy",
  DONE: "Xong",
  FAILED: "Hỏng",
};

function runDuration(run: ScrapeRunRecord): string {
  if (!run.finishedAt) return "—";
  const ms =
    new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime();
  return ms >= 0 ? formatDuration(ms) : "—";
}

/**
 * Bảng điều khiển quét tin cho quản trị viên.
 *
 * Vì sao nó cần tồn tại: ba màn hình khác nhau trong ứng dụng đang bảo người
 * dùng "hãy chạy quét trước" — nhưng trước bảng này thì **không có nút nào để
 * chạy quét**. Cách duy nhất là đợi cron 23:00 hoặc gọi API bằng tay.
 */
export function ScrapePanel() {
  const [runs, setRuns] = useState<ScrapeRunRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Đọc lịch sử. KHÔNG chạm vào cờ `refreshing`.
   *
   * Lần tải đầu đã có skeleton lo (`runs === null`), nên bật thêm cờ ở đó chỉ
   * làm nút Tải lại quay vòng trong khi chưa ai bấm nó. Cờ chỉ dành cho lần bấm
   * tay, khi người dùng cần biết nút đã ăn.
   */
  const fetchRuns = useCallback(async () => {
    try {
      const history = await scraperService.history();
      setRuns(history.slice(0, VISIBLE_RUNS));
      setError(null);
    } catch (err) {
      // 403 ở đây nghĩa là màn admin đã chặn sai chỗ khác; để nguyên thông báo
      // của máy chủ thay vì đoán.
      if (apiErrorStatus(err) !== 401) {
        setError(apiErrorMessage(err, "Không tải được lịch sử quét"));
      }
    }
  }, []);

  useEffect(() => {
    void fetchRuns();
  }, [fetchRuns]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await fetchRuns();
    } finally {
      setRefreshing(false);
    }
  };

  const runNow = async () => {
    setStarting(true);
    setError(null);
    setReceipt(null);
    try {
      const result = await adminService.scrapeNow();
      setReceipt(
        result.queued > 0
          ? `Đã xếp hàng ${result.queued} lượt quét: ${result.runs
              .map((run) => run.portal)
              .join(", ")}.`
          : result.note,
      );
      await fetchRuns();
    } catch (err) {
      setError(apiErrorMessage(err, "Không chạy được lượt quét"));
    } finally {
      setStarting(false);
    }
  };

  return (
    <SectionCard
      icon={Radar}
      title="Quét tin tuyển dụng"
      description="Chạy ngay lượt quét hằng đêm thay vì đợi tới 23:00. Gọi đúng hàm mà cron gọi, nên đây cũng là phép thử thật của đường tự động."
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
            loading={refreshing}
            aria-label="Tải lại lịch sử quét"
          >
            <RefreshCw className="size-4" />
            Tải lại
          </Button>
          <Button size="sm" onClick={() => void runNow()} loading={starting}>
            <Play className="size-4" />
            Quét ngay
          </Button>
        </div>
      }
    >
      {/*
        Biên nhận, không phải kết quả. Một lượt quét mất VÀI PHÚT: mỗi portal
        được gọi tuần tự và có nhịp nghỉ giữa các request để không bị chặn IP.
        Nói rõ điều này ngay từ đầu, nếu không người vận hành sẽ bấm lại vì tưởng
        nút không ăn.
      */}
      {receipt && (
        <Alert tone="info" className="mb-4">
          {receipt} Worker chạy nền và mỗi portal mất vài phút; bấm{" "}
          <strong>Tải lại</strong> để xem tiến độ.
        </Alert>
      )}

      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {!runs ? (
        <Skeleton className="h-40 animate-pulse" />
      ) : runs.length === 0 ? (
        <EmptyState
          icon={Radar}
          title="Chưa có lượt quét nào"
          description="Bấm Quét ngay để chạy lượt đầu tiên, hoặc đợi cron 23:00 theo giờ Việt Nam."
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Portal</TableHead>
                <TableHead>Trạng thái</TableHead>
                {/* Ba con số này trả lời ba câu khác nhau: quét thấy bao nhiêu,
                    trong đó mới bao nhiêu, và bao nhiêu thật sự được đẩy đi
                    chấm điểm. Gộp lại thành một số là mất thông tin chẩn đoán. */}
                <TableHead className="text-right">Thấy</TableHead>
                <TableHead className="text-right">Mới</TableHead>
                <TableHead className="text-right">Xếp hàng</TableHead>
                <TableHead className="hidden md:table-cell">Bắt đầu</TableHead>
                <TableHead className="hidden lg:table-cell">Kéo dài</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-mono text-xs">
                    {run.portal}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[run.status]}>
                      {STATUS_LABEL[run.status]}
                    </Badge>
                    {run.error && (
                      <p className="mt-1 max-w-xs text-xs text-rose-600">
                        {run.error}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">
                    {run.jobsFound}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">
                    {run.jobsNew}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">
                    {run.jobsQueued}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-xs text-slate-500 md:table-cell">
                    {formatDateTime(run.startedAt)}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-slate-500 lg:table-cell">
                    {runDuration(run)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}
