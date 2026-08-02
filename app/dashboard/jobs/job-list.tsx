"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Job } from "@/types";
import { JobCard } from "@/components/dashboard/job-card";
import { Select } from "@/components/ui/form";

const sortOptions = [
  { value: "match", label: "Điểm AI Match" },
  { value: "newest", label: "Mới nhất" },
  { value: "salary", label: "Lương cao nhất" },
];

interface JobListProps {
  jobs: Job[];
}

export function JobList({ jobs }: JobListProps) {
  const [query, setQuery] = useState("");
  const [minMatch, setMinMatch] = useState(0);
  const [sort, setSort] = useState("match");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = jobs.filter(
      (job) =>
        job.aiMatch >= minMatch &&
        (normalized === "" ||
          `${job.title} ${job.company} ${job.tags.join(" ")}`.toLowerCase().includes(normalized)),
    );

    switch (sort) {
      case "newest":
        return [...result].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
      case "salary":
        return [...result].sort((a, b) => b.salary.max - a.salary.max);
      default:
        return [...result].sort((a, b) => b.aiMatch - a.aiMatch);
    }
  }, [jobs, query, minMatch, sort]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo vị trí, công ty, kỹ năng…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm shadow-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
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
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
          Không tìm thấy việc làm phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
