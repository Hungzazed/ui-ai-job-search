import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  FileText,
  History,
  Percent,
  Sparkles,
  User,
} from "lucide-react";
import { aiSuggestions, currentUser, jobs, statSummary } from "@/lib/mock-data";
import { StatCard } from "@/components/dashboard/stat-card";
import { JobCard } from "@/components/dashboard/job-card";
import { AISuggestionCard } from "@/components/dashboard/ai-suggestion-card";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const topJobs = jobs.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-600 p-6 text-white shadow-lg shadow-primary-700/20 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 size-40 rounded-full bg-indigo-400/20 blur-xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Xin chào, {currentUser.name.split(" ").slice(-2).join(" ")} 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-100">
              {currentUser.name.split(" ")[0]} à, hôm nay có{" "}
              <strong className="font-semibold text-white">{statSummary.matchingJobsCount} việc làm</strong>{" "}
              khớp hồ sơ của bạn. Hồ sơ đang ở mức{" "}
              <strong className="font-semibold text-white">{statSummary.profileCompletion}%</strong> —
              bổ sung chút KPI sẽ tăng cơ hội phỏng vấn lên rất nhiều. Bắt đầu nhé!
            </p>
          </div>
          <Button className="bg-white text-primary-700 shadow-none hover:bg-primary-50">
            <Sparkles className="size-4" />
            Phân tích hồ sơ với AI
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Hồ sơ của bạn"
          icon={User}
          value={`${statSummary.profileCompletion}%`}
          subtitle="Hoàn thiện hơn để tăng AI match"
          actionLabel="Cập nhật ngay"
          progress={statSummary.profileCompletion}
        />
        <StatCard
          title="Việc làm phù hợp"
          icon={Briefcase}
          value={statSummary.matchingJobsCount.toString()}
          subtitle={`+${statSummary.weeklyApplications} mới trong tuần`}
          actionLabel="Xem danh sách"
        />
        <StatCard
          title="Lịch sử ứng tuyển"
          icon={History}
          value={statSummary.applicationsCount.toString()}
          subtitle="3 vị trí đang xem xét"
          actionLabel="Xem lịch sử"
        />
        <StatCard
          title="Tỷ lệ phù hợp TB"
          icon={Percent}
          value={`${statSummary.avgMatchRate}%`}
          subtitle="Trung bình 5 việc làm gần nhất"
          actionLabel="Xem phân tích"
        />
      </div>

      {/* Top matching jobs */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Việc làm phù hợp nhất</h2>
            <p className="text-sm text-slate-500">Được AI xếp hạng dựa trên hồ sơ của bạn</p>
          </div>
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {topJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* AI suggestions + quick insight */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AISuggestionCard suggestions={aiSuggestions} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Percent className="size-4" />
              </span>
              Điểm phù hợp hôm nay
            </CardTitle>
            <CardDescription>Tổng hợp từ các JD mới nhất</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <AIMatchProgress value={82} size={140} strokeWidth={11} />
            <div className="w-full space-y-2">
              {[
                { label: "Kỹ năng", value: 95 },
                { label: "Kinh nghiệm", value: 88 },
                { label: "Mức lương & địa điểm", value: 90 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-semibold text-slate-800">{row.value}%</span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/cv-optimizer" className="w-full">
              <Button variant="secondary" className="w-full">
                <FileText className="size-4" />
                Tối ưu CV với AI
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
