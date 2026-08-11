"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { JobMatchWithJob } from "@/types";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { jobsService, matchesService } from "@/services";
import { toJobCard } from "@/lib/adapters";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert } from "@/components/ui/alert";
import { Skeleton, SkeletonGrid, SkeletonPage } from "@/components/ui/skeleton";
import { JobList } from "./job-list";

/** Đủ rộng để bộ lọc phía client có ý nghĩa, đủ hẹp để không kéo cả bảng về. */
const PAGE_SIZE = 50;

export function JobsView() {
  const router = useRouter();
  const [matches, setMatches] = useState<JobMatchWithJob[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const page = await matchesService.list({ limit: PAGE_SIZE });
        if (cancelled) return;
        setMatches(page.items);
        setTotal(page.total);
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace("/login?next=/dashboard/jobs");
          return;
        }
        setError(apiErrorMessage(err, "Không tải được danh sách việc làm"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /**
   * JobCard đã tự đổi trạng thái nút ngay khi bấm, nên ở đây chỉ cần gọi API.
   *
   * Hỏng thì hoàn lại trạng thái trong dữ liệu để lần render sau khớp với sự
   * thật ở máy chủ — nếu không, người dùng thấy "Đã lưu" nhưng tải lại trang
   * thì mất, mà không hiểu vì sao.
   */
  const handleSavedChange = useCallback(
    (jobId: string, saved: boolean) => {
      setMatches((current) =>
        current
          ? current.map((match) =>
            match.jobId === jobId
              ? { ...match, job: { ...match.job, saved } }
              : match,
          )
          : current,
      );

      void (saved ? jobsService.save(jobId) : jobsService.unsave(jobId)).catch(
        () => {
          setMatches((current) =>
            current
              ? current.map((match) =>
                match.jobId === jobId
                  ? { ...match, job: { ...match.job, saved: !saved } }
                  : match,
              )
              : current,
          );
        },
      );
    },
    [],
  );

  if (error) return <Alert tone="danger">{error}</Alert>;

  if (!matches) {
    return (
      <SkeletonPage className="space-y-4">
        <Skeleton className="h-14 w-72" />
        <SkeletonGrid
          count={4}
          className="grid gap-4 lg:grid-cols-2"
          itemClassName="h-52"
        />
      </SkeletonPage>
    );
  }

  return (
    <div>
      <PageHeader
        title="Việc làm phù hợp"
        subtitle={
          total > 0
            ? `${total} việc làm đã được chấm điểm theo hồ sơ của bạn`
            : "Chưa có việc làm nào được chấm điểm"
        }
      />
      <JobList
        jobs={matches.map(toJobCard)}
        onSavedChange={handleSavedChange}
      />
    </div>
  );
}
