import { Check, CircleNotch } from "@phosphor-icons/react/ssr";
import { SectionCard } from "@/components/ui/section-card";

export interface PartialLetter {
  salutation?: string;
  opening?: string;
  bodyParagraphs?: string[];
  motivation?: string;
  closing?: string;
}

const ROWS = [
  { label: "Lời chào", of: (p: PartialLetter) => p.salutation },
  { label: "Đoạn mở", of: (p: PartialLetter) => p.opening },
  { label: "Thân bài", of: (p: PartialLetter) => p.bodyParagraphs?.length },
  { label: "Vì sao công ty này", of: (p: PartialLetter) => p.motivation },
  { label: "Đoạn kết", of: (p: PartialLetter) => p.closing },
] as const;

export function LetterLiveProgress({
  partial,
}: {
  partial: PartialLetter | null;
}) {
  return (
    <SectionCard
      compact
      title="Đang viết thư"
      description="Từng đoạn hiện ra ngay khi AI viết xong"
    >
      <ul className="space-y-2">
        {ROWS.map(({ label, of }) => {
          const value = partial ? of(partial) : undefined;
          const done = typeof value === "number" ? value > 0 : Boolean(value);
          return (
            <li key={label} className="flex items-center gap-2 text-sm">
              {done ? (
                <Check className="size-4.5 shrink-0 text-emerald-600" />
              ) : (
                <CircleNotch className="size-4.5 shrink-0 animate-spin text-slate-300" />
              )}
              <span className={done ? "text-slate-800" : "text-slate-400"}>
                {label}
              </span>
              {typeof value === "number" && value > 0 && (
                <span className="ml-auto text-xs font-semibold text-slate-500">
                  {value} đoạn
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
