import Link from "next/link";
import { FileText, Mail, Mic, RotateCw, Sparkles } from "lucide-react";
import type { JobMatchWithJob } from "@/types";
import type { ProfileRecord, SystemMatch } from "@/services";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { ScoreBar } from "@/components/dashboard/score-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/utils";
import { SCORE_ROWS } from "./job-detail-constants";
function ScoringBasis({ profile }: { profile: ProfileRecord | null }) {
  if (!profile) return null;

  const skills = profile.primarySkills.slice(0, 4).join(", ");
  const parts = [profile.headline, skills].filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
      Chấm theo hồ sơ của bạn: <span className="text-slate-700">{parts.join(" · ")}</span>{" "}
      <Link href="/dashboard/profile" className="font-medium underline">
        Sửa hồ sơ
      </Link>
    </p>
  );
}
function SystemMatchCard({ system }: { system: SystemMatch | null }) {
  if (!system || system.total === 0) return null;
  const count = (kind: "SKILL" | "NICE") => {
    const rows = system.checks.filter((check) => check.kind === kind);
    return { met: rows.filter((r) => r.met === true).length, total: rows.length };
  };
  const must = count("SKILL");
  const nice = count("NICE");
  if (system.kind !== "REQUIREMENTS") {
    return (
      <Card>
        <CardContent className="text-sm text-slate-500">
          Tin này chưa được phân tích yêu cầu nên chưa đối chiếu được với hồ sơ.
        </CardContent>
      </Card>
    );
  }

  return (
    <SectionCard
      compact
      title="Hệ thống đối chiếu"
      description="So yêu cầu của tin với hồ sơ, không gọi AI"
    >
      <p className="text-sm font-semibold text-slate-800">
        Khớp {system.score}% yêu cầu của tin
      </p>

      <p className="mt-1 mb-3 text-xs text-slate-500">
        Đủ{" "}
        <span className="font-semibold text-slate-700">
          {must.met}/{must.total} bắt buộc
        </span>
        {nice.total > 0 && (
          <>
            {" · "}
            {nice.met}/{nice.total} ưu tiên
          </>
        )}
      </p>

      {system.eligibility === "FAIL" && (
        <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-900">
          Tin yêu cầu quốc tịch hoặc giấy phép lao động mà hồ sơ không đáp ứng.
        </p>
      )}

      <ul className="space-y-1.5">
        {system.checks.map((check) => (
          <li
            key={`${check.kind}-${check.label}`}
            className="flex items-start gap-2 text-sm"
            title={check.note}
          >
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                check.met === true && "bg-emerald-500",
                check.met === false && "bg-slate-300",
                check.met === null && "bg-amber-400",
              )}
            />
            <span
              className={cn(
                check.met === true ? "text-slate-700" : "text-slate-400",
              )}
            >
              {check.label}
              {check.kind === "NICE" && (
                <span className="ml-1 text-[11px] text-slate-400">ưu tiên</span>
              )}
              {check.met === null && (
                <span className="ml-1 text-[11px] text-amber-600">
                  chưa đủ dữ liệu
                </span>
              )}
              {check.via && (
                <span className="ml-1 text-[11px] text-teal-600">
                  qua từ tương đương: {check.via}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
export function MatchPanel({
  jobId,
  match,
  profile,
  system,
  onScore,
  scoring,
}: {
  jobId: string;
  match: JobMatchWithJob | null;
  profile: ProfileRecord | null;
  system: SystemMatch | null;
  onScore: (force: boolean) => void;
  scoring: boolean;
}) {
  return (
    <div className="space-y-6">
      <SystemMatchCard system={system} />
      {match ? (
        <>
          {match.overallScore !== null && (
            <Card className="p-6">
              <AIMatchProgress value={match.overallScore} />
              {match.stale && (
                <div className="mt-4 rounded-md bg-amber-50 px-3 py-2.5">
                  <p className="text-xs leading-relaxed text-amber-900">
                    Điểm này chấm <strong>trước khi bạn sửa hồ sơ</strong> nên có
                    thể không còn đúng.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    loading={scoring}
                    onClick={() => onScore(true)}
                  >
                    {!scoring && <RotateCw className="size-3.5" />}
                    Chấm lại theo hồ sơ hiện tại
                  </Button>
                </div>
              )}
              <ScoringBasis profile={profile} />
            </Card>
          )}

          <SectionCard
            compact
            title="Chi tiết đánh giá AI"
            description="Mức độ khớp từng chiều, kèm trọng số trong điểm tổng"
          >
            {SCORE_ROWS.map(({ key, label, weight }) => (
              <ScoreBar
                key={key}
                label={label}
                weight={weight}
                value={match[key]}
              />
            ))}
          </SectionCard>
        </>
      ) : (
        <Card>
          <CardContent className="flex items-start gap-2.5 text-sm text-slate-600">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div>
              <p className="font-semibold text-slate-800">
                Chưa chấm điểm phù hợp cho công việc này
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Mỗi đêm hệ thống chỉ chấm sẵn vài tin khớp nhất với hồ sơ của
                bạn. Tin này chưa nằm trong số đó — chấm ngay nếu bạn quan tâm.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                loading={scoring}
                onClick={() => onScore(false)}
              >
                {!scoring && <Sparkles className="size-3.5" />}
                Chấm điểm tin này
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex flex-wrap gap-2">
        <Link href={`/dashboard/cv-optimizer?jobId=${jobId}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            <FileText className="size-4" />
            Tối ưu CV
          </Button>
        </Link>
        <Link href={`/dashboard/cover-letter?jobId=${jobId}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Mail className="size-4" />
            Thư xin việc
          </Button>
        </Link>
        
        <Link href={`/dashboard/interview/${jobId}/mock`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Mic className="size-4" />
            Luyện phỏng vấn
          </Button>
        </Link>
      </div>
    </div>
  );
}
