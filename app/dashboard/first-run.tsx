import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react/ssr";
import type { DashboardOverview } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { PROFILE_READY } from "./onboarding-state";

type Step = {
  title: string;
  detail: string;
  action?: { label: string; href: string };
  state: "done" | "now" | "later";
};

function StepCard({ step, index }: { step: Step; index: number }) {
  const done = step.state === "done";
  const now = step.state === "now";

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border p-4",
        done && "border-emerald-200 bg-emerald-50/60",
        now && "border-primary-300 bg-primary-50/60",
        step.state === "later" && "border-slate-200/80 bg-slate-50/50",
      )}
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full text-2xs font-bold",
          done && "bg-emerald-600 text-white",
          now && "bg-primary-600 text-white",
          step.state === "later" && "bg-slate-200 text-slate-500",
        )}
      >
        {done ? <Check className="size-3.5" /> : index + 1}
      </span>

      <p className="text-sm font-semibold text-slate-900">{step.title}</p>
      <p className="text-xs leading-relaxed text-slate-500">{step.detail}</p>

      {step.action && now && (
        <Link href={step.action.href} className="mt-1.5">
          <Button size="sm">{step.action.label}</Button>
        </Link>
      )}
    </div>
  );
}

function GhostJob({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-200 bg-white/60 p-3.5">
      <div className="flex items-start gap-2.5">
        <div className="size-8 shrink-0 rounded-lg border border-dashed border-slate-200 bg-slate-100" />
        <div className="min-w-0 flex-1">
          <p className="text-2xs text-slate-400">Công ty</p>
          <p className="truncate text-xs font-semibold text-slate-500">{title}</p>
        </div>
        <span
          aria-hidden
          className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-2xs font-bold text-transparent [text-shadow:0_0_7px_rgba(5,150,105,0.85)]"
        >
          81%
        </span>
      </div>
      <p className="rounded-md bg-slate-50 px-2.5 py-1.5 text-2xs text-slate-400">
        Vì sao hợp: điểm mạnh lấy từ hồ sơ của bạn
      </p>
    </div>
  );
}

export function FirstRun({
  firstName,
  data,
}: {
  firstName: string;
  data: DashboardOverview;
}) {
  const hasProfile = data.profileCompletion > 0;
  const profileReady = data.profileCompletion >= PROFILE_READY;

  const steps: Step[] = [
    {
      title: "Tải CV lên",
      detail:
        "Hệ thống tự đọc kinh nghiệm, dự án, kỹ năng và học vấn từ file PDF của bạn.",
      action: { label: "Tải CV lên", href: "/dashboard/profile/upload" },
      state: hasProfile ? "done" : "now",
    },
    {
      title: "Duyệt lại hồ sơ",
      detail: hasProfile
        ? `Hồ sơ đang ở mức ${data.profileCompletion}%. Xem hệ thống đọc đúng chưa, sửa chỗ sai.`
        : "Xem hệ thống đọc đúng chưa, sửa chỗ sai. Đây là căn cứ cho mọi lần chấm về sau.",
      action: { label: "Mở hồ sơ", href: "/dashboard/profile" },
      state: profileReady ? "done" : hasProfile ? "now" : "later",
    },
    {
      title: "Chấm điểm việc làm",
      detail:
        "Mở một tin bất kỳ và bấm chấm điểm. Hệ thống so tin đó với hồ sơ rồi cho biết hợp ở đâu, thiếu ở đâu.",
      action: { label: "Xem việc làm", href: "/dashboard/jobs" },
      state: profileReady ? "now" : "later",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          {hasProfile
            ? "Còn một bước nữa"
            : `Chào ${firstName}, bắt đầu từ hồ sơ của bạn`}
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
          {hasProfile
            ? "Hồ sơ đã có. Chấm điểm một tin bất kỳ để thấy hệ thống so sánh thế nào."
            : "Mất khoảng 5 phút. Xong bước cuối, mỗi tin tuyển dụng sẽ kèm điểm phù hợp và lý do vì sao hợp hoặc không."}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>

        <p className="mt-4 border-t border-slate-100 pt-3.5 text-xs text-slate-500">
          Chưa muốn tạo hồ sơ?{" "}
          <Link
            href="/dashboard/jobs"
            className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 font-semibold"
          >
            Duyệt tất cả tin tuyển dụng <ArrowRight className="size-3.5" />
          </Link>{" "}
          — xem và lưu tin được, chỉ chưa có điểm phù hợp.
        </p>
      </div>

      {!hasProfile && (
        <section>
          <p className="mb-2.5 text-xs text-slate-500">
            Xong bước 1, mỗi tin sẽ hiện như thế này:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <GhostJob title="Fullstack Developer" />
            <GhostJob title="Backend Engineer" />
            <GhostJob title="Frontend Developer" />
          </div>
        </section>
      )}
    </div>
  );
}
