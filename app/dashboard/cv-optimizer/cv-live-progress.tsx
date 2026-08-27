import { Check, Loader2 } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import type { PartialCv } from "@/lib/cv-partial";

const ROWS = [
  { label: "Giới thiệu bản thân", of: (p: PartialCv) => p.profileStatement },
  { label: "Năng lực cốt lõi", of: (p: PartialCv) => p.coreCompetencies?.length },
  { label: "Kinh nghiệm làm việc", of: (p: PartialCv) => p.experiences?.length },
  { label: "Dự án", of: (p: PartialCv) => p.projects?.length },
  { label: "Học vấn", of: (p: PartialCv) => p.educations?.length },
  { label: "Nhóm kỹ năng", of: (p: PartialCv) => p.skillGroups?.length },
] as const;

export function CvLiveProgress({ partial }: { partial: PartialCv | null }) {
  return (
    <SectionCard
      compact
      title="Đang viết CV"
      description="Từng mục hiện ra ngay khi AI viết xong"
    >
      <ul className="space-y-2">
        {ROWS.map(({ label, of }) => {
          const value = partial ? of(partial) : undefined;
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
              {typeof value === "number" && value > 0 && (
                <span className="ml-auto text-xs font-semibold text-slate-500">
                  {value} mục
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
