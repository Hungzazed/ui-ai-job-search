import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DashboardOverview } from "@/types";
import { toJobCard } from "@/lib/adapters";
import { JobCard } from "@/components/dashboard/job-card";
import { EmptyHint } from "@/components/ui/empty-state";

export function TopMatches({
  matches,
}: {
  matches: DashboardOverview["topMatches"];
}) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
            Việc làm phù hợp nhất
          </h2>
          <p className="text-xs text-slate-500">
            Xếp hạng theo điểm phù hợp tổng hợp, đã loại tin không đủ điều kiện
            ứng tuyển
          </p>
        </div>
        <Link
          href="/dashboard/jobs"
          className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
        >
          Xem tất cả việc làm <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {matches.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {matches.map((match) => (
            <JobCard key={match.jobId} job={toJobCard(match)} />
          ))}
        </div>
      ) : (
        <EmptyHint>Chưa có công việc nào được chấm điểm.</EmptyHint>
      )}
    </section>
  );
}
