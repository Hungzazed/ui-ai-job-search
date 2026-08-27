"use client";

import { isClosed, useMockInterview } from "./use-mock-interview";

import Link from "next/link";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  Microphone,
  Sparkle,
} from "@phosphor-icons/react/ssr";

import { buildTranscript, pendingTurn } from "@/lib/interview-transcript";

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

export function MockInterviewView({ jobId }: { jobId: string }) {
  const {
    job,
    history,
    run,
    error,
    timedOut,
    refresh,
    sending,
    sendError,
    streaming,
    start,
    answer,
  } = useMockInterview(jobId);

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
  const busy =
    sending ||
    streaming !== null ||
    run?.status === "PENDING" ||
    run?.status === "RUNNING";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phỏng vấn thử"
        subtitle={`${job.data.title} · ${job.data.company}`}
        actions={
          <Link href="/dashboard/interview">
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4" />
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
              <ArrowCounterClockwise className="size-4" />
              Đọc lại trạng thái
            </Button>
          }
        >
          Người phỏng vấn ảo chưa soạn xong câu tiếp theo. Hàng đợi có thể đang kẹt.
        </Alert>
      )}

      {!run ? (
        <SectionCard
          icon={Microphone}
          title="Bắt đầu một buổi luyện"
          description="Một người phỏng vấn ảo sẽ hỏi bạn từng câu một, nghe bạn trả lời, rồi nhận xét ngay trước khi hỏi tiếp."
        >
          <EmptyState
            icon={Microphone}
            title="Chưa có buổi luyện nào cho vị trí này"
            description="Buổi luyện bám theo đúng tin tuyển dụng, hồ sơ và bộ đề chuẩn bị bạn đã có, nên câu hỏi sẽ đào vào những chỗ nhà tuyển dụng nhiều khả năng đào."
            action={
              <Button onClick={start} disabled={busy}>
                <Sparkle className="size-4" />
                {busy ? "Đang chuẩn bị" : "Bắt đầu phỏng vấn thử"}
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <SectionCard
          icon={Microphone}
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

          {/* Câu đang chảy về: vẽ ngay, không chờ database. Con trỏ nhấp nháy
              để phân biệt "đang viết" với "đã viết xong". */}
          {streaming !== null && (
            <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-4">
              {streaming ? (
                <Markdown text={streaming} className="text-slate-700" />
              ) : (
                <p className="text-sm text-slate-500">
                  Người phỏng vấn đang nghĩ…
                </p>
              )}
              <span className="mt-1 inline-block h-4 w-1.5 animate-pulse bg-primary-400 align-middle" />
            </div>
          )}

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
              <ArrowCounterClockwise className="size-4" />
              Luyện lại từ đầu
            </Button>
          )}
        </SectionCard>
      )}
    </div>
  );
}
