import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileText,
  History,
  Percent,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { aiSuggestions, currentUser, jobs, statSummary } from "@/lib/mock-data";
import { StatCard } from "@/components/dashboard/stat-card";
import { JobCard } from "@/components/dashboard/job-card";
import { AISuggestionCard } from "@/components/dashboard/ai-suggestion-card";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/* Hallmark pre-emit self-critique stamp:
 * Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: Slate-Violet · pre-emit critique: P5 H5 E5 S5 R5 V5
 */

export default function DashboardPage() {
  const topJobs = jobs.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Workbench Header Banner — Anti-slop high-density hero */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xs sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <Badge className="bg-primary-500/20 text-primary-300 ring-primary-400/30 font-mono text-[11px]">
                <Zap className="size-3 mr-1 text-primary-400" />
                AI Career Agent Dashboard
              </Badge>
              <span className="text-xs font-mono text-slate-400">· Last Sync: Hôm nay 16:20</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Xin chào, {currentUser.name.split(" ").slice(-2).join(" ")} 👋
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              Hôm nay hệ thống phát hiện{" "}
              <span className="font-mono font-semibold text-white">{statSummary.matchingJobsCount} việc làm</span>{" "}
              phù hợp với kỹ năng của bạn. Mức độ hoàn thiện hồ sơ đạt{" "}
              <span className="font-mono font-semibold text-emerald-400">{statSummary.profileCompletion}%</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/jobs">
              <Button variant="outline" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white">
                <Briefcase className="size-4" />
                Xem {statSummary.matchingJobsCount} việc làm
              </Button>
            </Link>
            <Link href="/dashboard/cv-optimizer">
              <Button variant="primary" className="bg-primary-600 hover:bg-primary-500 text-white">
                <Sparkles className="size-4" />
                Tối ưu CV với AI
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards — Workbench metric grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Hồ sơ của bạn"
          icon={User}
          value={`${statSummary.profileCompletion}%`}
          subtitle="Hoàn thiện hồ sơ để tăng AI Match score"
          actionLabel="Cập nhật thông tin"
          progress={statSummary.profileCompletion}
        />
        <StatCard
          title="Việc làm phù hợp"
          icon={Briefcase}
          value={statSummary.matchingJobsCount.toString()}
          subtitle={`+${statSummary.weeklyApplications} việc làm mới tuần này`}
          actionLabel="Xem việc phù hợp"
        />
        <StatCard
          title="Đơn ứng tuyển"
          icon={History}
          value={statSummary.applicationsCount.toString()}
          subtitle="3 vị trí đang chờ duyệt phỏng vấn"
          actionLabel="Lịch sử ứng tuyển"
        />
        <StatCard
          title="Tỷ lệ match TB"
          icon={Percent}
          value={`${statSummary.avgMatchRate}%`}
          subtitle="Tính trên 5 công việc lưu gần nhất"
          actionLabel="Chi tiết phân tích"
        />
      </div>

      {/* Top matching jobs section */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
              Việc làm phù hợp nhất
            </h2>
            <p className="text-xs text-slate-500">Xếp hạng bởi AI Matching Engine dựa trên điểm kỹ năng & kinh nghiệm</p>
          </div>
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Xem tất cả việc làm <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {topJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* AI suggestions & Match radar split panel */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AISuggestionCard suggestions={aiSuggestions} />
        </div>

        <Card className="border-slate-200/90 bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <Percent className="size-3.5" />
              </span>
              Điểm phù hợp hôm nay
            </CardTitle>
            <CardDescription className="text-xs">Đánh giá theo các tiêu chí trọng tâm của JD</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-4">
            <AIMatchProgress value={82} size={130} strokeWidth={9} />

            <div className="w-full space-y-2 border-t border-slate-100 pt-3">
              {[
                { label: "Kỹ năng chuyên môn", value: 95 },
                { label: "Kinh nghiệm làm việc", value: 88 },
                { label: "Mức lương & Địa điểm", value: 90 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    {row.label}
                  </span>
                  <span className="font-mono font-bold text-slate-900">{row.value}%</span>
                </div>
              ))}
            </div>

            <Link href="/dashboard/cv-optimizer" className="w-full mt-1">
              <Button variant="secondary" className="w-full">
                <FileText className="size-4" />
                Tối ưu CV cho JD này
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
