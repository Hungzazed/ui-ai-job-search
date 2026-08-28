import Link from "next/link";
import type { DashboardOverview } from "@/types";
import { ENOUGH_MATCHES } from "./onboarding-state";

type Pill = {
  href: string;
  tone: "wait" | "todo" | "calm";
  text: React.ReactNode;
};

const DOT: Record<Pill["tone"], string> = {
  wait: "bg-amber-500",
  todo: "bg-rose-500",
  calm: "bg-emerald-500",
};

const SHELL: Record<Pill["tone"], string> = {
  wait: "border-slate-200/80 bg-white text-slate-700",
  todo: "border-amber-200 bg-amber-50 text-amber-900",
  calm: "border-slate-200/80 bg-white text-slate-700",
};

export function QuickStrip({ data }: { data: DashboardOverview }) {
  const profileGap = data.suggestions.find(
    (suggestion) => suggestion.id === "profile-incomplete",
  );

  const pills: Pill[] = [];

  if (data.applications.active > 0) {
    pills.push({
      href: "/dashboard/applications",
      tone: "wait",
      text: (
        <>
          <b className="font-semibold">{data.applications.active} đơn</b> đang chờ
          kết quả
        </>
      ),
    });
  }

  if (profileGap) {
    pills.push({
      href: "/dashboard/profile",
      tone: "todo",
      text: (
        <>
          <b className="font-semibold">Hồ sơ {data.profileCompletion}%</b> — hoàn
          thiện để {data.matchingJobs.total} tin được chấm chính xác hơn
        </>
      ),
    });
  }

  if (data.matchingJobs.total < ENOUGH_MATCHES) {
    pills.push({
      href: "/dashboard/jobs",
      tone: "wait",
      text: (
        <>
          Mới chấm{" "}
          <b className="font-semibold">
            {data.matchingJobs.total}/{ENOUGH_MATCHES} tin
          </b>{" "}
          — chấm thêm để có cái so sánh
        </>
      ),
    });
  }

  if (data.matchingJobs.newThisWeek > 0) {
    pills.push({
      href: "/dashboard/matches",
      tone: "calm",
      text: (
        <>
          <b className="font-semibold">
            {data.matchingJobs.newThisWeek} tin
          </b>{" "}
          bạn đã chấm bằng AI tuần này
        </>
      ),
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill, index) => (
        <Link
          key={index}
          href={pill.href}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors hover:border-slate-300 ${SHELL[pill.tone]}`}
        >
          <span className={`size-1.5 shrink-0 rounded-full ${DOT[pill.tone]}`} />
          {pill.text}
        </Link>
      ))}
    </div>
  );
}
