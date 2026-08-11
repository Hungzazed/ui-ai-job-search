import Link from "next/link";
import { Briefcase, Sparkles, Zap } from "lucide-react";
import type { DashboardOverview } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Dải chào mừng tối màu trên cùng trang tổng quan. */
export function DashboardHero({
  firstName,
  data,
}: {
  firstName: string;
  data: DashboardOverview;
}) {
  const { matchingJobs } = data;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xs sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2.5">
            <Badge className="bg-primary-500/20 text-primary-300 ring-primary-400/30 font-mono text-[11px]">
              <Zap className="text-primary-400 mr-1 size-3" />
              AI Career Agent Dashboard
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Xin chào, {firstName} 👋
          </h1>
          <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
            {matchingJobs.total > 0 ? (
              <>
                Hệ thống đã chấm{" "}
                <span className="font-mono font-semibold text-white">
                  {matchingJobs.total} việc làm
                </span>{" "}
                phù hợp với hồ sơ của bạn. Mức độ hoàn thiện hồ sơ đạt{" "}
                <span className="font-mono font-semibold text-emerald-400">
                  {data.profileCompletion}%
                </span>
                .
              </>
            ) : (
              <>
                Chưa có công việc nào được chấm điểm. Hãy quét tin tuyển dụng để
                hệ thống bắt đầu đánh giá độ phù hợp.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/jobs">
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <Briefcase className="size-4" />
              Xem {matchingJobs.total} việc làm
            </Button>
          </Link>
          <Link href="/dashboard/cv-optimizer">
            <Button
              variant="primary"
              className="bg-primary-600 hover:bg-primary-500 text-white"
            >
              <Sparkles className="size-4" />
              Tối ưu CV với AI
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
