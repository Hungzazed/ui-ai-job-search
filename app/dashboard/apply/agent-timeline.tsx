"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import type { AgentRunRecord } from "@/services";
import { summarizeStep } from "@/lib/agent-steps";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/utils";
import { Activity } from "lucide-react";

/**
 * Từng bước agent đã đi, theo thứ tự.
 *
 * Đây là thứ khiến một vòng lặp agent tin được. Người dùng không cần biết
 * "model đang nghĩ" — họ cần thấy nó vừa ĐỌC HỒ SƠ, vừa LƯU CV, và bước nào
 * hỏng thì hỏng vì lý do gì. Không có bảng này thì ba phút chờ là ba phút nhìn
 * một vòng xoay.
 */
export function AgentTimeline({ run }: { run: AgentRunRecord }) {
  const steps = run.steps.map(summarizeStep);
  const active = run.status === "PENDING" || run.status === "RUNNING";

  return (
    <SectionCard
      compact
      icon={Activity}
      iconClassName="size-4 text-slate-400"
      title="Agent đã làm gì"
      description={`${steps.length} bước${run.modelId ? ` · ${run.modelId}` : ""}`}
      className="border-slate-200/90"
    >
      {steps.length === 0 && !active && (
        <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          Lượt chạy này chưa ghi được bước nào.
        </p>
      )}

      <ol className="space-y-3">
        {steps.map((step) => (
          <li key={step.index} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                step.failed
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {step.failed ? <AlertCircle className="size-3.5" /> : step.index + 1}
            </span>

            <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 last:border-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {step.tools.length > 0 ? (
                  step.tools.map((tool, position) => (
                    <span
                      key={`${step.index}-${position}-${tool}`}
                      className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600"
                    >
                      {tool}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-medium text-slate-700">
                    Viết kết luận
                  </span>
                )}
                <span className="font-mono text-[11px] text-slate-400">
                  {step.seconds}s
                </span>
              </div>

              {step.outcome && (
                <p
                  className={cn(
                    // Kẹp hai dòng: phần lớn kết quả là một câu ngắn, nhưng
                    // `ask_user` trả về nguyên câu hỏi của model và nó dài
                    // bằng cả một trang đánh giá.
                    "mt-1 line-clamp-2 text-xs",
                    step.failed ? "text-rose-600" : "text-slate-500",
                  )}
                >
                  {step.outcome}
                </p>
              )}

              {/* Chữ model viết ra ở bước này — thường là phần đánh giá, và nó
                  viết bằng Markdown. Ở đây BỎ HẾT cú pháp thay vì vẽ ra: ba
                  dòng preview không chứa nổi một cái bảng, mà in nguyên văn thì
                  người đọc chỉ thấy một dãy `|---|---|`. Bản đầy đủ, có bảng
                  hẳn hoi, nằm ở khối Kết quả bên dưới. */}
              {step.preview && (
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600">
                  {step.preview}
                </p>
              )}
            </div>
          </li>
        ))}

        {active && (
          <li className="flex items-center gap-3 text-xs text-slate-500">
            <span className="bg-primary-50 flex size-6 shrink-0 items-center justify-center rounded-full">
              <Loader2 className="text-primary-600 size-3.5 animate-spin" />
            </span>
            Đang chạy bước tiếp theo…
          </li>
        )}

        {run.status === "DONE" && (
          <li className="flex items-center gap-3 text-xs text-emerald-700">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <Check className="size-3.5" />
            </span>
            Đã chạy xong
          </li>
        )}
      </ol>
    </SectionCard>
  );
}
