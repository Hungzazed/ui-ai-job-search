import Link from "next/link";
import { FileText, Percent } from "lucide-react";
import type { DashboardOverview } from "@/types";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { ScoreLine } from "@/components/dashboard/score-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Bốn hàng dưới vòng tròn "Điểm phù hợp hôm nay".
 *
 * Đúng bằng bốn chiều CÓ TRỌNG SỐ trong `04-job-evaluation.md`. Bản mock trước
 * đây có hàng "Mức lương & Địa điểm" — đã bỏ, vì khung đánh giá không chấm
 * lương, nên con số 90% ở đó không dựa trên bất cứ thứ gì.
 */
const SCORE_ROWS = [
  { key: "skills", label: "Kỹ năng chuyên môn", weight: "30%" },
  { key: "experience", label: "Kinh nghiệm làm việc", weight: "25%" },
  { key: "behavioral", label: "Hành vi & văn hoá", weight: "15%" },
  { key: "career", label: "Định hướng nghề nghiệp", weight: "30%" },
] as const;

export function ScoreBreakdown({
  todayScore,
}: {
  todayScore: DashboardOverview["todayScore"];
}) {
  const hasScores = todayScore.sampleSize > 0;

  return (
    <Card className="border-slate-200/90 bg-white">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="bg-primary-50 text-primary-700 flex size-6 items-center justify-center rounded-md">
            <Percent className="size-3.5" />
          </span>
          Điểm phù hợp gần đây
        </CardTitle>
        <CardDescription className="text-xs">
          {hasScores
            ? `Trung bình ${todayScore.sampleSize} lần chấm gần nhất`
            : "Chưa có lần chấm nào"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pt-4">
        <AIMatchProgress
          value={todayScore.overall ?? 0}
          size={130}
          strokeWidth={9}
        />

        <div className="w-full space-y-2 border-t border-slate-100 pt-3">
          {SCORE_ROWS.map((row) => (
            <ScoreLine
              key={row.key}
              label={row.label}
              weight={row.weight}
              value={todayScore[row.key]}
            />
          ))}
        </div>

        <Link href="/dashboard/cv-optimizer" className="mt-1 w-full">
          <Button variant="secondary" className="w-full">
            <FileText className="size-4" />
            Tối ưu CV cho JD này
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
