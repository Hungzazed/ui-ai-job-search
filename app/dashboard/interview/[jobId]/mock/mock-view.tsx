"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, RotateCcw, Sparkles } from "lucide-react";
import { apiErrorMessage } from "@/lib/axios";
import { buildTranscript, pendingTurn } from "@/lib/interview-transcript";
import { agentService, jobsService } from "@/services";
import { useAgentRun } from "@/hooks/use-agent-run";
import { useAsyncData } from "@/hooks/use-async-data";
import { AgentStatusBadge } from "@/components/dashboard/agent-status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, PageError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Markdown } from "@/components/ui/markdown";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { AnswerBox } from "./answer-box";
import { InterviewTurnBlock } from "./interview-turns";

const WORKFLOW = "interview";

/** Lượt chạy đã dừng hẳn, không còn chờ gì. */
const isClosed = (status: string) => status === "DONE" || status === "FAILED";

/**
 * Màn luyện phỏng vấn: một buổi hỏi - đáp có người phỏng vấn ảo.
 *
 * Toàn bộ phần chạy là kịch bản `.claude/commands/interview.md` chạy qua
 * `AgentRunnerService`, nên màn này KHÔNG có logic phỏng vấn nào của riêng nó —
 * nó bám theo một `AgentRun` và dựng lại buổi luyện từ nhật ký các bước.
 *
 * Buổi luyện kéo dài hàng chục phút và có thể tải lại trang giữa chừng, nên khi
 * mở màn hình việc đầu tiên là đi TÌM buổi đang dở của đúng công việc này thay
 * vì mặc định bày ra nút bắt đầu.
 */
export function MockInterviewView({ jobId }: { jobId: string }) {
  const [startedId, setStartedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const loginNext = `/dashboard/interview/${jobId}/mock`;

  const loadJob = useCallback(() => jobsService.get(jobId), [jobId]);
  const job = useAsyncData(loadJob, {
    loginNext,
    errorMessage: "Không tải được tin tuyển dụng",
  });

  const loadRuns = useCallback(
    () => agentService.list({ jobId, workflow: WORKFLOW, limit: 1 }),
    [jobId],
  );
  const history = useAsyncData(loadRuns, {
    loginNext,
    errorMessage: "Không tải được buổi luyện đã có",
  });

  /*
   * Buổi đang theo dõi được SUY RA, không giữ trong state riêng: buổi vừa bấm
   * bắt đầu nếu có, không thì buổi gần nhất của công việc này. Nhờ vậy tải lại
   * trang giữa chừng là quay đúng vào buổi đang dở, và không có đường nào để
   * màn hình nói khác với database.
   */
  const runId = startedId ?? history.data?.items[0]?.id ?? null;
  const { run, error, timedOut, refresh } = useAgentRun(runId, loginNext);

  const send = useCallback(
    async (action: () => Promise<{ runId: string }>, fallback: string) => {
      setSending(true);
      setSendError(null);
      try {
        const receipt = await action();
        setStartedId(receipt.runId);
        refresh();
      } catch (err) {
        setSendError(apiErrorMessage(err, fallback));
      } finally {
        setSending(false);
      }
    },
    [refresh],
  );

  const start = () =>
    void send(
      () => agentService.start({ workflow: WORKFLOW, jobId }),
      "Không bắt đầu được buổi luyện",
    );

  const answer = (text: string) =>
    void send(
      () => agentService.answer(runId!, text),
      "Không gửi được câu trả lời",
    );

  if (job.error)
    return <PageError title="Không tải được dữ liệu" message={job.error} />;
  if (!job.data || !history.data)
    return (
      <SkeletonPage>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </SkeletonPage>
    );

  const transcript = run ? buildTranscript(run) : null;
  const waiting = transcript ? pendingTurn(transcript) : null;
  const busy = sending || run?.status === "PENDING" || run?.status === "RUNNING";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phỏng vấn thử"
        subtitle={`${job.data.title} · ${job.data.company}`}
        actions={
          <Link href="/dashboard/interview">
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-3.5" />
              Bộ câu hỏi
            </Button>
          </Link>
        }
      />

      {sendError && <Alert tone="danger">{sendError}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}

      {run?.status === "FAILED" && (
        <Alert tone="danger" title="Buổi luyện dừng giữa chừng">
          {run.error ?? "Không rõ lý do"}
        </Alert>
      )}

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
          Người phỏng vấn ảo chưa soạn xong câu tiếp theo. Hàng đợi có thể đang kẹt.
        </Alert>
      )}

      {!run ? (
        <SectionCard
          icon={Mic}
          title="Bắt đầu một buổi luyện"
          description="Một người phỏng vấn ảo sẽ hỏi bạn từng câu một, nghe bạn trả lời, rồi nhận xét ngay trước khi hỏi tiếp."
        >
          <EmptyState
            icon={Mic}
            title="Chưa có buổi luyện nào cho vị trí này"
            description="Buổi luyện bám theo đúng tin tuyển dụng, hồ sơ và bộ đề chuẩn bị bạn đã có, nên câu hỏi sẽ đào vào những chỗ nhà tuyển dụng nhiều khả năng đào."
            action={
              <Button onClick={start} disabled={busy}>
                <Sparkles className="size-3.5" />
                {busy ? "Đang chuẩn bị" : "Bắt đầu phỏng vấn thử"}
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <SectionCard
          icon={Mic}
          title="Biên bản buổi luyện"
          description={
            transcript?.turns.length
              ? `${transcript.turns.length} lượt hỏi`
              : "Người phỏng vấn ảo đang soạn câu hỏi đầu tiên"
          }
          actions={<AgentStatusBadge status={run.status} />}
        >
          {transcript?.intro && (
            <Markdown text={transcript.intro} className="text-slate-600" />
          )}

          {transcript?.turns.length ? (
            <ol className="space-y-6">
              {transcript.turns.map((turn) => (
                <InterviewTurnBlock
                  key={turn.index}
                  turn={turn}
                  waiting={waiting?.index === turn.index}
                />
              ))}
            </ol>
          ) : null}

          {waiting && !busy && <AnswerBox sending={sending} onSend={answer} />}

          {busy && (
            <p className="text-sm text-slate-500">
              Người phỏng vấn ảo đang đọc câu trả lời của bạn…
            </p>
          )}

          {transcript?.closing && (
            <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-4 py-3">
              <p className="text-[0.6875rem] font-medium tracking-wide text-emerald-800 uppercase">
                Tổng kết
              </p>
              <Markdown text={transcript.closing} className="mt-1" />
            </div>
          )}

          {isClosed(run.status) && (
            <Button variant="outline" onClick={start} disabled={busy}>
              <RotateCcw className="size-3.5" />
              Luyện lại từ đầu
            </Button>
          )}
        </SectionCard>
      )}
    </div>
  );
}
