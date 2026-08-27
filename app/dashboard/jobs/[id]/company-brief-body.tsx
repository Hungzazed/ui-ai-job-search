"use client";

import { ArrowSquareOut, Check, X } from "@phosphor-icons/react/ssr";
import type { BriefSource, CompanyBriefRecord } from "@/services";
import { VERDICT_LABELS } from "@/lib/company-brief";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function Signals({ brief }: { brief: CompanyBriefRecord }) {
  const verdict = VERDICT_LABELS[brief.verdict];

  return (
    <div className="flex items-center gap-2">
      {brief.rating !== null && (
        <span className="text-sm font-semibold text-slate-800">
          {brief.rating.toFixed(1)}★
        </span>
      )}
      {brief.reviewCount !== null && (
        <span className="text-xs text-slate-500">
          {brief.reviewCount.toLocaleString("vi-VN")} đánh giá
        </span>
      )}
      <Badge variant={verdict.variant}>{verdict.label}</Badge>
    </div>
  );
}

export function BriefBody({
  brief,
  stale,
}: {
  brief: CompanyBriefRecord;
  stale: boolean;
}) {
  return (
    <div className="space-y-4">
      {brief.verdict === "NO_REVIEWS_YET" ? (
        <Alert tone="info">
          Các trang đánh giá có hồ sơ cho công ty này nhưng chưa ai viết gì. Đây
          thường là công ty nhỏ hoặc ít người biết — bạn có thể là người đầu
          tiên đánh giá sau khi đi làm.
        </Alert>
      ) : (
        brief.confidence === "LOW" && (
          <Alert tone="warning">
            Rất ít nguồn nói về nơi làm việc này — nên tự kiểm tra thêm trước
            khi quyết định.
          </Alert>
        )
      )}
      {stale && (
        <Alert tone="info">
          Bản tóm tắt đã quá 60 ngày. Bấm &quot;Làm mới&quot; để tra lại.
        </Alert>
      )}

      <p className="text-sm leading-relaxed text-slate-700">{brief.summary}</p>

      {(brief.pros.length > 0 || brief.cons.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <PointList items={brief.pros} tone="good" />
          <PointList items={brief.cons} tone="bad" />
        </div>
      )}

      {brief.sources.length > 0 && <SourceList brief={brief} />}
    </div>
  );
}

function PointList({ items, tone }: { items: string[]; tone: "good" | "bad" }) {
  if (items.length === 0) return null;
  const Icon = tone === "good" ? Check : X;

  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm text-slate-700">
          <Icon
            className={
              tone === "good"
                ? "mt-0.5 size-4.5 shrink-0 text-emerald-600"
                : "mt-0.5 size-4.5 shrink-0 text-rose-500"
            }
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Tên miền, đủ để nhận ra nguồn mà không phải đọc cả URL dài. */
function labelOf(source: BriefSource): string {
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return source.title;
  }
}

/**
 * Nguồn là phần bắt buộc, không phải trang trí — nó thay thế đúng danh sách
 * link mà người dùng vốn phải tự đi Google để có.
 *
 * Nguồn ĐÃ KIỂM mà không rút ra được gì vẫn hiện: nếu giấu đi thì khi kết luận
 * là "không có đánh giá", thẻ này thành ngõ cụt và người dùng lại phải tra tay
 * đúng những chỗ vừa tra.
 */
function SourceList({ brief }: { brief: CompanyBriefRecord }) {
  const used = brief.sources.filter((s) => s.usedFor !== null);
  const checked = brief.sources.filter((s) => s.usedFor === null);

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3">
      {used.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Nguồn đã dùng
          </p>
          <ul className="space-y-1.5">
            {used.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-start gap-1.5 text-sm text-primary-700 hover:underline"
                >
                  <ArrowSquareOut className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {labelOf(source)}
                    <span className="text-slate-500"> — {source.usedFor}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {checked.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Đã kiểm, không có đánh giá
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
            {checked.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-xs text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-700"
                >
                  {labelOf(source)}
                  {source.status === "unreachable" && " (không mở được)"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
