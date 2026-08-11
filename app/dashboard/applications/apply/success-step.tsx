import Link from "next/link";
import { CheckCircle2, FileText, PartyPopper } from "lucide-react";
import type { Application } from "@/types";
import { APPLICATION_STATUS_LABELS } from "@/lib/application-status";
import { companyColor, companyInitials } from "@/utils";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SuccessStep({
  created,
  onRestart,
}: {
  created: Application;
  onRestart: () => void;
}) {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50">
        <PartyPopper className="size-8 text-emerald-500" />
      </div>

      <h2 className="mt-4 text-xl font-bold text-slate-900">
        Đã tạo đơn ứng tuyển
      </h2>

      <div className="mt-4 flex items-center justify-center gap-3">
        <CompanyLogo
          initials={companyInitials(created.job.company)}
          color={companyColor(created.job.company)}
          src={created.job.companyLogo}
          size="sm"
        />
        <div className="text-left">
          <p className="text-sm font-semibold text-slate-900">
            {created.job.title}
          </p>
          <p className="text-xs text-slate-400">{created.job.company}</p>
        </div>
        <Badge variant="info">
          {APPLICATION_STATUS_LABELS[created.status]}
        </Badge>
      </div>

      {/* Nói rõ hàng đợi đang chạy chứ KHÔNG hứa là tài liệu đã sẵn sàng:
          worker mất 30-90 giây và có thể hỏng, hứa trước là hứa sai. */}
      <p className="mx-auto mt-4 flex max-w-md items-start gap-2 rounded-xl bg-slate-50 p-3 text-left text-xs leading-relaxed text-slate-600">
        <FileText className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
        <span>
          Hệ thống đang soạn CV và thư xin việc cho vị trí này. Việc đó mất
          khoảng 30–90 giây và có thể thất bại; xem kết quả ở mục{" "}
          <Link
            href="/dashboard/cv-optimizer"
            className="text-primary-600 font-semibold"
          >
            CV Optimizer
          </Link>{" "}
          và{" "}
          <Link
            href="/dashboard/cover-letter"
            className="text-primary-600 font-semibold"
          >
            Cover Letter
          </Link>
          .
        </span>
      </p>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <CheckCircle2 className="size-3.5 text-emerald-500" />
        Đang chuyển tới Lịch sử ứng tuyển…
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={onRestart}>
          Ứng tuyển việc khác
        </Button>
        <Link href="/dashboard/applications">
          <Button>Xem lịch sử ứng tuyển</Button>
        </Link>
      </div>
    </Card>
  );
}
