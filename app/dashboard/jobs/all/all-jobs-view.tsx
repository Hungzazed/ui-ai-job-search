"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Search } from "lucide-react";
import { apiErrorStatus } from "@/lib/axios";
import { useAsyncData } from "@/hooks/use-async-data";
import { jobsService, matchesService } from "@/services";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { formatCount } from "@/utils";
import { AllJobsTable, type ScoreRequest } from "./all-jobs-table";

const LOGIN_NEXT = "/login?next=/dashboard/jobs/all";

/** Đủ để quét bằng mắt trong một màn hình, đủ nhỏ để lật trang không chờ lâu. */
const PAGE_SIZE = 20;

/**
 * Chờ ngừng gõ rồi mới hỏi backend.
 *
 * Tìm kiếm chạy ở phía máy chủ (`?q=` khớp tiêu đề và tên công ty), nên gõ
 * "frontend" mà không chặn lại là mười một lượt truy vấn cho một ý định.
 */
const SEARCH_DEBOUNCE_MS = 350;

export function AllJobsView() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  /** Từ khoá đã chốt sau khi ngừng gõ — đây mới là thứ đi vào request. */
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  /**
   * Sửa tại chỗ những gì người dùng vừa đổi (bấm Lưu), trên nền dữ liệu đã tải.
   *
   * Không copy cả danh sách vào state riêng: làm vậy là dựng bản thứ hai của cùng
   * một danh sách, và bản đó sẽ đứng im khi lật trang. Ở đây chỉ giữ **những ô đã
   * đổi**, khoá theo id, rồi đắp lên lúc render.
   */
  const [savedOverrides, setSavedOverrides] = useState<Map<string, boolean>>(
    new Map(),
  );

  const [scoring, setScoring] = useState<string | null>(null);
  const [scoreRequests, setScoreRequests] = useState<
    Map<string, ScoreRequest>
  >(new Map());

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      // Đổi từ khoá thì phải về trang đầu: giữ nguyên offset sẽ nhảy thẳng vào
      // trang 3 của một kết quả tìm kiếm chỉ có 2 trang, và màn hình trống.
      setOffset(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Định danh của request là chính hàm này: `useCallback` đổi khi `search` hay
  // `offset` đổi, và `useAsyncData` tải lại đúng lúc đó.
  const load = useCallback(
    () =>
      jobsService.list({
        limit: PAGE_SIZE,
        offset,
        q: search || undefined,
      }),
    [search, offset],
  );

  const page = useAsyncData(load, {
    loginNext: LOGIN_NEXT,
    errorMessage: "Không tải được danh sách việc làm",
  });

  const { error, loading } = page;
  const total = page.data?.total ?? 0;
  const jobs = useMemo(() => {
    if (!page.data) return null;
    if (savedOverrides.size === 0) return page.data.items;
    return page.data.items.map((job) =>
      savedOverrides.has(job.id)
        ? { ...job, saved: savedOverrides.get(job.id)! }
        : job,
    );
  }, [page.data, savedOverrides]);

  /**
   * Đổi trạng thái nút trước rồi mới gọi API, và hoàn lại nếu hỏng — cùng kỷ
   * luật với nút Lưu ở trang chi tiết và trang việc phù hợp.
   */
  const handleToggleSave = useCallback((jobId: string, saved: boolean) => {
    const apply = (value: boolean) =>
      setSavedOverrides((current) => new Map(current).set(jobId, value));

    apply(saved);
    void (saved ? jobsService.save(jobId) : jobsService.unsave(jobId)).catch(
      () => apply(!saved),
    );
  }, []);

  /**
   * `POST /matches/evaluate` là ĐƯỜNG GHI: nó trả biên nhận chứ không trả điểm.
   *
   * Nên ở đây chỉ báo "đã xếp hàng" và nói rõ chỗ xem kết quả — hứa rằng điểm
   * đã có ngay là hứa sai, worker còn mất 30–90 giây nữa.
   */
  const handleScore = useCallback(
    (jobId: string) => {
      setScoring(jobId);
      void (async () => {
        try {
          await matchesService.evaluate(jobId);
          setScoreRequests((current) =>
            new Map(current).set(jobId, "queued"),
          );
        } catch (err) {
          if (apiErrorStatus(err) === 401) {
            router.replace(LOGIN_NEXT);
            return;
          }
          setScoreRequests((current) => new Map(current).set(jobId, "failed"));
        } finally {
          setScoring(null);
        }
      })();
    },
    [router],
  );

  const queued = [...scoreRequests.values()].filter(
    (value) => value === "queued",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tất cả việc làm"
        subtitle="Toàn bộ tin đã thu thập được, kể cả tin chưa qua khâu chấm điểm"
        actions={
          <Link href="/dashboard/jobs">
            <Button variant="outline">
              <Briefcase className="size-4" />
              Chỉ xem việc phù hợp
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Tìm theo vị trí hoặc tên công ty…"
        />
        {jobs !== null && (
          <p className="text-xs text-slate-500">
            {search
              ? `${formatCount(total)} tin khớp “${search}”`
              : `${formatCount(total)} tin trong kho`}
          </p>
        )}
      </div>

      {queued > 0 && (
        <Alert tone="info" title={`Đã xếp hàng chấm điểm ${queued} tin`}>
          Việc chấm chạy ở nền, mất khoảng 30–90 giây mỗi tin và có thể thất
          bại. Điểm phù hợp sẽ xuất hiện ở{" "}
          <Link href="/dashboard/jobs" className="font-semibold underline">
            Việc làm phù hợp
          </Link>{" "}
          khi worker chạy xong.
        </Alert>
      )}

      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : jobs === null ? (
        <AllJobsSkeleton />
      ) : jobs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Search}
            title={
              search
                ? "Không có tin nào khớp từ khoá này"
                : "Kho tin đang trống"
            }
            description={
              search
                ? "Tìm kiếm chỉ khớp tiêu đề và tên công ty. Thử một từ khoá ngắn hơn."
                : "Chưa có tin tuyển dụng nào được thu thập về. Hãy chạy quét tin trước."
            }
          />
        </Card>
      ) : (
        // Mờ đi trong lúc tải trang kế thay vì thay bằng khung xám: hàng cũ vẫn
        // đọc được, và bảng không nhảy chiều cao mỗi lần lật trang.
        // `@container` để `AllJobsTable` quyết định cột theo chỗ thật nó có, chứ
        // không theo bề ngang cửa sổ — sidebar ăn 256px và bảng từng tràn ra
        // ngoài màn hình vì chênh lệch đó.
        <Card
          className={
            loading
              ? "@container overflow-hidden opacity-60"
              : "@container overflow-hidden"
          }
        >
          <AllJobsTable
            jobs={jobs}
            scoreRequests={scoreRequests}
            scoring={scoring}
            onScore={handleScore}
            onToggleSave={handleToggleSave}
          />
          <Pagination
            offset={offset}
            limit={PAGE_SIZE}
            total={total}
            onOffsetChange={setOffset}
            disabled={loading}
          />
        </Card>
      )}
    </div>
  );
}

/** Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong. */
function AllJobsSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-96" />
    </SkeletonPage>
  );
}
