"use client";

import { streamModel } from "@/lib/model-stream";
import { UpskillProgress, type UpskillPartial } from "./upskill-progress";
import { ReportBody } from "./report-body";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowsClockwise, GraduationCap } from "@phosphor-icons/react/ssr";
import { failureMessage } from "@/lib/failure-message";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { upskillService, type UpskillReportRecord } from "@/services";

import { formatDate } from "@/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

import { Skeleton } from "@/components/ui/skeleton";

const LOGIN_NEXT = "/login?next=/dashboard/upskill";

/** Khoá cache của báo cáo mới nhất. Vòng hỏi lại ghi vào đúng khoá này. */
const LATEST_KEY = ["upskill", "latest"];

/**
 * 4 giây × 40 lần ≈ 2 phút 40 giây.
 *
 * Cùng nhịp với `use-document-job.ts` và cùng lý do: một lượt gọi model đo được
 * p50 33 giây, p95 82 giây, nên hỏi dày hơn chỉ tốn request. Hai chỗ đang lặp
 * hình dạng vòng hỏi này; chúng nên gộp thành một hook chung khi
 * `use-document-job` được viết lại (xem nợ đã ghi trong eslint.config.mjs).
 */
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 80;

export function  UpskillView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  /** Lỗi phát sinh SAU khi tải xong: lượt tạo báo cáo hỏng, hoặc hỏi lại hỏng. */
  const [error, setError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleUnauthorized = useCallback(
    (err: unknown) => {
      if (apiErrorStatus(err) !== 401) return false;
      router.replace(LOGIN_NEXT);
      return true;
    },
    [router],
  );

  const query = useApiQuery(
    LATEST_KEY,
    () =>
      // 404 KHÔNG phải lỗi: backend trả nó khi người dùng chưa từng tạo báo cáo
      // nào. Đó là trạng thái rỗng bình thường của màn hình này.
      upskillService.latest().catch((err: unknown) => {
        if (apiErrorStatus(err) === 404) return null;
        throw err;
      }),
    { errorMessage: "Không tải được báo cáo" },
  );

  const report = query.data;
  // Có dữ liệu rồi thì coi như đã tải xong, kể cả khi đang nạp lại nền — không
  // thì quay lại màn này sẽ chớp một nhịp khung xám trên dữ liệu đã có sẵn.
  const loaded = report !== null || !query.loading;

  /** Thay cho `setReport`: vòng hỏi lại ghi thẳng kết quả vào cache. */
  const putReport = useCallback(
    (next: UpskillReportRecord) => queryClient.setQueryData(LATEST_KEY, next),
    [queryClient],
  );

  const generate = async () => {
    setGenerating(true);
    setRefusal(null);
    setError(null);
    setStep(0);

    try {
      const done = await streamModel<UpskillReportRecord, UpskillPartial>({
        path: "/upskill/generate-stream",
        onPartial: (partial) => {
          if (mounted.current && typeof partial.step === "number")
            setStep(partial.step);
        },
      });
      if (!mounted.current) return;
      putReport(done);
      setGenerating(false);
      return;
    } catch {
      // Stream hỏng thì rơi về đường hàng đợi: nó CÓ chuỗi model dự phòng.
    }

    let reportId: string;
    try {
      const receipt = await upskillService.generate();
      reportId = receipt.reportId;
    } catch (err) {
      setGenerating(false);
      if (handleUnauthorized(err)) return;
      // Backend từ chối ngay khi chưa đủ số việc đã chấm, kèm con số cụ thể.
      // Đó là kết luận về dữ liệu chứ không phải sự cố, nên hiện khác hộp lỗi đỏ.
      if (apiErrorStatus(err) === 400) {
        setRefusal(apiErrorMessage(err, "Chưa đủ dữ liệu để tổng hợp"));
        return;
      }
      setError(apiErrorMessage(err, "Không tạo được báo cáo"));
      return;
    }

    let polls = 0;
    const read = async () => {
      if (!mounted.current) return;
      try {
        const current = await upskillService.get(reportId);
        if (!mounted.current) return;

        if (current.status === "DONE" || current.status === "FAILED") {
          putReport(current);
          setGenerating(false);
          if (current.status === "FAILED") {
            // Câu cho người dùng, không phải nguyên văn của SDK — xem
            // `lib/failure-message.ts`.
            setError(failureMessage(current.failureKind));
          }
          return;
        }

        polls += 1;
        if (polls >= MAX_POLLS) {
          setGenerating(false);
          setError(
            "Báo cáo chạy quá lâu. Nó vẫn đang trong hàng đợi; tải lại trang sau ít phút.",
          );
          return;
        }
        // Hẹn giờ theo chuỗi chứ không setInterval: một lần đọc chậm hơn 4 giây
        // sẽ khiến setInterval chồng nhiều request lên nhau.
        setTimeout(() => void read(), POLL_INTERVAL_MS);
      } catch (err) {
        if (!mounted.current) return;
        setGenerating(false);
        if (handleUnauthorized(err)) return;
        setError(apiErrorMessage(err, "Không đọc được trạng thái báo cáo"));
      }
    };

    void read();
  };

  const actions = (
    <Button onClick={() => void generate()} loading={generating}>
      <ArrowsClockwise className="size-4.5" />
      {report ? "Tạo lại" : "Tạo báo cáo"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lộ trình học"
        subtitle="Tổng hợp kỹ năng còn thiếu trên toàn bộ việc làm đã chấm điểm, rồi xếp thành thứ tự học"
        actions={loaded ? actions : undefined}
      />

      {refusal && <Alert tone="warning">{refusal}</Alert>}
      {/* Lỗi lúc tải và lỗi lúc tạo báo cáo đi chung một hộp: người dùng chỉ
          cần biết màn này đang hỏng, không cần biết hỏng ở giai đoạn nào. */}
      {(error ?? query.error) && (
        <Alert tone="danger">{error ?? query.error}</Alert>
      )}

      {!loaded ? (
        <Skeleton className="h-64 animate-pulse" />
      ) : !report ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Chưa có báo cáo nào"
            description={
              <>
                Báo cáo tổng hợp khoảng trống kỹ năng từ những việc làm đã được
                chấm điểm — cần <strong>ít nhất 3 việc</strong> để con số có ý
                nghĩa. Chấm thêm việc ở màn Việc làm rồi quay lại đây.
              </>
            }
            action={
              <Link href="/dashboard/jobs/all">
                <Button variant="secondary">Mở danh sách việc làm</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge variant="neutral">
              {report.mode === "AGGREGATE" ? "Tổng hợp" : "Một vị trí"}
            </Badge>
            {/* Cỡ mẫu phải hiện ra: báo cáo dựng trên 3 việc không đáng tin như
                báo cáo dựng trên 20, và người đọc cần biết trước khi tin vào
                lộ trình bên dưới. */}
            <span className="font-mono">
              dựa trên {report.jobsAnalysed} việc đã chấm
            </span>
            {report.generatedAt && (
              <span>· {formatDate(report.generatedAt)}</span>
            )}
          </div>

          {generating ? (
            <UpskillProgress report={report} step={step} />
          ) : null}

          <ReportBody report={report} />
        </div>
      )}
    </div>
  );
}
