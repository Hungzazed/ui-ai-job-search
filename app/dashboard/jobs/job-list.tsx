"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Job } from "@/types";
import { JobCard } from "@/components/dashboard/job-card";
import { EmptyHint } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/form";
import { SearchInput } from "@/components/ui/search-input";

const sortOptions = [
  { value: "match", label: "Điểm AI Match" },
  { value: "newest", label: "Mới nhất" },
  { value: "salary", label: "Lương cao nhất" },
];

interface JobListProps {
  jobs: Job[];
  onSavedChange?: (jobId: string, saved: boolean) => void;
}

export function JobList({ jobs, onSavedChange }: JobListProps) {
  const [query, setQuery] = useState("");
  const [minMatch, setMinMatch] = useState(0);
  const [sort, setSort] = useState("match");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = jobs.filter(
      (job) =>
        // "Tất cả match" (0) giữ luôn cả tin chưa chấm; đặt ngưỡng từ 70 trở
        // lên là đang hỏi về điểm, mà tin chưa chấm thì không có điểm để đạt.
        (minMatch === 0 || (job.aiMatch ?? -1) >= minMatch) &&
        (normalized === "" ||
          `${job.title} ${job.company} ${job.tags.join(" ")}`.toLowerCase().includes(normalized)),
    );

    switch (sort) {
      case "newest":
        // So bằng mốc thật chứ không so nhãn: xếp "Hôm nay" với "3 ngày trước"
        // theo bảng chữ cái cho ra một thứ tự không có nghĩa gì.
        return [...result].sort(
          (a, b) => Date.parse(b.postedAt.at) - Date.parse(a.postedAt.at),
        );
      case "salary":
        // Tin không công bố lương bằng số xuống cuối, thay vì bị coi là lương 0
        // rồi trộn lẫn với những tin lương thật sự thấp.
        return [...result].sort(
          (a, b) => (b.salary?.max ?? -1) - (a.salary?.max ?? -1),
        );
      default:
        // Tin chưa chấm xuống cuối, cùng lý do với tin không công bố lương.
        return [...result].sort(
          (a, b) => (b.aiMatch ?? -1) - (a.aiMatch ?? -1),
        );
    }
  }, [jobs, query, minMatch, sort]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Tìm theo vị trí, công ty, kỹ năng…"
        />
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-slate-400" />
          <select
            value={minMatch}
            onChange={(e) => setMinMatch(Number(e.target.value))}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          >
            <option value={0}>Tất cả match</option>
            <option value={70}>≥ 70% match</option>
            <option value={80}>≥ 80% match</option>
            <option value={90}>≥ 90% match</option>
          </select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-44">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyHint className="rounded-2xl border-slate-200 bg-white p-12">
          Không tìm thấy việc làm phù hợp với bộ lọc hiện tại.
        </EmptyHint>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} onSavedChange={onSavedChange} />
          ))}
        </div>
      )}
    </div>
  );
}
