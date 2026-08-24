"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, MapPin, Sparkles } from "lucide-react";
import { LocationText } from "@/components/dashboard/location-text";
import type { Job } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { JobTime } from "@/components/dashboard/job-time";
import { cn, formatJobSalary, matchToneClasses } from "@/utils";

interface JobCardProps {
  job: Job;
  onSavedChange?: (jobId: string, saved: boolean) => void;
}

/**
 * Tin chưa chấm KHÔNG mang huy hiệu màu.
 *
 * Màu ở đây là kết luận đánh giá; tô xanh hay đỏ cho một tin hệ thống chưa hề
 * đọc là nói thay nó một điều nó chưa nói.
 */
export function MatchBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <Badge variant="neutral" className="shrink-0 text-[11px]">
        Chưa chấm điểm
      </Badge>
    );
  }

  const tone = matchToneClasses(score);
  return (
    <Badge
      className={cn(
        "shrink-0 font-mono text-[11px] font-bold",
        tone.bg,
        tone.text,
      )}
    >
      <Sparkles className="size-3 mr-0.5" />
      {score}% Match
    </Badge>
  );
}

export function JobCard({ job, onSavedChange }: JobCardProps) {
  /**
   * Ý muốn của người dùng khi vừa bấm, chưa có xác nhận từ máy chủ. `null` =
   * chưa bấm gì, tin cái máy chủ nói.
   *
   * KHÔNG chép `job.saved` vào state bằng `useState(job.saved)`. Chép một lần
   * lúc mount thì thẻ đóng băng ở giá trị đầu tiên: sau đó dữ liệu mới về bao
   * nhiêu lần cũng không đẩy được nút đi. Đã trả giá đúng như vậy - lưu một tin
   * ở trang chi tiết rồi quay lại danh sách, máy chủ trả `saved: true`, danh
   * sách đã nạp lại, mà ngôi sao vẫn tắt. Người dùng đọc ra thành "bấm hụt".
   */
  const [pending, setPending] = useState<boolean | null>(null);
  const saved = pending ?? job.saved;

  const toggleSave = () => {
    const next = !saved;
    setPending(next);
    onSavedChange?.(job.id, next);
  };

  // Máy chủ đã trả lời đúng thứ người dùng vừa bấm thì bỏ ý muốn đi, để những
  // lần đổi sau từ nơi khác vẫn tới được thẻ này.
  if (pending !== null && pending === job.saved) setPending(null);

  /*
   * `h-full flex flex-col` ở Card, `flex-1` xuống tới cột nội dung, `mt-auto` ở
   * hàng nút — cả chuỗi này chỉ để hàng nút của các thẻ CẠNH NHAU nằm cùng một
   * độ cao.
   *
   * Lưới kéo mọi thẻ cao bằng nhau, nhưng nội dung thì không đều: tên công ty dài
   * ngắn khác nhau, tiêu đề một hoặc hai dòng, thẻ tag có thể không có. Không đẩy
   * hàng nút xuống đáy thì ba nút "Tối ưu & Ứng tuyển" cạnh nhau lệch nhau vài
   * chục pixel. Lỗi này vốn đã có ở cỡ 2xl từ trước, chỉ chưa ai xem tới.
   */
  return (
    <Card className="group flex h-full flex-col transition-all duration-150 hover:border-slate-300 hover:shadow-xs">
      <CardContent className="flex flex-1 flex-col p-4.5">
        <div className="flex flex-1 gap-3.5">
          <CompanyLogo
            initials={job.companyInitials}
            color={job.companyColor}
            src={job.companyLogo}
            size="lg"
            className="self-start"
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">{job.company}</p>
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="mt-0.5 line-clamp-2 text-sm font-semibold tracking-tight text-slate-900 transition-colors hover:text-primary-600"
                >
                  {job.title}
                </Link>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {job.systemMatch && job.systemMatch.total > 0 && (
                  <span
                    className="rounded-full bg-teal-50 px-2 py-0.5 font-mono text-[11px] font-semibold whitespace-nowrap text-teal-700"
                    title={
                      job.systemMatch.kind === "REQUIREMENTS"
                        ? `Hồ sơ đáp ứng ${job.systemMatch.met}/${job.systemMatch.total} yêu cầu tin nêu ra (${job.systemMatch.percent}% có trọng số)`
                        : `Tin chưa được rút trích yêu cầu; đang đếm kỹ năng của bạn xuất hiện trong tin`
                    }
                  >
                    khớp {job.systemMatch.met}/{job.systemMatch.total}
                    {job.systemMatch.kind === "REQUIREMENTS" && (
                      <span className="ml-1 text-teal-600">
                        · {job.systemMatch.percent}%
                      </span>
                    )}
                  </span>
                )}
                {job.hasAiScore && (
                  <span className="text-[10px] whitespace-nowrap text-slate-400">
                    đã có đánh giá AI
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-500">
              <span className="font-mono font-semibold text-slate-800">{formatJobSalary(job)}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 text-slate-400" />
                <LocationText location={job.location} />
              </span>
              <JobTime time={job.postedAt} />
            </div>

            <div className="mt-3 mb-4 flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[11px] text-slate-600 border-slate-200">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-slate-100/90 pt-3">
              <Button size="sm" variant="outline" onClick={toggleSave} aria-label="Lưu việc làm">
                <Bookmark className={cn("size-3.5", saved && "fill-primary-600 text-primary-600")} />
                {saved ? "Đã lưu" : "Lưu"}
              </Button>
              <Link href={`/dashboard/jobs/${job.id}`}>
                <Button size="sm" variant="primary">Tối ưu & Ứng tuyển</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
