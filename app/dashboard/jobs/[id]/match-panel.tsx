import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";
import type { JobMatchWithJob } from "@/types";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { ScoreBar } from "@/components/dashboard/score-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { SCORE_ROWS } from "./job-detail-constants";

/** Cột phải: điểm tổng, điểm từng chiều, và lối đi tiếp sang tối ưu CV. */
export function MatchPanel({ match }: { match: JobMatchWithJob | null }) {
  return (
    <div className="space-y-6">
      {match ? (
        <>
          {match.overallScore !== null && (
            <Card className="p-6">
              <AIMatchProgress value={match.overallScore} />
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
                Khi hệ thống chấm xong, điểm phù hợp cùng điểm mạnh và khoảng
                cách so với yêu cầu sẽ hiện ở đây.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Link href="/dashboard/cv-optimizer" className="block">
        <Button variant="secondary" className="w-full">
          <FileText className="size-4" />
          Tối ưu CV cho JD này
        </Button>
      </Link>
    </div>
  );
}
