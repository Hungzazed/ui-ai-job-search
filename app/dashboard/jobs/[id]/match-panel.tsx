import Link from "next/link";
import { FileText, Mail, RotateCw, Sparkles } from "lucide-react";
import type { JobMatchWithJob } from "@/types";
import type { ProfileRecord, SystemMatch } from "@/services";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { ScoreBar } from "@/components/dashboard/score-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/utils";
import { SCORE_ROWS } from "./job-detail-constants";

/**
 * Nói rõ điểm này chấm dựa trên cái gì.
 *
 * Người dùng upload CV rồi thấy điểm, và mặc định cho rằng máy chấm theo CV.
 * Thật ra nó chấm theo HỒ SƠ — nên khi kết quả trông sai, không có gì chỉ cho
 * họ chỗ cần sửa.
 */
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

/**
 * Đối chiếu hồ sơ với yêu cầu của tin, tính không cần model.
 *
 * Hiện dạng đếm chứ không phải phần trăm, và liệt kê từng dòng — đó là thứ điểm
 * AI không đưa ra được: nó kết luận chứ không chỉ ra thiếu gì.
 */
function SystemMatchCard({ system }: { system: SystemMatch | null }) {
  if (!system || system.total === 0) return null;

  const label =
    system.kind === "REQUIREMENTS"
      ? `Đáp ứng ${system.met}/${system.total} yêu cầu tin nêu ra`
      : `Khớp ${system.met}/${system.total} kỹ năng trong hồ sơ`;

  return (
    <SectionCard
      compact
      title="Hệ thống đối chiếu"
      description={
        system.kind === "REQUIREMENTS"
          ? "So yêu cầu của tin với hồ sơ, không gọi AI"
          : "Tin này chưa được rút trích yêu cầu; tạm đếm từ khoá"
      }
    >
      <p className="mb-3 text-sm font-semibold text-slate-800">{label}</p>

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
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

/** Cột phải: điểm tổng, điểm từng chiều, và lối đi tiếp sang tối ưu CV. */
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

      {/* Mang jobId theo để hai trang kia không phải hỏi lại "cho công việc nào". */}
      <div className="space-y-2">
        <Link href={`/dashboard/cv-optimizer?jobId=${jobId}`} className="block">
          <Button variant="secondary" className="w-full">
            <FileText className="size-4" />
            Tối ưu CV cho tin này
          </Button>
        </Link>
        <Link href={`/dashboard/cover-letter?jobId=${jobId}`} className="block">
          <Button variant="outline" className="w-full">
            <Mail className="size-4" />
            Viết thư xin việc cho tin này
          </Button>
        </Link>
      </div>
    </div>
  );
}
