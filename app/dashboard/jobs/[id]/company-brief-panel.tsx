"use client";

import { BriefBody, Signals } from "./company-brief-body";
import { useState } from "react";
import { Building2, RefreshCw } from "lucide-react";
import { companiesService } from "@/services";

import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { isBriefPending } from "@/lib/company-brief";
import { apiErrorMessage } from "@/lib/axios";
import { Alert } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";

/** Một lượt tìm hiểu đi qua ba câu tìm kiếm, năm trang và một lời gọi model. */
const POLL_MS = 5_000;

interface CompanyBriefPanelProps {
  jobId: string;
}

/**
 * Thẻ "Về công ty này" trên trang chi tiết tin.
 *
 * Query RIÊNG chứ không gộp vào `useApiQuery` chung của trang: bản tìm hiểu
 * hỏng thì thẻ này biến mất, phần mô tả công việc vẫn hiện bình thường.
 */
export function CompanyBriefPanel({ jobId }: CompanyBriefPanelProps) {
  /**
   * Mốc `updatedAt` tại lúc bấm tra, hoặc `undefined` khi không chờ gì.
   *
   * Suy ra trạng thái chờ thay vì giữ một cờ boolean rồi tắt nó đi: tắt cờ là
   * gọi `setState` giữa lúc render. Mốc này còn phân biệt được "làm mới" với
   * "tra lần đầu" - bản cũ vẫn hiện trong lúc bản mới đang chạy.
   */
  const [pendingSince, setPendingSince] = useState<string | null | undefined>(
    undefined,
  );
  const [requestError, setRequestError] = useState<string | null>(null);

  const { data, error, reload } = useApiQuery(
    keys.companyBrief(jobId),
    () => companiesService.briefForJob(jobId),
    {
      errorMessage: "Không tải được thông tin công ty",
      refetchInterval: pendingSince !== undefined ? POLL_MS : false,
    },
  );

  if (error || !data || !data.researchable) return null;

  const brief = data.brief;
  const waiting = isBriefPending(pendingSince, brief?.updatedAt ?? null);

  async function research(force: boolean) {
    setRequestError(null);
    setPendingSince(brief?.updatedAt ?? null);
    try {
      await companiesService.refreshForJob(jobId, force);
      reload();
    } catch (err: unknown) {
      setPendingSince(undefined);
      setRequestError(apiErrorMessage(err, "Không xếp được lượt tìm hiểu"));
    }
  }

  return (
    <SectionCard
      title="Về công ty này"
      description={data.company}
      icon={Building2}
      compact
      actions={brief ? <Signals brief={brief} /> : null}
    >
      {requestError && <Alert tone="danger">{requestError}</Alert>}

      {!brief && waiting && <Skeleton className="h-24 w-full" />}

      {!brief && !waiting && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Chưa có thông tin đánh giá. Hệ thống sẽ tra các trang đánh giá công
            khai và tóm tắt lại — mất khoảng một phút.
          </p>
          <Button size="sm" onClick={() => void research(false)}>
            Tìm hiểu công ty này
          </Button>
        </div>
      )}

      {brief && <BriefBody brief={brief} stale={data.stale} />}

      {brief && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500">
            {data.stale ? "Thông tin đã cũ" : "Cập nhật"}{" "}
            {new Date(brief.updatedAt).toLocaleDateString("vi-VN")}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={waiting}
            onClick={() => void research(true)}
          >
            <RefreshCw className="size-3.5" />
            {waiting ? "Đang tra..." : "Làm mới"}
          </Button>
        </div>
      )}
    </SectionCard>
  );
}

