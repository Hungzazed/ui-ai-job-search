"use client";

import { CircleHelp, Lightbulb, MessageSquare, RefreshCw, ShieldAlert } from "lucide-react";
import { failureMessage, isWorthRetrying } from "@/lib/failure-message";
import { type InterviewPrepRecord } from "@/services";
import { isInterviewPrepEmpty, parseStarAnswers, parseToughQuestions } from "@/lib/interview-content";
import { cn } from "@/utils";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";

export const STATUS_LABEL: Record<InterviewPrepRecord["status"], string> = {
  PENDING: "Đang chờ",
  RUNNING: "Đang soạn",
  DONE: "Xong",
  FAILED: "Thất bại",
};

export const STATUS_VARIANT: Record<
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

export function PrepDetail({
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

