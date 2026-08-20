"use client";

import { Check, Copy, Mail } from "lucide-react";
import type { DocumentRecord } from "@/services";
import { useCopy } from "@/hooks/use-copy";
import {
  coverLetterPlainText,
  isCoverLetterEmpty,
  parseCoverLetterContent,
} from "@/lib/document-content";
import {
  documentSubtitle,
  DocumentSource,
  DocumentStatusBadge,
  UNREADABLE_CONTENT_MESSAGE,
} from "@/components/dashboard/document-job";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";

export function CoverLetterResult({
  record,
  loginNext,
}: {
  record: DocumentRecord;
  loginNext: string;
}) {
  const letter = parseCoverLetterContent(record.content);
  const { copied, copy } = useCopy();

  const handleCopy = () => copy("letter", coverLetterPlainText(letter));

  const paragraphs = [
    letter.opening,
    ...letter.bodyParagraphs,
    letter.motivation,
    letter.closing,
  ].filter((part): part is string => Boolean(part));

  return (
    <div className="space-y-4">
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
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Đã sao chép" : "Sao chép"}
            </Button>
          </>
        }
      >
        {isCoverLetterEmpty(letter) ? (
          <Alert tone="warning">{UNREADABLE_CONTENT_MESSAGE}</Alert>
        ) : (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            {letter.salutation && (
              <p className="text-sm font-semibold text-slate-900">
                {letter.salutation}
              </p>
            )}
            {/* Khoá kèm chỉ số: model hoàn toàn có thể lặp lại nguyên một đoạn,
                và hai khoá trùng nhau sẽ khiến React bỏ mất một đoạn. */}
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph}`}
                className="text-sm leading-relaxed text-slate-700"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400">
          Nội dung do AI sinh — kiểm tra lại tên công ty, người nhận và thông tin
          liên hệ trước khi gửi.
        </p>
      </SectionCard>

      {/* `key` là BẮT BUỘC: nó buộc React dựng lại component khi đổi tài
          liệu, thay cho một effect tự dọn state bên trong. */}
      <DocumentSource
        key={record.id}
        documentId={record.id}
        loginNext={loginNext}
      />
    </div>
  );
}
