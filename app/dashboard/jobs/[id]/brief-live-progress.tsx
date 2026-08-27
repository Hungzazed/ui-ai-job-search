import { Check, Loader2 } from "lucide-react";

export interface PartialBrief {
  verdict?: string;
  summary?: string;
  pros?: string[];
  cons?: string[];
  usedSources?: unknown[];
}

const ROWS = [
  { label: "Kết luận chung", of: (p: PartialBrief) => p.verdict },
  { label: "Tóm tắt", of: (p: PartialBrief) => p.summary },
  { label: "Điểm tốt", of: (p: PartialBrief) => p.pros?.length },
  { label: "Điểm hạn chế", of: (p: PartialBrief) => p.cons?.length },
] as const;

export function BriefLiveProgress({ partial }: { partial: PartialBrief | null }) {
  if (!partial) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin text-slate-300" />
        Đang tìm và đọc các nguồn đánh giá…
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {ROWS.map(({ label, of }) => {
        const value = of(partial);
        const done = typeof value === "number" ? value > 0 : Boolean(value);
        return (
          <li key={label} className="flex items-center gap-2 text-sm">
            {done ? (
              <Check className="size-4 shrink-0 text-emerald-600" />
            ) : (
              <Loader2 className="size-4 shrink-0 animate-spin text-slate-300" />
            )}
            <span className={done ? "text-slate-800" : "text-slate-400"}>
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
