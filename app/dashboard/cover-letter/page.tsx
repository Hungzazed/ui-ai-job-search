"use client";

import { useState } from "react";
import { Copy, Download, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";

const sampleLetter = `Kính gửi Ban tuyển dụng FPT Software,

Tôi là Nguyễn Minh An — Senior Frontend Engineer với 4+ năm kinh nghiệm xây dựng sản phẩm web hiệu suất cao bằng React, TypeScript và Next.js.

Với vị trí Senior Frontend Engineer mà quý công ty đang tuyển, tôi nhận thấy sự khớp nhau rất lớn giữa hồ sơ của tôi và yêu cầu công việc:

• Tôi từng dẫn dắt design system phục vụ 12 sản phẩm, giúp giảm 40% thời gian phát triển.
• Tối ưu Core Web Vitals: cắt giảm 45% thời gian tải trang bằng code-splitting và caching.
• Thành thạo testing toolchain (Jest, Playwright) — tăng test coverage lên 85%.

Tôi đặc biệt ấn tượng với quy mô Global Delivery Center của FPT Software và tin rằng kinh nghiệm mentoring lập trình viên junior cùng tư duy performance-first của tôi sẽ đóng góp tích cực cho team.

Rất mong được trao đổi thêm trong buổi phỏng vấn sắp tới. Xin chân thành cảm ơn!

Trân trọng,
Nguyễn Minh An
📞 +84 90 123 4567 · minhan.nguyen@gmail.com · TP. Hồ Chí Minh`;

export default function CoverLetterPage() {
  const [company, setCompany] = useState("FPT Software");
  const [position, setPosition] = useState("Senior Frontend Engineer (React/Next.js)");
  const [tone, setTone] = useState("professional");
  const [focus, setFocus] = useState(
    "Nhấn mạnh kinh nghiệm design system, performance optimization và khả năng lead team.",
  );
  const [generated, setGenerated] = useState(true);

  const handleGenerate = () => setGenerated(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cover Letter"
        subtitle="Tạo thư xin việc tự động dựa trên JD và hồ sơ của bạn"
        actions={
          <Button
            onClick={handleGenerate}
            loading={!generated}
          >
            <Sparkles className="size-4" />
            Tạo lại bằng AI
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Form */}
        <Card className="h-fit xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="size-4.5 text-primary-600" />
              Cấu hình thư
            </CardTitle>
            <CardDescription>AI sẽ dựa vào các thông tin này để sinh nội dung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company">Công ty</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="position">Vị trí ứng tuyển</Label>
              <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tone">Giọng điệu</Label>
              <Select id="tone" value={tone} onChange={(e) => setTone(e.target.value)}>
                <option value="professional">Chuyên nghiệp</option>
                <option value="friendly">Thân thiện</option>
                <option value="confident">Tự tin</option>
                <option value="concise">Ngắn gọn</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="focus">Trọng tâm cần nhấn</Label>
              <Textarea
                id="focus"
                rows={4}
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleGenerate}>
                <Sparkles className="size-4" />
                Tạo Cover Letter
              </Button>
              <Button variant="outline" size="icon" title="Làm mới">
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="xl:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Bản nháp — {company}</CardTitle>
              <CardDescription>
                {position} · Giọng điệu: {tone === "professional" ? "Chuyên nghiệp" : tone}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Copy className="size-3.5" />
                Sao chép
              </Button>
              <Button size="sm">
                <Download className="size-3.5" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                {sampleLetter}
              </pre>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              AI-generated · Kiểm tra lại tên công ty, người nhận và thông tin liên hệ trước khi gửi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
