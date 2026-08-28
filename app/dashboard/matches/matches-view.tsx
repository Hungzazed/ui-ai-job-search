"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { matchesService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { toJobCard } from "@/lib/adapters";
import { JobCard } from "@/components/dashboard/job-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PageError } from "@/components/ui/alert";
import { EmptyHint } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SkeletonGrid } from "@/components/ui/skeleton";

const PAGE_SIZE = 12;

const GRID = "grid gap-4 md:grid-cols-2 xl:grid-cols-3";

export function MatchesView() {
  const [offset, setOffset] = useState(0);

  const page = useApiQuery(
    keys.matchPage(PAGE_SIZE, offset),
    () => matchesService.list({ limit: PAGE_SIZE, offset }),
    {
      errorMessage: "Không tải được danh sách tin đã chấm",
      keepPrevious: true,
    },
  );

  if (page.error)
    return <PageError title="Không tải được dữ liệu" message={page.error} />;

  const matches = page.data?.items ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đã chấm bằng AI"
        subtitle="Những tin bạn đã bấm chấm điểm, xếp theo điểm phù hợp giảm dần"
      />

      {!matches ? (
        <SkeletonGrid count={PAGE_SIZE} className={GRID} itemClassName="h-56" />
      ) : matches.length === 0 ? (
        <div className="space-y-3">
          <EmptyHint>
            Bạn chưa chấm điểm tin nào. Điểm AI chỉ chạy khi bạn bấm ở trang chi
            tiết một tin.
          </EmptyHint>
          <Link
            href="/dashboard/jobs?scored=1"
            className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
          >
            Xem việc làm phù hợp <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className={GRID}>
            {matches.map((match) => (
              <JobCard key={match.jobId} job={toJobCard(match)} />
            ))}
          </div>

          <Pagination
            offset={page.data?.offset ?? offset}
            limit={PAGE_SIZE}
            total={page.data?.total ?? 0}
            onOffsetChange={setOffset}
            noun="tin đã chấm"
            disabled={page.loading}
          />
        </>
      )}
    </div>
  );
}
