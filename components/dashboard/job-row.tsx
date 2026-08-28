"use client";

import { useState } from "react";
import { Bookmark, MapPin } from "@phosphor-icons/react/ssr";
import type { Job } from "@/types";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { JobTime } from "@/components/dashboard/job-time";
import { LocationText } from "@/components/dashboard/location-text";
import { cn, formatJobSalary } from "@/utils";

interface JobRowProps {
  job: Job;
  selected: boolean;
  onSelect: (jobId: string) => void;
  onSavedChange?: (jobId: string, saved: boolean) => void;
}
export function JobRow({
  job,
  selected,
  onSelect,
  onSavedChange,
}: JobRowProps) {
  const [pending, setPending] = useState<boolean | null>(null);
  const saved = pending ?? job.saved;
  if (pending !== null && pending === job.saved) setPending(null);

  const toggleSave = () => {
    const next = !saved;
    setPending(next);
    onSavedChange?.(job.id, next);
  };

  return (
    <li
      className={cn(
        "relative border-b border-slate-100 transition-colors last:border-b-0",
        selected ? "bg-primary-50/70" : "hover:bg-slate-50",
      )}
    >
      {selected && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-0.5 bg-primary-600"
        />
      )}

      <div className="flex gap-3 p-3.5">
        <CompanyLogo
          initials={job.companyInitials}
          color={job.companyColor}
          src={job.companyLogo}
          size="sm"
          className="mt-0.5 self-start"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            
            <button
              type="button"
              onClick={() => onSelect(job.id)}
              aria-current={selected ? "true" : undefined}
              className="min-w-0 text-left"
            >
              <span className="line-clamp-2 text-sm font-semibold tracking-tight text-slate-900">
                {job.title}
              </span>
              <span className="mt-0.5 block truncate text-xs text-slate-500">
                {job.company}
              </span>
              
              <span aria-hidden className="absolute inset-0" />
            </button>

            <button
              type="button"
              onClick={toggleSave}
              aria-label={saved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
              aria-pressed={saved}
              className="relative z-10 -m-1 shrink-0 rounded-md p-1 text-slate-300 transition-colors hover:bg-white hover:text-primary-600"
            >
              <Bookmark
                className={cn(
                  "size-4.5",
                  saved && "fill-primary-600 text-primary-600",
                )}
              />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5">
              <MapPin className="size-3.5 text-slate-400" />
              <LocationText location={job.location} />
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-medium text-slate-700">
              {formatJobSalary(job)}
            </span>
            {job.systemMatch?.kind === "REQUIREMENTS" &&
              job.systemMatch.total > 0 && (
                <span
                  className="rounded bg-teal-50 px-1.5 py-0.5 font-mono font-semibold text-teal-700"
                  title={`Hồ sơ đáp ứng ${job.systemMatch.met}/${job.systemMatch.total} yêu cầu tin nêu ra`}
                >
                  Khớp {job.systemMatch.met}/{job.systemMatch.total}
                </span>
              )}
          </div>

          <JobTime time={job.postedAt} className="text-2xs text-slate-400" />
        </div>
      </div>
    </li>
  );
}
