import { ArrowRight, CheckCircle2, Download, FileText, Sparkles, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/* Hallmark pre-emit self-critique stamp:
 * Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: Slate-Violet · pre-emit critique: P5 H5 E5 S5 R5 V5
 */

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
        title="CV Optimizer Engine"
        subtitle="Phân tích & Tinh chỉnh nội dung CV theo chuẩn ATS phù hợp nhất với mô tả công việc (JD)"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileText className="size-4" />
              Chọn JD khác
            </Button>
            <Button variant="primary" size="sm">
              <Download className="size-4" />
              Tải CV PDF (Tối ưu)
            </Button>
          </div>
        }
      />

      {/* Optimization summary bar */}
      <Card className="border-slate-200/90 bg-white p-4.5 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary-600 text-white shadow-xs">
              <Wand2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                AI đã hoàn tất tối ưu 12 điểm nội dung cho JD <span className="font-mono text-primary-700 font-bold">"Senior Frontend Engineer — FPT Software"</span>
              </p>
              <p className="text-xs text-slate-500">
                Điểm match dự kiến nâng từ <span className="font-mono font-semibold text-slate-700">76%</span> lên <span className="font-mono font-bold text-emerald-700">92%</span>
              </p>
            </div>
          </div>
          <Badge variant="success" dot className="font-mono text-xs px-3 py-1 font-bold">
            +16% Match Score
          </Badge>
        </div>
      </Card>

      {/* Side-by-side comparison */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Original CV */}
        <Card className="overflow-hidden border-slate-200/80">
          <CardHeader className="border-b border-slate-100 bg-slate-50/80 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Bản CV Gốc</CardTitle>
              <Badge variant="neutral" className="font-mono text-[11px]">2 trang · Chưa tối ưu</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4.5 space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-900">Nguyễn Minh An</p>
              <p className="text-xs text-slate-500 font-mono">Frontend Engineer</p>
            </div>
            <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-3">
              <p className="text-[11px] font-mono font-bold uppercase text-slate-500">Tóm tắt ban đầu</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Có 4 năm kinh nghiệm làm frontend với React, làm việc tại nhiều công ty lớn nhỏ...
              </p>
            </div>
            <div className="space-y-2.5 pt-1">
              {["React · Vue · jQuery", "Làm dashboard cho khách hàng", "Hỗ trợ team phát triển"].map((line, i) => (
                <div key={line} className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/40 p-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-slate-300" />
                    <span>{line}</span>
                  </div>
                  {improvements[i] && (
                    <span className="rounded bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-rose-600">
                      Cần cải thiện
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Optimized CV */}
        <Card className="overflow-hidden border-primary-200 ring-1 ring-primary-500/20">
          <CardHeader className="border-b border-primary-100 bg-primary-50/60 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-900">
                <Sparkles className="size-3.5 text-primary-600" />
                Bản CV Tối ưu bởi AI Agent
              </CardTitle>
              <Badge variant="primary" dot className="font-mono text-[11px] font-bold">
                1 trang · ATS Ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4.5 space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-900">Nguyễn Minh An</p>
              <p className="text-xs font-mono font-medium text-primary-700">Senior Frontend Engineer (React · TypeScript · Next.js)</p>
            </div>
            <div className="rounded-lg border border-primary-100 bg-primary-50/40 p-3">
              <p className="text-[11px] font-mono font-bold uppercase text-primary-800">Tóm tắt chuyên nghiệp (Tối ưu JD)</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-700">
                Senior Frontend Engineer 4+ năm kinh nghiệm, dẫn dắt design system cho 12 sản phẩm, giảm 45%
                load time bằng code-splitting, tăng test coverage lên 85%.
              </p>
            </div>
            <div className="space-y-2.5 pt-1">
              {improvements.map((improvement) => (
                <div key={improvement.from} className="flex items-start gap-2.5 rounded-md border border-emerald-100 bg-emerald-50/30 p-2.5 text-xs">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 line-through">{improvement.from}</p>
                    <p className="text-xs font-medium text-slate-800">{improvement.to}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement breakdown table */}
      <Card className="border-slate-200/90">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-bold">Nhật ký thay đổi chi tiết từ AI Agent</CardTitle>
          <CardDescription className="text-xs">Giải thích lý do từng câu từ được tinh chỉnh để vượt qua bộ lọc ATS</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="divide-y divide-slate-100">
            {improvements.map((improvement, index) => (
              <div key={improvement.from} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-700 border border-slate-200/60">
                  0{index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 line-through">{improvement.from}</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-900 mt-0.5">{improvement.to}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-slate-300" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
