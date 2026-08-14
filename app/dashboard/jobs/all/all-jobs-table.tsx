"use client";

import Link from "next/link";
import { Bookmark, ExternalLink, MapPin, Sparkles } from "lucide-react";
import type { JobRecord } from "@/services";
import { toJobTimestamp, toSalaryRange } from "@/lib/adapters";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { JobTime } from "@/components/dashboard/job-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, companyColor, companyInitials, formatJobSalary } from "@/utils";
import { LocationText } from "@/components/dashboard/location-text";

/** Kết quả của một lần bấm "Chấm điểm" trên một dòng. */
export type ScoreRequest = "queued" | "failed";

interface AllJobsTableProps {
  jobs: JobRecord[];
  /** jobId -> kết quả lần bấm chấm điểm gần nhất. */
  scoreRequests: Map<string, ScoreRequest>;
  /** jobId đang chờ backend trả biên nhận. */
  scoring: string | null;
  onScore: (jobId: string) => void;
  onToggleSave: (jobId: string, saved: boolean) => void;
}

export function AllJobsTable({
  jobs,
  scoreRequests,
  scoring,
  onScore,
  onToggleSave,
}: AllJobsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Vị trí / Công ty</TableHead>
          <TableHead className="hidden md:table-cell">Mức lương</TableHead>
          <TableHead className="hidden lg:table-cell">Địa điểm</TableHead>
          <TableHead className="hidden xl:table-cell">Nguồn</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <JobRow
            key={job.id}
            job={job}
            request={scoreRequests.get(job.id)}
            scoring={scoring === job.id}
            onScore={onScore}
            onToggleSave={onToggleSave}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function JobRow({
  job,
  request,
  scoring,
  onScore,
  onToggleSave,
}: {
  job: JobRecord;
  request: ScoreRequest | undefined;
  scoring: boolean;
  onScore: (jobId: string) => void;
  onToggleSave: (jobId: string, saved: boolean) => void;
}) {
  const salary = formatJobSalary({
    salary: toSalaryRange(job),
    salaryRaw: job.salaryRaw,
  });

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-start gap-3">
          <CompanyLogo
            initials={companyInitials(job.company)}
            color={companyColor(job.company)}
            src={job.companyLogo}
            size="sm"
          />
          <div className="min-w-0">
            <Link
              href={`/dashboard/jobs/${job.id}`}
              className="hover:text-primary-600 block truncate font-medium text-slate-900"
            >
              {job.title}
            </Link>
            <p className="text-xs text-slate-400">{job.company}</p>
            {/* Lương và địa điểm bị ẩn ở cột riêng khi màn hình hẹp, nên gấp
                lại vào đây thay vì biến mất hẳn. */}
            <p className="mt-1 flex flex-wrap items-center gap-x-2.5 text-xs text-slate-500 md:hidden">
              <span className="font-mono">{salary}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                <LocationText location={job.location} />
              </span>
            </p>
            <JobTime
              time={toJobTimestamp(job)}
              className="mt-1 flex text-[11px] text-slate-400"
            />
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden font-mono text-xs whitespace-nowrap text-slate-700 md:table-cell">
        {salary}
      </TableCell>

      <TableCell className="hidden text-slate-500 lg:table-cell">
        <LocationText location={job.location} />
      </TableCell>

      <TableCell className="hidden xl:table-cell">
        <Badge variant="outline" className="font-mono text-[11px]">
          {job.source}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-1.5">
          {request === "queued" ? (
            <Badge variant="info" dot className="whitespace-nowrap">
              Đã xếp hàng
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              loading={scoring}
              onClick={() => onScore(job.id)}
              title="Chấm điểm độ phù hợp với hồ sơ của bạn"
            >
              {!scoring && <Sparkles className="size-3.5" />}
              Chấm điểm
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            aria-label={job.saved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
            onClick={() => onToggleSave(job.id, !job.saved)}
          >
            <Bookmark
              className={cn(
                "size-3.5",
                job.saved && "fill-primary-600 text-primary-600",
              )}
            />
          </Button>

          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            title="Mở tin gốc"
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        {request === "failed" && (
          <p className="mt-1 text-right text-[11px] text-rose-600">
            Không gửi được yêu cầu
          </p>
        )}
      </TableCell>
    </TableRow>
  );
}
