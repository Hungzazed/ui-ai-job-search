"use client";

import type { Job } from "@/types";
import { JobRow } from "@/components/dashboard/job-row";
import { EmptyHint } from "@/components/ui/empty-state";
export function JobList({
  jobs,
  selectedId,
  onSelect,
  onSavedChange,
}: {
  jobs: Job[];
  selectedId: string | null;
  onSelect: (jobId: string) => void;
  onSavedChange?: (jobId: string, saved: boolean) => void;
}) {
  if (jobs.length === 0) {
    return (
      <EmptyHint className="rounded-2xl border-slate-200 bg-white p-12">
        Không tìm thấy việc làm nào khớp với bộ lọc hiện tại.
      </EmptyHint>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {jobs.map((job) => (
        <JobRow
          key={job.id}
          job={job}
          selected={job.id === selectedId}
          onSelect={onSelect}
          onSavedChange={onSavedChange}
        />
      ))}
    </ul>
  );
}
