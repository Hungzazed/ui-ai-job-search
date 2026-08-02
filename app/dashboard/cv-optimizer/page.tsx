import { ArrowRight, CheckCircle2, Download, FileText, Sparkles, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const improvements = [
  { from: "Thiếu số liệu định lượng", to: "Thêm KPI cụ thể (giảm 45% load time, tăng 85% coverage)" },
  { from: "Mô tả chung chung", to: "Sử dụng động từ hành động + từ khóa từ JD (App Router, Core Web Vitals)" },
  { from: "Sắp xếp kỹ năng rải rác", to: "Nhóm kỹ năng theo mức độ khớp JD ở vị trí đầu tiên" },
  { from: "Thiếu section Dự án nổi bật", to: "Đưa AI Job Matching Platform lên đầu với 3 KPI chính" },
];

export default function CvOptimizerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="CV Optimizer"
        subtitle="So sánh CV gốc với bản đã tối ưu bởi AI cho từng JD cụ thể"
        actions={
          <>
            <Button variant="outline">
              <FileText className="size-4" />
              Chọn JD khác
            </Button>
            <Button>
              <Download className="size-4" />
              Tải xuống CV (PDF)
            </Button>
          </>
        }
      />

      {/* Optimization summary */}
      <Card className="border-primary-100 bg-gradient-to-r from-primary-50/70 to-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-600/25">
            <Wand2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">
              AI đã tối ưu 12 điểm nội dung cho JD “Senior Frontend Engineer — FPT Software”
            </p>
            <p className="text-sm text-slate-500">
              Điểm match dự kiến tăng từ <strong className="text-slate-700">76% → 92%</strong>
            </p>
          </div>
          <Badge variant="success" className="px-3 py-1 text-sm">+16 điểm AI Match</Badge>
        </div>
      </Card>

      {/* Side-by-side comparison */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-600">CV Gốc</CardTitle>
              <Badge variant="neutral">2 trang</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3 text-sm text-slate-500">
              <div>
                <p className="font-semibold text-slate-700">Nguyễn Minh An</p>
                <p className="text-xs">Frontend Engineer</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-xs font-semibold text-slate-600">TÓM TẮT</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Có 4 năm kinh nghiệm làm frontend với React, làm việc tại nhiều công ty lớn nhỏ...
                </p>
              </div>
              {["React · Vue · jQuery", "Làm dashboard cho khách hàng", "Hỗ trợ team phát triển"].map((line, i) => (
                <div key={line} className="flex items-start gap-2">
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-slate-300" />
                  <span className="text-xs">{line}</span>
                  {improvements[i] && (
                    <span className="ml-auto shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-500">
                      cải thiện
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden ring-2 ring-primary-200">
          <CardHeader className="border-b border-primary-100 bg-primary-50/60 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary-700">
                <Sparkles className="size-4" />
                CV Tối ưu bởi AI
              </CardTitle>
              <Badge variant="primary">1 trang · ATS-friendly</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-slate-900">Nguyễn Minh An</p>
                <p className="text-xs text-primary-600">Senior Frontend Engineer (React · TypeScript · Next.js)</p>
              </div>
              <div className="rounded-lg border border-primary-100 bg-primary-50/50 p-3">
                <p className="text-xs font-semibold text-primary-700">TÓM TẮT</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Senior Frontend Engineer 4+ năm, dẫn dắt design system cho 12 sản phẩm, giảm 45%
                  load time bằng code-splitting, tăng test coverage lên 85%.
                </p>
              </div>
              {improvements.map((improvement) => (
                <div key={improvement.from} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 line-through">{improvement.from}</p>
                    <p className="text-xs font-medium text-slate-700">{improvement.to}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement list */}
      <Card>
        <CardHeader>
          <CardTitle>Điều gì đã được thay đổi?</CardTitle>
          <CardDescription>Chi tiết từng thay đổi do AI đề xuất</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {improvements.map((improvement, index) => (
              <li key={improvement.from} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 line-through">{improvement.from}</p>
                  <p className="text-sm font-medium text-slate-800">{improvement.to}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-slate-300" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
