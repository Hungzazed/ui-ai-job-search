"use client";

import Link from "next/link";
import { Bookmark, ExternalLink, MapPin, RotateCw, Sparkles } from "lucide-react";
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

export type ScoreRequest = "queued" | "failed";

/**
 * Ô thao tác chấm điểm, vẽ theo trạng thái match có sẵn trong database.
 *
 * Trước đây ô này chỉ biết lần bấm trong phiên hiện tại, nên một tin đã có
 * điểm từ hôm trước vẫn hiện nút mời chấm lại từ đầu.
 */
function ScoreCell({
  job,
  scoring,
  onScore,
}: {
  job: JobRecord;
  scoring: boolean;
  onScore: (jobId: string, title: string) => void;
}) {
  const status = job.match?.status;

  if (status === "DONE") {
    return (
      <Link href={`/dashboard/jobs/${job.id}`} aria-label="Xem kết quả chấm điểm">
        <Badge variant="success" className="font-mono whitespace-nowrap">
          {job.match?.overallScore ?? "—"} điểm
        </Badge>
      </Link>
    );
  }

  if (status === "PENDING" || status === "RUNNING") {
    return (
      <Badge variant="info" dot className="whitespace-nowrap">
        Đang chấm…
      </Badge>
    );
  }

  const retry = status === "FAILED";
  const { matched, total } = job.keywordMatch;

  return (
    <div className="flex items-center gap-2">
      {total > 0 && (
        <span
          className="hidden font-mono text-[11px] whitespace-nowrap text-slate-500 @4xl:inline"
          title={`${matched} trong ${total} kỹ năng của bạn được nhắc trong tin này`}
        >
          khớp {matched}/{total}
        </span>
      )}
      <Button
      size="sm"
      variant="outline"
      loading={scoring}
      onClick={() => onScore(job.id, job.title)}
      title={
        retry
          ? "Lần chấm trước thất bại — bấm để chấm lại"
          : "Chấm điểm độ phù hợp với hồ sơ của bạn"
      }
      aria-label={retry ? "Chấm lại" : "Chấm điểm"}
    >
      {!scoring && (retry ? <RotateCw className="size-3.5" /> : <Sparkles className="size-3.5" />)}
      {/*
        Chữ ẩn đi trên khung hẹp, chỉ còn icon. Cột này `whitespace-nowrap` nên
        nó giữ nguyên 225px kể cả khi khung chỉ có 356px — đã đo, chữ vụn thành
        mỗi dòng một từ. `aria-label` giữ tên nút cho trình đọc màn hình.
      */}
        <span className="hidden @2xl:inline">
          {retry ? "Chấm lại" : "Chấm điểm"}
        </span>
      </Button>
    </div>
  );
}

interface AllJobsTableProps {
  jobs: JobRecord[];
  /** jobId -> kết quả lần bấm chấm điểm gần nhất. */
  scoreRequests: Map<string, ScoreRequest>;
  /** jobId đang chờ backend trả biên nhận. */
  scoring: string | null;
  onScore: (jobId: string, title: string) => void;
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
          <TableHead className="hidden @2xl:table-cell">Mức lương</TableHead>
          <TableHead className="hidden @4xl:table-cell">Địa điểm</TableHead>
          <TableHead className="hidden @6xl:table-cell">Nguồn</TableHead>
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
  onScore: (jobId: string, title: string) => void;
  onToggleSave: (jobId: string, saved: boolean) => void;
}) {
  const salary = formatJobSalary({
    salary: toSalaryRange(job),
    salaryRaw: job.salaryRaw,
  });

  return (
    <TableRow>
      <TableCell className="w-full max-w-0">
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
            <p className="mt-1 flex flex-wrap items-center gap-x-2.5 text-xs text-slate-500 @2xl:hidden">
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

      <TableCell className="hidden font-mono text-xs whitespace-nowrap text-slate-700 @2xl:table-cell">
        {salary}
      </TableCell>

      <TableCell className="hidden text-slate-500 @4xl:table-cell">
        <LocationText location={job.location} />
      </TableCell>

      <TableCell className="hidden @6xl:table-cell">
        <Badge variant="outline" className="font-mono text-[11px]">
          {job.source}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-1.5">
          <ScoreCell job={job} scoring={scoring} onScore={onScore} />

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
