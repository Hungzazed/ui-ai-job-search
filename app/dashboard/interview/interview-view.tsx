"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleHelp,
  Lightbulb,
  MessageSquare,
  Mic,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { failureMessage, isWorthRetrying } from "@/lib/failure-message";
import { interviewService, type InterviewPrepRecord } from "@/services";
import {
  isInterviewPrepEmpty,
  parseStarAnswers,
  parseToughQuestions,
} from "@/lib/interview-content";
import { cn, companyColor, companyInitials, relativeDay } from "@/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { MockSessions } from "./mock-sessions";

const LOGIN_NEXT = "/login?next=/dashboard/interview";

/** Số vị trí hiện một lúc ở cột trái. Phần còn lại lật bằng thanh phân trang. */
const PAGE_SIZE = 15;

/** Bốn trạng thái của một lượt soạn, mỗi cái cần một câu khác nhau. */
const STATUS_LABEL: Record<InterviewPrepRecord["status"], string> = {
  PENDING: "Đang chờ",
  RUNNING: "Đang soạn",
  DONE: "Xong",
  FAILED: "Thất bại",
};

const STATUS_VARIANT: Record<
  InterviewPrepRecord["status"],
  "info" | "warning" | "success" | "danger"
> = {
  PENDING: "info",
  RUNNING: "warning",
  DONE: "success",
  FAILED: "danger",
};

/** Một mục có nhãn, dùng cho bốn phần của khung STAR. */
function StarPart({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{value}</p>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-sm leading-relaxed text-slate-700">
          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PrepDetail({
  prep,
  retrying,
  onRetry,
}: {
  prep: InterviewPrepRecord;
  retrying: boolean;
  onRetry: () => Promise<void>;
}) {
  const starAnswers = parseStarAnswers(prep.starAnswers);
  const toughQuestions = parseToughQuestions(prep.toughQuestions);

  if (prep.status === "FAILED") {
    return (
      <div className="space-y-3">
        <Alert tone="danger">
        {/* Trước đây chỗ này in nguyên `prep.error`, tức nguyên văn thông báo
            của SDK, kèm ghi chú rằng "lý do thật đáng giá hơn câu chung chung".
            Đúng một nửa: lý do thật đáng giá — cho người vận hành. Người dùng
            đọc "AI_APICallError: Error from provider (Console)" thì không biết
            nên chờ, nên bấm lại, hay nên báo lỗi. Nay backend trả phân loại và
            `failureMessage` nói ra bước tiếp theo; nguyên văn vẫn ở DB cùng màn
            quản trị. */}
          {failureMessage(prep.failureKind)}
        </Alert>

        {/*
          Câu thông báo nói "hãy thử lại", nên phải có chỗ để thử lại — nếu không
          thì nó chỉ là lời khuyên suông.

          `isWorthRetrying` gạt riêng lỗi SCHEMA: đó là lúc model không trả nổi
          đúng cấu trúc, nên bấm lại gần như chắc chắn hỏng tiếp và mỗi lần bấm
          vẫn tốn một lượt gọi. Ở trường hợp đó không hiện nút, và thông báo đã
          nói là cần báo lỗi.
        */}
        {isWorthRetrying(prep.failureKind) && (
          <Button
            variant="secondary"
            disabled={retrying}
            onClick={() => void onRetry()}
          >
            <RefreshCw className={cn("size-4", retrying && "animate-spin")} />
            {retrying ? "Đang xếp lại vào hàng đợi…" : "Thử lại"}
          </Button>
        )}
      </div>
    );
  }

  if (prep.status !== "DONE") {
    return (
      <Alert tone="info">
        Đang soạn bộ câu hỏi cho vị trí này. Một lượt mất khoảng 30–90 giây; mở
        lại trang sau ít phút là có.
      </Alert>
    );
  }

  // DONE nhưng không đọc được gì — khác hẳn "đang soạn", nên phải nói thẳng.
  if (isInterviewPrepEmpty(prep)) {
    return (
      <Alert tone="warning">
        Lượt soạn đã xong nhưng nội dung trả về không dùng được. Chuyển đơn ứng
        tuyển ra khỏi trạng thái Phỏng vấn rồi quay lại để soạn lượt mới.
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {starAnswers.length > 0 && (
        <SectionCard
          icon={MessageSquare}
          title="Câu chuyện theo khung STAR"
          description="Dựng từ kinh nghiệm có thật trong hồ sơ của bạn, không phải ví dụ mẫu."
        >
          <div className="space-y-5">
            {starAnswers.map((answer, index) => (
              <div
                key={index}
                className="border-l-2 border-slate-100 pl-4 first:pt-0"
              >
                {answer.competency && (
                  <Badge variant="outline" className="mb-2">
                    {answer.competency}
                  </Badge>
                )}
                {answer.question && (
                  <p className="mb-3 text-sm font-semibold text-slate-900">
                    {answer.question}
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <StarPart label="Bối cảnh" value={answer.situation} />
                  <StarPart label="Nhiệm vụ" value={answer.task} />
                  <StarPart label="Hành động" value={answer.action} />
                  <StarPart label="Kết quả" value={answer.result} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {toughQuestions.length > 0 && (
        <SectionCard
          icon={ShieldAlert}
          title="Câu hỏi khó"
          description="Ưu tiên những câu đào vào khoảng trống thật giữa hồ sơ và tin tuyển dụng."
        >
          <div className="space-y-4">
            {toughQuestions.map((item, index) => (
              <div key={index} className="border-l-2 border-amber-100 pl-4">
                <p className="text-sm font-semibold text-slate-900">
                  {item.question}
                </p>
                {item.why && (
                  <p className="mt-1 text-xs text-slate-500">
                    Vì sao họ hỏi: {item.why}
                  </p>
                )}
                {item.suggestedAnswer && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {item.suggestedAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {prep.likelyProbes.length > 0 && (
        <SectionCard
          icon={ShieldAlert}
          title="Chỗ họ nhiều khả năng sẽ đào sâu"
          description="Những điểm hồ sơ còn mỏng so với yêu cầu. Chuẩn bị trước thì không bị bất ngờ."
        >
          <BulletList items={prep.likelyProbes} />
        </SectionCard>
      )}

      {prep.talkingPoints.length > 0 && (
        <SectionCard
          icon={Lightbulb}
          title="Ý cần chủ động nhắc tới"
          description="Nếu buổi phỏng vấn không tự dẫn tới những ý này thì bạn nên đưa chúng vào."
        >
          <BulletList items={prep.talkingPoints} />
        </SectionCard>
      )}

      {prep.questionsToAsk.length > 0 && (
        <SectionCard
          icon={CircleHelp}
          title="Câu bạn nên hỏi lại"
          description="Cụ thể cho công ty và vị trí này, không phải câu hỏi chung chung."
        >
          <BulletList items={prep.questionsToAsk} />
        </SectionCard>
      )}
    </div>
  );
}

export function InterviewView() {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [retryError, setRetryError] = useState<string | null>(null);
  /** `null` = người dùng chưa bấm chọn, để hệ thống chọn hộ. */
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const page = useApiQuery(
    ["interview", "list", offset],
    () => interviewService.list({ limit: PAGE_SIZE, offset }),
    {
      errorMessage: "Không tải được bộ câu hỏi phỏng vấn",
      keepPrevious: true,
    },
  );

  const preps: InterviewPrepRecord[] | null = page.data?.items ?? null;
  const total = page.data?.total ?? 0;
  const error = retryError ?? page.error;

  /*
   * Ưu tiên một bản ĐÃ XONG, chỉ lùi về bản mới nhất khi không có bản nào xong.
   *
   * Backend sắp theo `updatedAt` giảm dần, mà một lần chạy hỏng cũng cập nhật
   * `updatedAt` — nên "bản mới nhất" rất hay chính là bản vừa hỏng, và người
   * dùng mở màn hình ra là gặp ngay một khối lỗi đỏ trong khi vẫn có bộ câu hỏi
   * dùng được ở ngay dưới. Đó đúng là điều đã xảy ra.
   *
   * Suy ra lúc render thay vì gieo vào state sau khi tải: bản cũ cần một `ref`
   * để nhớ đã chọn hộ lần nào chưa, và lật trang thì lựa chọn cũ trỏ vào một
   * bản ghi không còn trên trang — khung bên phải trống trơn.
   */
  const autoId =
    (preps?.find((prep) => prep.status === "DONE") ?? preps?.[0])?.id ?? null;
  const selectedId = chosenId ?? autoId;
  const selected = preps?.find((prep) => prep.id === selectedId) ?? null;

  /**
   * Xếp lại vào hàng đợi rồi tải lại danh sách.
   *
   * `force: true` là bắt buộc: bản ghi đã tồn tại ở trạng thái FAILED, và đường
   * mặc định sẽ thấy "đã có rồi" mà không chạy lại gì cả.
   */
  const retry = async () => {
    if (!selected) return;
    setRetrying(true);
    setRetryError(null);
    try {
      await interviewService.prep(selected.job.id, true);
      page.reload();
    } catch (err) {
      if (apiErrorStatus(err) === 401) {
        router.replace(LOGIN_NEXT);
        return;
      }
      setRetryError(apiErrorMessage(err, "Không xếp lại được vào hàng đợi"));
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chuẩn bị phỏng vấn"
        subtitle="Bộ câu hỏi và câu trả lời gợi ý, soạn riêng cho từng vị trí bạn đang phỏng vấn"
      />

      {/*
        Đặt TRƯỚC nhánh rẽ bên dưới, không nằm trong nó: nhánh đó trả về ô trống
        khi chưa có bộ đề nào, mà buổi luyện thì không cần bộ đề - nhét vào trong
        là lặp lại đúng lỗi đã làm một lần, khoá lối vào sau một điều kiện thừa.
      */}
      <MockSessions />

      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : !preps ? (
        <Skeleton className="h-64 animate-pulse" />
      ) : preps.length === 0 ? (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="Chưa có bộ câu hỏi nào"
            description={
              <>
                Bộ câu hỏi được soạn tự động khi bạn chuyển một đơn ứng tuyển
                sang trạng thái <strong>Phỏng vấn</strong>. Hệ thống không soạn
                sớm hơn vì phần lớn đơn không đi tới vòng này, mà mỗi lượt soạn
                đều tốn một lần gọi model.
              </>
            }
            action={
              <Link href="/dashboard/applications">
                <Button>Mở Lịch sử ứng tuyển</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          {/* Danh sách vị trí */}
          <Card className="h-fit overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {preps.map((prep) => {
                const active = prep.id === selectedId;
                return (
                  <li key={prep.id}>
                    <button
                      type="button"
                      onClick={() => setChosenId(prep.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left transition-colors",
                        active ? "bg-primary-50" : "hover:bg-slate-50",
                      )}
                    >
                      <CompanyLogo
                        initials={companyInitials(prep.job.company)}
                        color={companyColor(prep.job.company)}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {prep.job.title}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {prep.job.company}
                        </p>
                      </div>
                      {prep.status !== "DONE" && (
                        <Badge variant={STATUS_VARIANT[prep.status]}>
                          {STATUS_LABEL[prep.status]}
                        </Badge>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <Pagination
              offset={offset}
              limit={PAGE_SIZE}
              total={total}
              noun="vị trí"
              onOffsetChange={setOffset}
            />
          </Card>

          <div className="min-w-0">
            {selected && (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    {selected.job.title}
                  </h2>
                  <Badge variant={STATUS_VARIANT[selected.status]}>
                    {STATUS_LABEL[selected.status]}
                  </Badge>
                  {selected.generatedAt && (
                    <span className="text-xs text-slate-400">
                      soạn {relativeDay(selected.generatedAt)}
                    </span>
                  )}
                  {/*
                    Lối vào buổi luyện đặt Ở ĐÂY chứ không phải trên thanh bên:
                    một buổi luyện luôn gắn với MỘT vị trí, và đây là chỗ duy
                    nhất trên màn hình mà người dùng đã chọn xong vị trí đó.
                  */}
                  <Link
                    href={`/dashboard/interview/${selected.job.id}/mock`}
                    className="ml-auto"
                  >
                    <Button variant="outline" size="sm">
                      <Mic className="size-3.5" />
                      Phỏng vấn thử
                    </Button>
                  </Link>
                </div>
                <PrepDetail prep={selected} retrying={retrying} onRetry={retry} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
