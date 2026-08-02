import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ArrowLeft, Activity, Globe, Bot } from "lucide-react";
import { activityData, adminKpis, jobSources } from "@/lib/mock-data";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityChart } from "@/components/dashboard/admin/activity-chart";
import { JobSourceDonut } from "@/components/dashboard/admin/job-source-donut";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Tổng quan vận hành hệ thống AI Career Agent"
        actions={
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="size-4" />
              Về trang chính
            </Button>
          </Link>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminKpis.map((kpi, index) => {
          const TrendIcon = kpi.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <Card key={kpi.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{kpi.label}</span>
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl",
                    index === 0 && "bg-primary-50 text-primary-600",
                    index === 1 && "bg-sky-50 text-sky-600",
                    index === 2 && "bg-emerald-50 text-emerald-600",
                    index === 3 && "bg-indigo-50 text-indigo-600",
                  )}
                >
                  {index === 3 ? <Bot className="size-4.5" /> : <Activity className="size-4.5" />}
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{kpi.value}</p>
              <p
                className={cn(
                  "mt-1 inline-flex items-center gap-1 text-xs font-medium",
                  kpi.trend === "up" ? "text-emerald-600" : "text-rose-600",
                )}
              >
                <TrendIcon className="size-3.5" />
                {kpi.change}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Hoạt động hệ thống</CardTitle>
            <CardDescription>Người dùng, ứng tuyển và AI requests — 7 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={activityData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-4.5 text-primary-600" />
              Nguồn việc làm
            </CardTitle>
            <CardDescription>Phân bố kênh thu thập dữ liệu job</CardDescription>
          </CardHeader>
          <CardContent>
            <JobSourceDonut data={jobSources} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
