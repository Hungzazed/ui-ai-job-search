"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  MapPin,
  PartyPopper,
  Sparkles,
  Wallet,
} from "lucide-react";
import { jobs } from "@/lib/mock-data";
import { formatSalary } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Stepper } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Chọn việc làm", description: "Chọn vị trí muốn ứng tuyển" },
  { label: "Chuẩn bị hồ sơ", description: "Chọn CV & cover letter" },
  { label: "Điền thông tin", description: "Thông tin liên hệ" },
  { label: "Xác nhận", description: "Kiểm tra lại toàn bộ" },
  { label: "Hoàn tất", description: "Gửi hồ sơ" },
];

function ApplyWizard() {
  const searchParams = useSearchParams();
  const preselectedJob = searchParams.get("job") ?? "";

  const [step, setStep] = useState(0);
  const [jobId, setJobId] = useState(preselectedJob);
  const [cvVersion, setCvVersion] = useState("optimized");
  const [withCoverLetter, setWithCoverLetter] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });

  const selectedJob = jobs.find((job) => job.id === jobId);

  const canNext =
    (step === 0 && !!selectedJob) ||
    (step === 2 && form.name.trim() !== "" && form.email.trim() !== "");

  const next = () => canNext && setStep((value) => Math.min(value + 1, steps.length - 1));
  const back = () => setStep((value) => Math.max(value - 1, 0));

  return (
    <div>
      <PageHeader
        title="Ứng tuyển"
        subtitle="Quy trình 5 bước, AI hỗ trợ chuẩn bị hồ sơ cho từng JD"
      />

      <Card className="mb-6 p-5">
        <Stepper steps={steps} current={step} onStepClick={(index) => index < step && setStep(index)} />
      </Card>

      {/* Step 1: Choose job */}
      {step === 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {jobs.map((job) => {
            const active = job.id === jobId;
            return (
              <button
                key={job.id}
                type="button"
                onClick={() => setJobId(job.id)}
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-2xl border-2 bg-white p-4 text-left transition-all",
                  active
                    ? "border-primary-500 shadow-md shadow-primary-500/10"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <CompanyLogo initials={job.companyInitials} color={job.companyColor} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400">{job.company}</p>
                  <p className="font-semibold text-slate-900">{job.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <Wallet className="size-3.5" /> {formatSalary(job.salary)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" /> {job.location}
                    </span>
                  </div>
                </div>
                <Badge
                  className={cn(
                    "shrink-0",
                    job.aiMatch >= 80 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                  )}
                >
                  {job.aiMatch}% match
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: Prepare documents */}
      {step === 1 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileText className="size-4 text-primary-600" /> Chọn CV để gửi
            </p>
            <div className="space-y-2">
              {[
                { id: "optimized", label: "CV đã tối ưu bởi AI", desc: "Đạt 92% match với JD này", badge: "Đề xuất" },
                { id: "original", label: "CV gốc (Original.pdf)", desc: "Bản cũ chưa tối ưu", badge: null },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setCvVersion(option.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-xl border-2 p-3.5 text-left transition-all",
                    cvVersion === option.id
                      ? "border-primary-500 bg-primary-50/50"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-400">{option.desc}</p>
                  </div>
                  {option.badge && <Badge variant="primary">{option.badge}</Badge>}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Sparkles className="size-4 text-primary-600" /> Cover Letter
            </p>
            <button
              type="button"
              onClick={() => setWithCoverLetter((value) => !value)}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-xl border-2 p-3.5 text-left transition-all",
                withCoverLetter ? "border-primary-500 bg-primary-50/50" : "border-slate-200",
              )}
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">Tự động tạo bởi AI</p>
                <p className="text-xs text-slate-400">Nhấn để chọn/tắt — AI viết theo giọng chuyên nghiệp</p>
              </div>
              <Badge variant={withCoverLetter ? "primary" : "neutral"}>
                {withCoverLetter ? "Bật" : "Tắt"}
              </Badge>
            </button>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              CV và Cover Letter sẽ được cá nhân hóa với từ khóa của JD “{selectedJob?.title}” để tăng
              khả năng qua vòng sàng lọc ATS.
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Fill info */}
      {step === 2 && (
        <Card className="mx-auto max-w-2xl p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nguyễn Minh An"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+84 ..."
                />
              </div>
            </div>
            <div>
              <Label htmlFor="salary">Mức lương mong muốn</Label>
              <Select id="salary" defaultValue="negotiable">
                <option value="negotiable">Thương lượng</option>
                <option value="35-40">35 – 40 triệu</option>
                <option value="40-50">40 – 50 triệu</option>
                <option value="50+">Trên 50 triệu</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="note">Lời nhắn cho nhà tuyển dụng (tùy chọn)</Label>
              <Textarea
                id="note"
                rows={4}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Tôi có thể bắt đầu ngay, mong sớm được trao đổi thêm…"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {step === 3 && selectedJob && (
        <Card className="mx-auto max-w-2xl p-6">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Xác nhận thông tin ứng tuyển</h3>
          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {[
              ["Việc làm", `${selectedJob.title} — ${selectedJob.company}`],
              ["Mức lương", formatSalary(selectedJob.salary)],
              ["Địa điểm", selectedJob.location],
              ["CV đính kèm", cvVersion === "optimized" ? "CV tối ưu bởi AI" : "CV gốc"],
              ["Cover letter", withCoverLetter ? "Kèm thư AI" : "Không kèm"],
              ["Họ và tên", form.name || "—"],
              ["Email", form.email || "—"],
              ["Số điện thoại", form.phone || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
            Bằng cách gửi đơn này, bạn đồng ý cho nhà tuyển dụng xem hồ sơ và thông tin bạn cung cấp.
          </p>
        </Card>
      )}

      {/* Step 5: Done */}
      {step === 4 && (
        <Card className="mx-auto max-w-xl p-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50">
            <PartyPopper className="size-8 text-emerald-500" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-900">Hoàn tất! 🎉</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            Đơn ứng tuyển <strong className="text-slate-700">{selectedJob?.title}</strong> đã được
            gửi thành công. AI sẽ theo dõi trạng thái và nhắc bạn khi có phản hồi.
          </p>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-400">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Đã lưu vào lịch sử ứng tuyển
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>
              Ứng tuyển thêm
            </Button>
            <Button onClick={() => (window.location.href = "/dashboard/applications")}>
              Xem lịch sử ứng tuyển
            </Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      {step < 4 && (
        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            ← Quay lại
          </Button>
          <Button onClick={next} disabled={!canNext}>
            {step === 3 ? "Gửi hồ sơ" : "Tiếp tục"} →
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<PageHeader title="Ứng tuyển" />}>
      <ApplyWizard />
    </Suspense>
  );
}
