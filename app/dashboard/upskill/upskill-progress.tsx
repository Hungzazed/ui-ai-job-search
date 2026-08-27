import { Check, Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import type { UpskillReportRecord } from "@/services";

export interface UpskillPartial {
  step?: number;
  value?: unknown;
}

const count = (value: unknown) => (Array.isArray(value) ? value.length : 0);

function StepRow({ done, label }: { done: boolean; label: string }) {
  return (
    <span className="flex items-center gap-2">
      {done ? (
        <Check className="size-4 shrink-0 text-emerald-600" />
      ) : (
        <Loader2 className="size-4 shrink-0 animate-spin text-slate-400" />
      )}
      <span className={done ? "text-slate-800" : "text-slate-500"}>{label}</span>
    </span>
  );
}

export function UpskillProgress({
  report,
  step = 0,
}: {
  report: UpskillReportRecord;
  step?: number;
}) {
  const gaps = count(report.hardGaps) + count(report.synthesisedGaps);
  const step1Done = step >= 2 || gaps > 0;

  return (
    <Alert tone="info">
      <StepRow
        done={step1Done}
        label={`Bước 1/2 — tìm khoảng trống kỹ năng${
          step1Done && gaps > 0 ? `: đã tìm ra ${gaps} khoảng trống` : ""
        }`}
      />
      <span className="mt-1 block">
        <StepRow done={false} label="Bước 2/2 — lập lộ trình học" />
      </span>
      <span className="mt-2 block text-xs text-slate-500">
        Nội dung bên dưới vẫn là bản cũ cho tới khi bản mới xong.
      </span>
    </Alert>
  );
}
