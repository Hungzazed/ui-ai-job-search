"use client";

import { Check, Copy, Mail, Send } from "lucide-react";
import type { DocumentRecord } from "@/services";
import {
  applicationEmailPlainText,
  isApplicationEmailEmpty,
  parseApplicationEmailContent,
} from "@/lib/document-content";
import {
  documentSubtitle,
  DocumentStatusBadge,
  UNREADABLE_CONTENT_MESSAGE,
} from "@/components/dashboard/document-job";
import { useCopy } from "@/hooks/use-copy";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";

/**
 * Trần độ dài cho đường `mailto:`.
 *
 * Trình duyệt và trình gửi thư đều có giới hạn riêng cho URL, và khi vượt thì
 * chúng KHÔNG báo lỗi — chúng mở một cửa sổ soạn thư với thân mail bị cắt cụt.
 * Quá dài thì thà giấu nút đi và để người dùng dùng nút sao chép, còn hơn đưa
 * họ một bản thiếu mà trông như đủ.
 */
const MAILTO_MAX_LENGTH = 1800;

export function ApplicationEmailResult({ record }: { record: DocumentRecord }) {
  const email = parseApplicationEmailContent(record.content);
  const { copied, copy } = useCopy();

  const body = applicationEmailPlainText(email);
  const mailto = `mailto:?subject=${encodeURIComponent(email.subject ?? "")}&body=${encodeURIComponent(body)}`;
  const signature = email.signature;

  if (isApplicationEmailEmpty(email)) {
    return (
      <SectionCard
        compact
        icon={Mail}
        iconClassName="size-4 text-slate-400"
        title={record.title}
        description={documentSubtitle(record)}
        className="border-slate-200/90"
        actions={<DocumentStatusBadge status={record.status} />}
      >
        <Alert tone="warning">{UNREADABLE_CONTENT_MESSAGE}</Alert>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      compact
      icon={Mail}
      iconClassName="size-4 text-slate-400"
      title={record.title}
      description={documentSubtitle(record)}
      className="border-slate-200/90"
      actions={
        <>
          <DocumentStatusBadge status={record.status} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy("body", body)}
          >
            {copied === "body" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied === "body" ? "Đã sao chép" : "Sao chép nội dung"}
          </Button>
          {mailto.length <= MAILTO_MAX_LENGTH && (
            <a href={mailto}>
              <Button variant="secondary" size="sm">
                <Send className="size-3.5" />
                Mở trình gửi mail
              </Button>
            </a>
          )}
        </>
      }
    >
      {/* Tiêu đề tách hẳn khỏi thân mail vì ở mọi trình gửi thư chúng là hai ô
          khác nhau — gộp chung thì người dùng phải tự cắt ra. */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              Tiêu đề mail
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {email.subject ?? "Model không trả về tiêu đề"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copy("subject", email.subject)}
            disabled={!email.subject}
          >
            {copied === "subject" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied === "subject" ? "Đã sao chép" : "Sao chép"}
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        {email.greeting && (
          <p className="text-sm font-semibold text-slate-900">
            {email.greeting}
          </p>
        )}
        {/* Khoá kèm chỉ số: model hoàn toàn có thể lặp lại nguyên một đoạn, và
            hai khoá trùng nhau sẽ khiến React bỏ mất một đoạn. */}
        {[email.paragraphs, [email.attachmentNote, email.closing]]
          .flat()
          .filter((part): part is string => Boolean(part))
          .map((paragraph, index) => (
            <p
              key={`${index}-${paragraph}`}
              className="text-sm leading-relaxed text-slate-700"
            >
              {paragraph}
            </p>
          ))}

        {email.signOff && (
          <p className="text-sm text-slate-700">{email.signOff}</p>
        )}

        {/* Chữ ký do backend ghép từ hồ sơ, không do model viết — số điện thoại
            sai ở đây là thứ người nhận sẽ dùng để gọi lại. */}
        <div className="space-y-0.5 text-sm text-slate-700">
          {signature.name && (
            <p className="font-semibold text-slate-900">{signature.name}</p>
          )}
          {signature.title && <p>{signature.title}</p>}
          {signature.phone && <p>{signature.phone}</p>}
          {signature.email && <p>{signature.email}</p>}
        </div>
      </div>

      {!signature.phone && (
        <Alert tone="warning">
          Hồ sơ chưa có số điện thoại nên chữ ký thiếu mất phần này. Điền ở mục
          Hồ sơ của tôi rồi tạo lại mail.
        </Alert>
      )}

      <p className="text-xs text-slate-400">
        Nội dung do AI sinh — kiểm tra lại tên công ty, người nhận và đừng quên
        đính kèm CV trước khi gửi.
      </p>
    </SectionCard>
  );
}
