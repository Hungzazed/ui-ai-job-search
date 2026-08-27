import Link from "next/link";
import { FileText, Percent } from "@phosphor-icons/react/ssr";
import type { DashboardOverview } from "@/types";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { ScoreBar } from "@/components/dashboard/score-row";
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
  /*
   * MỘT vị từ cho "đã có điểm hay chưa", và nó là `overall !== null` chứ không
   * phải `sampleSize > 0`.
   *
   * Hai lý do. Thứ nhất, dùng hai vị từ khác nhau cho cùng một sự thật trong cùng
   * một thẻ là chỗ để chúng lệch nhau về sau. Thứ hai, chỉ `overall !== null` mới
   * thu hẹp được kiểu để `AIMatchProgress` nhận `number` — `sampleSize > 0` không
   * nói gì với TypeScript về `overall`, và chính khoảng trống đó đã sinh ra
   * `?? 0` cùng cái vòng 0% bịa.
   */
  const overall = todayScore.overall;

  const weakest = SCORE_ROWS.filter(
    (row) => todayScore[row.key] !== null,
  ).sort((a, b) => todayScore[a.key]! - todayScore[b.key]!)[0];

  return (
    <Card className="border-slate-200/90 bg-white">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="bg-primary-50 text-primary-700 flex size-6 items-center justify-center rounded-md">
            <Percent className="size-4" />
          </span>
          Điểm phù hợp gần đây
        </CardTitle>
        <CardDescription className="text-xs">
          {overall === null
            ? "Chưa có lần chấm nào"
            : `Trung bình ${todayScore.sampleSize} lần chấm gần nhất`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {/*
          Chưa có lần chấm nào thì KHÔNG vẽ vòng tròn.

          Trước đây chỗ này là `value={todayScore.overall ?? 0}`, nên khi chưa có
          dữ liệu thẻ vừa ghi "Chưa có lần chấm nào" vừa vẽ một vòng 0% màu đỏ kèm
          câu kết luận "Ít phù hợp — xem bổ sung kỹ năng". Đó không phải thiếu dữ
          liệu, đó là một phán xét bịa về hồ sơ người dùng. Ô "Tỷ lệ match TB" ngay
          trên đã tránh đúng cái bẫy này bằng cách hiện dấu gạch ngang.
        */}
        {overall === null ? (
          <div className="w-full py-6 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Chưa đủ dữ liệu để chấm
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Hoàn thiện hồ sơ và quét tin tuyển dụng, hệ thống sẽ chấm độ phù hợp
              rồi hiện phân tích tại đây.
            </p>
          </div>
        ) : (
          <div className="grid items-center gap-6 lg:grid-cols-[190px_1fr_210px]">
            <AIMatchProgress value={overall} size={130} strokeWidth={9} />

            <div className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {SCORE_ROWS.map((row) => (
                <ScoreBar
                  key={row.key}
                  label={row.label}
                  weight={row.weight}
                  value={todayScore[row.key]}
                />
              ))}
            </div>

            <div>
              {/*
                Nhãn cũ là "Tối ưu CV cho JD này" — sai cả khi CÓ dữ liệu: thẻ này là
                trung bình của `sampleSize` lần chấm gần nhất, không phải một JD, và
                link đi tới CV Optimizer chung chứ không mang theo việc nào.
              */}
              <Link href="/dashboard/cv-optimizer" className="w-full">
                <Button variant="secondary" className="w-full">
                  <FileText className="size-4.5" />
                  Mở CV Optimizer
                </Button>
              </Link>
              {weakest && (
                <p className="mt-2 text-center text-2xs leading-relaxed text-slate-500">
                  Thấp nhất là{" "}
                  <span className="font-semibold text-slate-700">
                    {weakest.label}
                  </span>{" "}
                  — bắt đầu từ đó
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
