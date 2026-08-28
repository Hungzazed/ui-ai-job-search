import Link from "next/link";
import {
  ArrowClockwise,
  Check,
  CircleNotch,
  Envelope,
  FileText,
  Microphone,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import type { JobMatchDetail, ProfileRecord, SystemMatch } from "@/services";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { ScoreBar } from "@/components/dashboard/score-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/utils";
import { SCORE_ROWS } from "./job-detail-constants";
import type { PartialEvaluation } from "@/lib/match-stream";
function ScoringBasis({ profile }: { profile: ProfileRecord | null }) {
  if (!profile) return null;

  const skills = profile.primarySkills.slice(0, 4).join(", ");
  const parts = [profile.headline, skills].filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
      Chấm theo hồ sơ của bạn: <span className="text-slate-700">{parts.join(" · ")}</span>{" "}
      <Link
        href="/dashboard/profile"
        className="font-medium whitespace-nowrap underline"
      >
        Sửa hồ sơ
      </Link>
    </p>
  );
}
/** Mẫu số dưới mức này thì tỉ lệ nói dối nhiều hơn nói thật. */
const MIN_SCORABLE = 3;

function SystemMatchCard({
  system,
  profile,
}: {
  system: SystemMatch | null;
  profile: ProfileRecord | null;
}) {
  if (!system || system.total === 0) return null;
  const count = (kind: "SKILL" | "NICE") => {
    const rows = system.checks.filter((check) => check.kind === kind);
    return { met: rows.filter((r) => r.met === true).length, total: rows.length };
  };
  const must = count("SKILL");
  const nice = count("NICE");
  const location = system.checks.find((check) => check.kind === "LOCATION");
  const farAway = location?.met === false;
  const scorable = system.total >= MIN_SCORABLE;
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
      {farAway && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <span className="font-semibold">
            {location?.label?.replace(/^Địa điểm:\s*/, "Công ty ở ")}
          </span>
          {profile?.location ? ` — hồ sơ bạn ghi ${profile.location}` : ""}
        </p>
      )}

      {scorable ? (
        <>
          <p className="text-sm font-semibold text-slate-800">
            Đủ {must.met}/{must.total} yêu cầu bắt buộc
          </p>

          <p className="mt-1 mb-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {system.score}% có trọng số
            </span>
            {nice.total > 0 && (
              <>
                {" · "}
                {nice.met}/{nice.total} ưu tiên
              </>
            )}
          </p>
        </>
      ) : (
        <p className="mt-1 mb-3 text-xs text-slate-500">
          Tin này chỉ nêu {system.total} yêu cầu, chưa đủ để tính tỉ lệ.
        </p>
      )}

      {system.eligibility === "FAIL" && (
        <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-900">
          Tin yêu cầu quốc tịch hoặc giấy phép lao động mà hồ sơ không đáp ứng.
        </p>
      )}

      <ul className="columns-[15rem] gap-x-6">
        {system.checks.map((check) => (
          <li
            key={`${check.kind}-${check.label}`}
            className="mb-1.5 flex break-inside-avoid items-start gap-2 text-sm"
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
                <span className="ml-1 text-2xs text-slate-400">ưu tiên</span>
              )}
              {check.met === null && (
                <span className="ml-1 text-2xs text-amber-600">
                  chưa đủ dữ liệu
                </span>
              )}
              {check.kind === "LOCATION" && check.note && (
                <span className="ml-1 text-2xs text-slate-500">
                  {check.note}
                </span>
              )}
              {check.via && (
                <span className="ml-1 text-2xs text-teal-600">
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
const LIVE_ROWS = [
  { label: "Điều kiện dự tuyển", of: (p: PartialEvaluation) => p.eligibility?.verdict },
  { label: "Kỹ năng chuyên môn", of: (p: PartialEvaluation) => p.technical?.score },
  { label: "Kinh nghiệm làm việc", of: (p: PartialEvaluation) => p.experience?.score },
  { label: "Nhận xét tổng hợp", of: (p: PartialEvaluation) => p.recommendation },
] as const;

function LiveScoringCard({ partial }: { partial: PartialEvaluation | null }) {
  return (
    <SectionCard
      compact
      title="Đang chấm điểm"
      description="Kết quả hiện dần ngay khi AI viết ra"
    >
      <ul className="space-y-2">
        {LIVE_ROWS.map(({ label, of }) => {
          const value = partial ? of(partial) : undefined;
          const done = value !== undefined && value !== null && value !== "";
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
              {typeof value === "number" && (
                <span className="ml-auto font-semibold text-slate-800">
                  {value}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}

export function MatchPanel({
  jobId,
  match,
  partial,
  profile,
  system,
  onScore,
  scoring,
}: {
  jobId: string;
  match: JobMatchDetail | null;
  partial: PartialEvaluation | null;
  profile: ProfileRecord | null;
  system: SystemMatch | null;
  onScore: (force: boolean) => void;
  scoring: boolean;
}) {
  const scoreCard =
    match && match.overallScore !== null ? (
      <Card className="p-6">
        <AIMatchProgress value={match.overallScore} />
        {match.stale && (
          <div className="mt-4 rounded-md bg-amber-50 px-3 py-2.5">
            <p className="text-xs leading-relaxed text-amber-900">
              Điểm này chấm <strong>trước khi bạn sửa hồ sơ</strong> nên có thể
              không còn đúng.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              loading={scoring}
              onClick={() => onScore(true)}
            >
              {!scoring && <ArrowClockwise className="size-4" />}
              Chấm lại theo hồ sơ hiện tại
            </Button>
          </div>
        )}
        <ScoringBasis profile={profile} />
      </Card>
    ) : null;

  const detailCard = match ? (
    <SectionCard
      compact
      title="Chi tiết đánh giá AI"
      description="Mức độ khớp từng chiều, kèm trọng số trong điểm tổng"
    >
      {SCORE_ROWS.map(({ key, label, weight }) => (
        <ScoreBar key={key} label={label} weight={weight} value={match[key]} />
      ))}
    </SectionCard>
  ) : (
    <Card>
      <CardContent className="flex items-start gap-2.5 text-sm text-slate-600">
        <Sparkle className="mt-0.5 size-4.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-semibold text-slate-800">
            Chưa chấm điểm phù hợp cho công việc này
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Mỗi đêm hệ thống chỉ chấm sẵn vài tin khớp nhất với hồ sơ của bạn.
            Tin này chưa nằm trong số đó — chấm ngay nếu bạn quan tâm.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            loading={scoring}
            onClick={() => onScore(false)}
          >
            {!scoring && <Sparkle className="size-4" />}
            Chấm điểm tin này
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const paired = Boolean(system && system.total > 0) && scoreCard !== null;

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Link href={`/dashboard/cv-optimizer?jobId=${jobId}`} className="flex-1">
        <Button variant="secondary" className="w-full">
          <FileText className="size-4.5" />
          Tối ưu CV cho tin này
        </Button>
      </Link>
      <Link href={`/dashboard/cover-letter?jobId=${jobId}`} className="flex-1">
        <Button variant="outline" className="w-full">
          <Envelope className="size-4.5" />
          Thư xin việc
        </Button>
      </Link>

      <Link href={`/dashboard/interview/${jobId}/mock`} className="flex-1">
        <Button variant="outline" className="w-full">
          <Microphone className="size-4.5" />
          Luyện phỏng vấn
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="@container space-y-6">
      {paired ? (
        <>
          <div className="grid items-start gap-6 @3xl:grid-cols-2">
            <SystemMatchCard system={system} profile={profile} />
            <div className="space-y-6">
              {scoring && <LiveScoringCard partial={partial} />}
              {scoreCard}
            </div>
          </div>
          {actions}
          {detailCard}
        </>
      ) : (
        <>
          {scoring && <LiveScoringCard partial={partial} />}
          {scoreCard}
          {scoreCard && actions}
          {detailCard}
          {!scoreCard && actions}
          <SystemMatchCard system={system} profile={profile} />
        </>
      )}
    </div>
  );
}
