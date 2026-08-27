"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowCounterClockwise } from "@phosphor-icons/react/ssr";
import { agentService, type AgentRunInput } from "@/services";
import { useAgentRun } from "@/hooks/use-agent-run";
import { useApiQuery } from "@/hooks/use-api-query";
import { invalidateAfter, keys } from "@/lib/query-keys";
import { apiErrorMessage } from "@/lib/axios";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, PageError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { AgentHistory } from "./agent-history";
import { AgentQuestionCard } from "./agent-question-card";
import { AgentResultCard } from "./agent-result-card";
import { AgentStartCard } from "./agent-start-card";
import { AgentTimeline } from "./agent-timeline";

const LOGIN_NEXT = "/dashboard/apply";
const PAGE_SIZE = 10;

/**
 * Màn điều khiển agent: bắt đầu một lượt, xem nó chạy, trả lời khi nó hỏi.
 *
 * Chỉ giữ đúng hai thứ trong state: lượt chạy đang xem là cái nào, và một lỗi
 * gửi request nếu có. Mọi thứ khác được SUY ra — `useAgentRun` lo vòng hỏi
 * trạng thái, còn giao diện đọc thẳng `run.status` để quyết định hiện khối nào.
 * Nhờ vậy không có đường nào để màn hình nói khác với database.
 */
export function ApplyView() {
  const queryClient = useQueryClient();
  const [runId, setRunId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const { run, error, timedOut, refresh } = useAgentRun(runId, LOGIN_NEXT);

  /*
   * LỊCH SỬ chạy thì cache được - nó chỉ đổi khi có lượt mới.
   *
   * Đừng nhầm nó với lượt ĐANG chạy: cái đó do `useAgentRun` hỏi lại theo nhịp
   * và không được cache, vì nó tiến từng bước ngay dưới mắt người dùng.
   */
  const page = useApiQuery(
    keys.agentRunList({ limit: PAGE_SIZE, offset }),
    () => agentService.list({ limit: PAGE_SIZE, offset }),
    { errorMessage: "Không tải được lịch sử chạy", keepPrevious: true },
  );

  /**
   * Gửi một request GHI rồi bám theo lượt chạy.
   *
   * Dùng chung cho "bắt đầu" và "trả lời": cả hai đều xếp cùng một hàng đợi và
   * cùng kết thúc bằng việc mở lại vòng hỏi trạng thái.
   */
  const send = useCallback(
    async (action: () => Promise<{ runId: string }>, fallback: string) => {
      setSending(true);
      setSendError(null);
      try {
        const receipt = await action();
        setRunId(receipt.runId);
        refresh();
        invalidateAfter(queryClient, "agentRun");
      } catch (err) {
        setSendError(apiErrorMessage(err, fallback));
      } finally {
        setSending(false);
      }
    },
    [refresh, queryClient],
  );

  const start = (input: AgentRunInput) =>
    void send(() => agentService.start(input), "Không bắt đầu được lượt chạy");

  const answer = (text: string) =>
    void send(
      () => agentService.answer(runId!, text),
      "Không gửi được câu trả lời",
    );

  const retry = () =>
    void send(() => agentService.retry(runId!), "Không chạy lại được lượt này");

  if (page.error)
    return <PageError title="Không tải được dữ liệu" message={page.error} />;

  const runs = page.data?.items ?? null;
  const busy = sending || run?.status === "PENDING" || run?.status === "RUNNING";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ứng tuyển tự động"
        subtitle="Một agent chạy trọn quy trình: đánh giá độ phù hợp, hỏi ý bạn, soạn hồ sơ, rồi nhờ chuyên gia phản biện đọc lại"
      />

      <AgentStartCard disabled={busy} onStart={start} />

      {sendError && <Alert tone="danger">{sendError}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}

      {timedOut && (
        <Alert
          tone="warning"
          title="Chờ quá lâu"
          actions={
            <Button variant="outline" size="sm" onClick={refresh}>
              <ArrowCounterClockwise className="size-4" />
              Đọc lại trạng thái
            </Button>
          }
        >
          Đã chờ mười một phút mà lượt chạy chưa dừng — lâu hơn cả hạn của chính nó. Hàng đợi có thể đang kẹt.
        </Alert>
      )}

      {run?.status === "WAITING_USER" && run.question && (
        <AgentQuestionCard
          question={run.question}
          sending={sending}
          onAnswer={answer}
        />
      )}

      {run?.status === "FAILED" && (
        <Alert
          tone="danger"
          title="Lượt chạy thất bại"
          actions={
            <Button variant="outline" size="sm" loading={sending} onClick={retry}>
              <ArrowCounterClockwise className="size-4" />
              Chạy tiếp từ chỗ dừng
            </Button>
          }
        >
          {run.error ?? "Không rõ lý do"}
          {run.steps.length > 0 && (
            <span className="mt-1 block text-xs">
              {run.steps.length} bước trước đó vẫn còn — chạy tiếp sẽ đi từ đó,
              không làm lại từ đầu.
            </span>
          )}
        </Alert>
      )}

      {run && <AgentTimeline run={run} />}
      {run?.status === "DONE" && <AgentResultCard run={run} />}

      {!runs ? (
        <SkeletonPage>
          <Skeleton className="h-40" />
        </SkeletonPage>
      ) : (
        <AgentHistory
          runs={runs}
          activeId={runId}
          onSelect={setRunId}
          page={{
            offset,
            limit: PAGE_SIZE,
            total: page.data?.total ?? 0,
            onOffsetChange: setOffset,
          }}
        />
      )}
    </div>
  );
}
