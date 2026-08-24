"use client";

import { BookOpen, Layers, Target } from "lucide-react";
import { type UpskillReportRecord } from "@/services";
import { GAP_CATEGORY_LABELS, isUpskillReportEmpty, parseHardGaps, parseLearningPlan, parseSynthesisedGaps } from "@/lib/upskill-content";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/ui/section-card";

export function ReportBody({ report }: { report: UpskillReportRecord }) {
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

