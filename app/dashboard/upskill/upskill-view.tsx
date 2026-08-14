"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Layers, RefreshCw, Target } from "lucide-react";
import { failureMessage } from "@/lib/failure-message";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { upskillService, type UpskillReportRecord } from "@/services";
import {
  GAP_CATEGORY_LABELS,
  isUpskillReportEmpty,
  parseHardGaps,
  parseLearningPlan,
  parseSynthesisedGaps,
} from "@/lib/upskill-content";
import { formatDate } from "@/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";

const LOGIN_NEXT = "/login?next=/dashboard/upskill";

/**
 * 4 giây × 40 lần ≈ 2 phút 40 giây.
 *
 * Cùng nhịp với `use-document-job.ts` và cùng lý do: một lượt gọi model đo được
 * p50 33 giây, p95 82 giây, nên hỏi dày hơn chỉ tốn request. Hai chỗ đang lặp
 * hình dạng vòng hỏi này; chúng nên gộp thành một hook chung khi
 * `use-document-job` được viết lại (xem nợ đã ghi trong eslint.config.mjs).
 */
const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 40;

function ReportBody({ report }: { report: UpskillReportRecord }) {
  const hardGaps = parseHardGaps(report.hardGaps);
  const synthesised = parseSynthesisedGaps(report.synthesisedGaps);
  const plan = parseLearningPlan(report.learningPlan);

  if (isUpskillReportEmpty(report)) {
    return (
      <Alert tone="warning">
        Báo cáo đã chạy xong nhưng nội dung trả về không dùng được. Bấm tạo lại
        để chạy một lượt mới.
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {report.summary && (
        <Card className="p-4">
          <p className="text-sm leading-relaxed text-slate-700">
            {report.summary}
          </p>
        </Card>
      )}

      {hardGaps.length > 0 && (
        <SectionCard
          icon={Target}
          title="Kỹ năng còn thiếu"
          description="Sắp theo độ ưu tiên: càng nhiều tin đòi hỏi và càng kéo điểm phù hợp xuống thì càng cao."
        >
          <div className="space-y-4">
            {hardGaps.map((gap) => (
              <div key={gap.skill}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">
                    {gap.skill}
                  </p>
                  <div className="flex shrink-0 items-baseline gap-2">
                    {gap.demandCount !== null && (
                      <span className="font-mono text-xs text-slate-400">
                        {gap.demandCount} tin
                      </span>
                    )}
                    {gap.priority !== null && (
                      <span className="font-mono text-xs font-semibold text-slate-600">
                        {gap.priority}
                      </span>
                    )}
                  </div>
                </div>
                {/* Không có độ ưu tiên thì KHÔNG vẽ thanh: một thanh 0% trông
                    như "không quan trọng", trong khi sự thật là không biết. */}
                {gap.priority !== null && (
                  <Progress value={gap.priority} className="mt-1.5" />
                )}
                {gap.evidence && (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {gap.evidence}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {synthesised.length > 0 && (
        <SectionCard
          icon={Layers}
          title="Khoảng trống không lộ ra qua danh sách kỹ năng"
          description="Kiến thức ngành, cách làm việc, công cụ hoặc chứng chỉ."
        >
          <div className="space-y-3">
            {synthesised.map((gap, index) => (
              <div key={index} className="border-l-2 border-slate-100 pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  {gap.category && (
                    <Badge variant="outline">
                      {GAP_CATEGORY_LABELS[gap.category]}
                    </Badge>
                  )}
                  <p className="text-sm font-medium text-slate-900">
                    {gap.gap}
                  </p>
                </div>
                {gap.why && (
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {gap.why}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {plan.length > 0 && (
        <SectionCard
          icon={BookOpen}
          title="Lộ trình học"
          description="Sắp theo thứ tự học, không phải theo độ quan trọng: cái nào mở khoá được nhiều thứ khác thì học trước."
        >
          <ol className="space-y-4">
            {plan.map((step, index) => (
              <li key={index} className="flex gap-3">
                {/* Số thứ tự đánh lại theo vị trí, không dùng thẳng `order` của
                    model: nó hay để lỗ (1, 2, 4) và một danh sách nhảy cóc làm
                    người đọc tưởng mình thiếu mất một bước. */}
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-xs font-semibold text-primary-700">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {step.topic}
                    </p>
                    {step.estimatedWeeks !== null && (
                      <span className="font-mono text-xs text-slate-400">
                        ~{step.estimatedWeeks} tuần
                      </span>
                    )}
                  </div>
                  {step.rationale && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {step.rationale}
                    </p>
                  )}
                  {step.resources.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {step.resources.map((resource, resourceIndex) => (
                        <li
                          key={resourceIndex}
                          className="flex gap-2 text-xs text-slate-600"
                        >
                          <span
                            aria-hidden
                            className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-300"
                          />
                          <span>{resource}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>
      )}
    </div>
  );
}

export function UpskillView() {
  const router = useRouter();
  const [report, setReport] = useState<UpskillReportRecord | null>(null);
  /** Đã tải xong lần đầu chưa — phân biệt "đang tải" với "chưa có báo cáo". */
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const latest = await upskillService.latest();
        if (!cancelled) setReport(latest);
      } catch (err) {
        if (cancelled) return;
        if (handleUnauthorized(err)) return;
        // 404 KHÔNG phải lỗi: backend trả nó khi người dùng chưa từng tạo báo
        // cáo nào. Đó là trạng thái rỗng bình thường của màn hình này.
        if (apiErrorStatus(err) !== 404) {
          setError(apiErrorMessage(err, "Không tải được báo cáo"));
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handleUnauthorized]);

  const generate = async () => {
    setGenerating(true);
    setRefusal(null);
    setError(null);

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
          setReport(current);
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
      <RefreshCw className="size-4" />
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
      {error && <Alert tone="danger">{error}</Alert>}

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
            <Alert tone="info">
              Đang tổng hợp báo cáo mới. Một lượt mất khoảng 30–90 giây; nội dung
              bên dưới vẫn là bản cũ cho tới khi bản mới xong.
            </Alert>
          ) : null}

          <ReportBody report={report} />
        </div>
      )}
    </div>
  );
}
