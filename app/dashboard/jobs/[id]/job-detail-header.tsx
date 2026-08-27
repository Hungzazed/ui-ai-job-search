"use client";

import {
  Bookmark,
  Building2,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { Job } from "@/types";
import type { JobMatchDetail, JobRecord } from "@/services";
import { cn, formatJobSalary } from "@/utils";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { JobTime } from "@/components/dashboard/job-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VERDICT_META } from "./job-detail-constants";

interface JobDetailHeaderProps {
  card: Job;
  job: JobRecord;
  match: JobMatchDetail | null;
  saved: boolean;
  onToggleSave: () => void;
  onApply: () => void;
  applying?: boolean;
  applied?: boolean;
}

export function JobDetailHeader({
  card,
  job,
  match,
  saved,
  onToggleSave,
  onApply,
  applying,
  applied,
}: JobDetailHeaderProps) {
  const verdict = match?.verdict ? VERDICT_META[match.verdict] : null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start gap-4">
        <CompanyLogo
          initials={card.companyInitials}
          color={card.companyColor}
          src={card.companyLogo}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-500">
              <Building2 className="size-4" />
              {card.company}
            </span>
            {match?.overallScore !== null && match?.overallScore !== undefined && (
              <Badge variant="success" className="font-mono">
                {match.overallScore}% phù hợp
              </Badge>
            )}
            {verdict && <Badge variant={verdict.variant}>{verdict.label}</Badge>}
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {card.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <Wallet className="size-4" />
              {formatJobSalary(card)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {card.location}
            </span>
            {job.workMode && (
              <span className="text-xs text-slate-400">{job.workMode}</span>
            )}
            <JobTime time={card.postedAt} className="text-xs text-slate-400" />
          </div>
          {card.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={onApply}
            loading={applying}
            disabled={applied}
          >
            <Sparkles className="size-4" />
            {applied ? "Đã tạo đơn" : "Ứng tuyển ngay"}
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onToggleSave}
          >
            <Bookmark
              className={cn(
                "size-4",
                saved && "fill-primary-600 text-primary-600",
              )}
            />
            {saved ? "Đã lưu" : "Lưu việc làm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
