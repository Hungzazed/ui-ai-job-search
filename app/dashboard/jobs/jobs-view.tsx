"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { JobListItem, JobSort } from "@/services";
import { jobsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { toJobCardFromRecord } from "@/lib/adapters";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  JobFilterBar,
  type JobFilterValue,
} from "@/components/dashboard/job-filter-bar";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton, SkeletonGrid, SkeletonPage } from "@/components/ui/skeleton";
import { JobList } from "./job-list";

/** Số tin mỗi trang. */
const PAGE_SIZE = 20;

/**
 * Chờ bao lâu sau phím cuối rồi mới gọi API.
 *
 * Không có nó thì gõ "backend" là bảy request, và sáu cái đầu đều vô ích. Đủ
 * ngắn để cảm giác vẫn tức thì.
 */
const SEARCH_DEBOUNCE_MS = 500;

const SORTS: JobSort[] = ["newest", "salary", "match"];

/**
 * Thứ tự mặc định khác nhau giữa hai lối vào.
 *
 * "Việc làm phù hợp" mà sắp theo thời gian quét thì một tin vừa đủ điểm vẫn
 * đứng trên một tin rất hợp chỉ vì nó mới hơn — trong khi cả trang tồn tại là
 * để trả lời câu "tin nào hợp với tôi nhất".
 */
const defaultSort = (scored: boolean): JobSort =>
  scored ? "match" : "newest";

/**
 * Đọc bộ lọc TỪ URL.
 *
 * URL là nguồn sự thật duy nhất, không phải `useState`. Nhờ vậy một bộ lọc là
 * một đường link chia sẻ được, nút Back đưa về đúng kết quả trước đó, và tải
 * lại trang không mất gì - đúng cách mọi trang tuyển dụng hoạt động.
 */
function readFilter(params: URLSearchParams, scored: boolean): JobFilterValue {
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    province: params.getAll("province"),
    occupation: params.getAll("occupation"),
    salaryMin: Number(params.get("salaryMin") ?? 0) || 0,
    postedWithin: Number(params.get("postedWithin") ?? 0) || 0,
    sort: SORTS.includes(sort as JobSort)
      ? (sort as JobSort)
      : defaultSort(scored),
  };
}

/** Chỉ ghi những gì khác mặc định, để URL sạch và dễ đọc. */
function writeFilter(
  filter: JobFilterValue,
  offset: number,
  scored: boolean,
): string {
  const params = new URLSearchParams();
  if (scored) params.set("scored", "1");
  if (filter.q) params.set("q", filter.q);
  for (const code of filter.province) params.append("province", code);
  for (const code of filter.occupation) params.append("occupation", code);
  if (filter.salaryMin) params.set("salaryMin", String(filter.salaryMin));
  if (filter.postedWithin)
    params.set("postedWithin", String(filter.postedWithin));
  if (filter.sort !== defaultSort(scored)) params.set("sort", filter.sort);
  if (offset) params.set("offset", String(offset));
  return params.toString();
}

export function JobsView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useSearchParams();

  /** `?scored=1` = lối vào "Việc làm phù hợp": tin đã chấm và KHÔNG bị chấm POOR. */
  const scored = params.get("scored") === "1";
  const filter = useMemo(
    () => readFilter(new URLSearchParams(params.toString()), scored),
    [params, scored],
  );
  const offset = Number(params.get("offset") ?? 0) || 0;

  /**
   * Ô tìm kiếm giữ state RIÊNG, tách khỏi URL.
   *
   * Đây là ngoại lệ duy nhất của quy tắc "URL là nguồn sự thật", và nó bắt
   * buộc: đẩy từng phím lên URL sẽ đẻ ra một mục lịch sử cho mỗi ký tự, khiến
   * nút Back phải bấm bảy lần mới thoát khỏi một từ khoá.
   */
  const [draftQuery, setDraftQuery] = useState(filter.q);

  // Điều chỉnh state NGAY TRONG render thay vì trong một effect: nút Back đổi
  // URL từ bên ngoài React, và đồng bộ bằng effect sẽ vẽ một lượt với ô tìm
  // kiếm còn giữ từ khoá của trang trước.
  const [syncedQuery, setSyncedQuery] = useState(filter.q);
  if (syncedQuery !== filter.q) {
    setSyncedQuery(filter.q);
    setDraftQuery(filter.q);
  }

  const push = useCallback(
    (next: JobFilterValue, nextOffset: number) => {
      router.push(`/dashboard/jobs?${writeFilter(next, nextOffset, scored)}`, {
        scroll: false,
      });
    },
    [router, scored],
  );

  // Đổi bộ lọc thì về trang đầu: giữ offset cũ rất dễ ra một trang trống.
  const handleFilterChange = useCallback(
    (next: JobFilterValue) => {
      setDraftQuery(next.q);
      push(next, 0);
    },
    [push],
  );

  useEffect(() => {
    if (draftQuery === filter.q) return;
    const timer = setTimeout(
      () => push({ ...filter, q: draftQuery }, 0),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [draftQuery, filter, push]);

  const filters = useApiQuery(["jobs", "filters"], jobsService.filters, {
    errorMessage: "Không tải được danh mục bộ lọc",
  });

  const page = useApiQuery(
    ["jobs", "list", { ...filter, offset, scored }],
    () =>
      jobsService.list({
        limit: PAGE_SIZE,
        offset,
        ...(filter.q ? { q: filter.q } : {}),
        ...(filter.province.length ? { province: filter.province } : {}),
        ...(filter.occupation.length ? { occupation: filter.occupation } : {}),
        ...(filter.salaryMin ? { salaryMin: filter.salaryMin } : {}),
        ...(filter.postedWithin ? { postedWithin: filter.postedWithin } : {}),
        sort: filter.sort,
        ...(scored ? { scored: true } : {}),
      }),
    {
      errorMessage: "Không tải được danh sách việc làm",
      keepPrevious: true,
    },
  );

  if (page.errorStatus === 401) router.replace("/login?next=/dashboard/jobs");

  /**
   * Đổi trạng thái lưu ngay trong cache của TanStack Query.
   *
   * Hỏng thì hoàn lại, để lần render sau khớp với sự thật ở máy chủ - nếu
   * không, người dùng thấy "Đã lưu" nhưng tải lại trang thì mất, mà không hiểu
   * vì sao.
   */
  const handleSavedChange = useCallback(
    (jobId: string, saved: boolean) => {
      const apply = (value: boolean) =>
        queryClient.setQueriesData<{ items: JobListItem[] }>(
          { queryKey: ["jobs", "list"] },
          (current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((job) =>
                    job.id === jobId ? { ...job, saved: value } : job,
                  ),
                }
              : current,
        );

      apply(saved);
      void (saved ? jobsService.save(jobId) : jobsService.unsave(jobId)).catch(
        () => apply(!saved),
      );
    },
    [queryClient],
  );

  if (page.error) return <Alert tone="danger">{page.error}</Alert>;

  if (!page.data) {
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
        title={scored ? "Việc làm phù hợp" : "Tất cả việc làm"}
        subtitle={
          scored
            ? `${page.data.total} việc làm AI đánh giá là đáng cân nhắc`
            : `${page.data.total} tin khớp với bộ lọc hiện tại`
        }
      />

      <JobFilterBar
        value={{ ...filter, q: draftQuery }}
        filters={filters.data}
        onChange={handleFilterChange}
      />

      {/* Mờ đi trong lúc tải trang kế, thay vì thay bằng khung xám: người dùng
          vẫn đọc được kết quả cũ và không mất chỗ đang nhìn. */}
      <div className={page.loading ? "opacity-50 transition-opacity" : undefined}>
        <JobList
          jobs={page.data.items.map(toJobCardFromRecord)}
          onSavedChange={handleSavedChange}
        />
      </div>

      <Pagination
        offset={offset}
        limit={PAGE_SIZE}
        total={page.data.total}
        noun="tin"
        disabled={page.loading}
        onOffsetChange={(next) => push(filter, next)}
      />
    </div>
  );
}
