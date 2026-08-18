"use client";

import type { Job } from "@/types";
import { JobCard } from "@/components/dashboard/job-card";
import { EmptyHint } from "@/components/ui/empty-state";

/**
 * Lưới thẻ việc làm. CHỈ hiển thị.
 *
 * Trước đây component này còn tự lọc và sắp xếp mảng đã tải. Điều đó làm ô tìm
 * kiếm nói dối: nó chỉ tìm trong 50 tin đang nằm sẵn trên trình duyệt, nên gõ
 * tên một công ty có thật ở trang 3 vẫn ra "không tìm thấy". Cả ba việc đó giờ
 * chạy ở SQL và đi qua `JobFilterBar`.
 */
export function JobList({
  jobs,
  onSavedChange,
}: {
  jobs: Job[];
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
    <div className="grid gap-4 lg:grid-cols-2">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onSavedChange={onSavedChange} />
      ))}
    </div>
  );
}
