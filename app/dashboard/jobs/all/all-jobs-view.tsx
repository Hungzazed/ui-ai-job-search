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

/**
 * Nhịp hỏi lại khi còn tin đang chấm. Chỉ chạy lúc thật sự có việc chờ.
 *
 * p50 của một lượt chấm đo được là 33 giây, nên 10 giây thường chỉ tốn 3–4
 * lượt hỏi cho mỗi tin — đủ nhanh để thấy kết quả, đủ thưa để không nện DB.
 */
const POLL_INTERVAL_MS = 10_000;

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

  /** Tin vừa bấm chấm điểm. `score` khác null nghĩa là nó đã có điểm từ trước. */
  const [notice, setNotice] = useState<{
    jobId: string;
    title: string;
    score: number | null;
  } | null>(null);

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

  const { error, loading, reload } = page;
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
   * Backend phân biệt hai trường hợp, và giao diện phải phân biệt theo: tin đã
   * có điểm thì không xếp hàng gì cả, báo "đã xếp hàng" lúc đó là hứa một cập
   * nhật không bao giờ tới.
   */
  const handleScore = useCallback(
    (jobId: string, title: string) => {
      setScoring(jobId);
      void (async () => {
        try {
          const result = await matchesService.evaluate(jobId);
          if (result.alreadyScored) {
            setNotice({ jobId, title, score: result.overallScore });
            return;
          }
          setNotice({ jobId, title, score: null });
          // Backend đã ghi PENDING, nên tải lại là thấy ngay "Đang chấm…".
          reload();
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
    [router, reload],
  );

  /**
   * Hỏi lại CHỈ khi còn tin đang chấm, và tự dừng khi hết.
   *
   * Không có nó thì dòng "Đang chấm…" đứng im vĩnh viễn cho tới khi người dùng
   * tự F5 — cùng loại bế tắc với việc nút chấm điểm không biết mình đã chấm.
   */
  const waiting = (jobs ?? []).some(
    (job) => job.match?.status === "PENDING" || job.match?.status === "RUNNING",
  );

  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(reload, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [waiting, reload]);

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

      {notice && (
        <Alert
          tone="info"
          title={
            notice.score === null
              ? `Đã xếp hàng chấm điểm “${notice.title}”`
              : `“${notice.title}” đã có điểm từ trước: ${notice.score}`
          }
        >
          {notice.score === null
            ? "Việc chấm chạy ở nền, mất khoảng 30–90 giây và có thể thất bại. Dòng này sẽ tự cập nhật khi xong. "
            : "Không xếp hàng lại vì kết quả đã được lưu. Muốn chấm lại thì vào trang chi tiết. "}
          <Link
            href={`/dashboard/jobs/${notice.jobId}`}
            className="font-semibold underline"
          >
            Xem chi tiết tin này
          </Link>
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
