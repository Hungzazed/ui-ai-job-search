import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Building2, CheckCircle2, MapPin, Sparkles, Wallet } from "lucide-react";
import { jobs, jobDetail, defaultMatchDetail } from "@/lib/mock-data";
import { formatSalary } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const criteriaMeta: { key: keyof typeof defaultMatchDetail.criteria; label: string }[] = [
  { key: "skills", label: "Kỹ năng" },
  { key: "experience", label: "Kinh nghiệm" },
  { key: "projects", label: "Dự án" },
  { key: "level", label: "Cấp bậc" },
  { key: "salaryLocation", label: "Lương & Địa điểm" },
];

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = jobs.find((item) => item.id === id);

  if (!job) notFound();

  const detail = jobDetail[id] ?? defaultMatchDetail;

  return (
    <div className="space-y-6">
      {/* Job detail header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <CompanyLogo initials={job.companyInitials} color={job.companyColor} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-500">
                <Building2 className="size-4" />
                {job.company}
              </span>
              <Badge variant="success">{job.aiMatch}% AI Match</Badge>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {job.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <Wallet className="size-4" />
                {formatSalary(job.salary)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {job.location}
              </span>
              <span className="text-xs text-slate-400">Đăng ngày {job.postedAt}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <Link href={`/dashboard/applications/apply?job=${job.id}`}>
              <Button size="lg" className="w-full sm:w-auto">
                <Sparkles className="size-4" />
                Ứng tuyển ngay
              </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto">
              Lưu việc làm
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: AI JD summary + strengths/improvements */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4.5 text-primary-600" />
                Tóm tắt JD bởi AI
              </CardTitle>
              <CardDescription>Rút gọn từ mô tả gốc dựa trên hồ sơ của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-slate-600">
              <p>{detail.jdSummary.about}</p>
              <div>
                <h4 className="mb-2 font-semibold text-slate-900">Trách nhiệm chính</h4>
                <ul className="space-y-1.5">
                  {detail.jdSummary.responsibilities.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-slate-900">Yêu cầu công việc</h4>
                <ul className="space-y-1.5">
                  {detail.jdSummary.requirements.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-4.5 text-emerald-500" />
                Điểm mạnh của bạn
              </CardTitle>
              <CardDescription>Những điểm khiến AI đánh giá bạn nổi bật so với JD</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {detail.strengths.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4.5 text-amber-500" />
                Kỹ năng cần cải thiện
              </CardTitle>
              <CardDescription>Gợi ý để tăng điểm match cho lần ứng tuyển sau</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {detail.improvements.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-xl bg-amber-50/60 p-3 text-sm text-slate-700">
                    <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right: AI match score */}
        <div className="space-y-6">
          <Card className="p-6">
            <AIMatchProgress value={detail.overall} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Chi tiết đánh giá AI</CardTitle>
              <CardDescription>Mức độ khớp từng tiêu chí</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteriaMeta.map(({ key, label }) => {
                const value = detail.criteria[key];
                return (
                  <div key={key}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-semibold text-slate-900">{value}%</span>
                    </div>
                    <Progress
                      value={value}
                      barClassName={
                        value >= 85
                          ? "bg-emerald-500"
                          : value >= 70
                            ? "bg-primary-500"
                            : "bg-amber-500"
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-primary-100 bg-primary-50/50">
            <CardContent className="p-5 text-sm text-slate-600">
              <p className="mb-2 font-semibold text-primary-800">Mẹo từ AI</p>
              <p>
                Nộp đơn trong 48 giờ tới giúp tăng 1.8× khả năng được xem hồ sơ. Hãy dùng CV
                đã tối ưu cho JD này trong mục{" "}
                <Link href="/dashboard/cv-optimizer" className="font-semibold text-primary-700 underline">
                  CV Optimizer
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
