"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Search, ShieldAlert, Wallet } from "lucide-react";
import { LocationText } from "@/components/dashboard/location-text";
import type { ApplicationStatus, JobMatchWithJob } from "@/types";
import { toJobCard } from "@/lib/adapters";
import { APPLICATION_STATUS_LABELS } from "@/lib/application-status";
import { cn, formatJobSalary } from "@/utils";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface JobPickerProps {
  matches: JobMatchWithJob[];
  /** Việc đã có đơn; giá trị null nghĩa là biết đã nộp nhưng chưa rõ trạng thái. */
  applied: Map<string, ApplicationStatus | null>;
  selectedId: string;
  onSelect: (jobId: string) => void;
}

export function JobPicker({
  matches,
  applied,
  selectedId,
  onSelect,
}: JobPickerProps) {
  if (matches.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-slate-500">
          Chưa có công việc nào được chấm điểm, nên chưa có gì để ứng tuyển. Đơn
          ứng tuyển luôn dựng trên một kết quả chấm điểm.
        </p>
        <Link href="/dashboard/jobs" className="mt-4 inline-block">
          <Button variant="outline">
            <Search className="size-4" />
            Xem việc làm phù hợp
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {matches.map((match) => (
        <JobOption
          key={match.jobId}
          match={match}
          active={match.jobId === selectedId}
          appliedStatus={applied.has(match.jobId)}
          status={applied.get(match.jobId) ?? null}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function JobOption({
  match,
  active,
  appliedStatus,
  status,
  onSelect,
}: {
  match: JobMatchWithJob;
  active: boolean;
  appliedStatus: boolean;
  status: ApplicationStatus | null;
  onSelect: (jobId: string) => void;
}) {
  const job = toJobCard(match);
  const isIneligible = match.eligibility === "FAIL";
  const blocked = appliedStatus || isIneligible;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 bg-white transition-all",
        active
          ? "border-primary-500 shadow-primary-500/10 shadow-md"
          : blocked
            ? "border-slate-200 opacity-75"
            : "border-slate-200 hover:border-slate-300",
      )}
    >
      <button
        type="button"
        disabled={blocked}
        onClick={() => onSelect(match.jobId)}
        className={cn(
          "flex w-full items-start gap-4 p-4 text-left",
          blocked ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <CompanyLogo
          initials={job.companyInitials}
          color={job.companyColor}
          src={job.companyLogo}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-400">{job.company}</p>
          <p className="font-semibold text-slate-900">{job.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <Wallet className="size-3.5" /> {formatJobSalary(job)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> <LocationText location={job.location} />
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {isIneligible ? (
            <Badge variant="danger">Không đủ điều kiện</Badge>
          ) : job.aiMatch === null ? (
            // Bản ghi chấm điểm còn đang chạy: chưa có điểm để nói.
            <Badge variant="neutral">Đang chấm điểm</Badge>
          ) : (
            <Badge variant={job.aiMatch >= 80 ? "success" : "warning"}>
              {job.aiMatch}% phù hợp
            </Badge>
          )}
          {appliedStatus && (
            <Badge variant="info">
              {status ? APPLICATION_STATUS_LABELS[status] : "Đã ứng tuyển"}
            </Badge>
          )}
        </div>
      </button>

      {blocked && (
        <div className="border-t border-slate-100 px-4 py-2.5 text-xs">
          {isIneligible ? (
            <p className="flex items-start gap-1.5 text-amber-700">
              <ShieldAlert className="mt-px size-3.5 shrink-0" />
              <span>
                {match.eligibilityNote ??
                  "Tin tuyển dụng đòi điều kiện mà hồ sơ của bạn không đáp ứng."}
              </span>
            </p>
          ) : (
            <Link
              href="/dashboard/applications"
              className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 font-semibold"
            >
              Xem đơn đã có <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
