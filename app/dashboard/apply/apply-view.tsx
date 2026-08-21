"use client";

import { useCallback, useState } from "react";
import { RotateCcw } from "lucide-react";
import { agentService, type AgentRunInput } from "@/services";
import { useAgentRun } from "@/hooks/use-agent-run";
import { useAsyncData } from "@/hooks/use-async-data";
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
  const [runId, setRunId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const { run, error, timedOut, refresh } = useAgentRun(runId, LOGIN_NEXT);

  const load = useCallback(
    () => agentService.list({ limit: PAGE_SIZE, offset }),
    [offset],
  );
  const page = useAsyncData(load, {
    loginNext: LOGIN_NEXT,
    errorMessage: "Không tải được lịch sử chạy",
  });

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
        page.reload();
      } catch (err) {
        setSendError(apiErrorMessage(err, fallback));
      } finally {
        setSending(false);
      }
    },
    [refresh, page],
  );

  const start = (input: AgentRunInput) =>
    void send(() => agentService.start(input), "Không bắt đầu được lượt chạy");

  const answer = (text: string) =>
    void send(
      () => agentService.answer(runId!, text),
      "Không gửi được câu trả lời",
    );

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
              <RotateCcw className="size-3.5" />
              Đọc lại trạng thái
            </Button>
          }
        >
          Đã chờ sáu phút mà lượt chạy chưa dừng. Hàng đợi có thể đang kẹt.
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
        <Alert tone="danger" title="Lượt chạy thất bại">
          {run.error ?? "Không rõ lý do"}
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
