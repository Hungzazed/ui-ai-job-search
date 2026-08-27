"use client";

import Link from "next/link";
import {
  CheckCircle,
  FileText,
  Info,
  Warning,
} from "@phosphor-icons/react/ssr";
import type { ApplicableField, ProposalRow } from "@/lib/profile-draft-content";
import { isProposalEmpty } from "@/lib/profile-draft-content";
import { profileDraftService, type ProfileDraftRecord } from "@/services";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { FieldRow } from "./field-row";

export function ReviewCard({
  draft,
  rows,
  selected,
  onToggle,
  onApply,
  applying,
  applied,
}: {
  draft: ProfileDraftRecord;
  rows: ProposalRow[];
  selected: ApplicableField[];
  onToggle: (field: ApplicableField) => void;
  onApply: () => void;
  applying: boolean;
  applied: boolean;
}) {
  if (isProposalEmpty(draft.proposal)) {
    return (
      <Alert tone="warning" title="Đọc xong nhưng không rút được gì">
        AI không tìm thấy thông tin hồ sơ nào trong file này. Thường là do CV có rất
        ít chữ, hoặc phần lớn nội dung nằm trong ảnh. Hãy thử một bản PDF xuất trực
        tiếp từ Word, LaTeX hoặc Canva.
      </Alert>
    );
  }

  const overwriting = rows.filter(
    (row) => row.overwrites && selected.includes(row.field),
  );

  return (
    <div className="space-y-4">
      {applied && (
        <Alert tone="success" title="Đã cập nhật hồ sơ" icon={CheckCircle}>
          Những trường bạn chọn đã được ghi vào hồ sơ.{" "}
          <Link
            href="/dashboard/profile"
            className="font-semibold underline underline-offset-2"
          >
            Mở hồ sơ để xem
          </Link>
          .
        </Alert>
      )}

      <SectionCard
        title="AI đề xuất — bạn chọn nhận phần nào"
        icon={FileText}
        description={
          draft.filename
            ? `Đọc từ ${draft.filename}. Không gì được ghi vào hồ sơ cho tới khi bạn bấm áp dụng.`
            : "Không gì được ghi vào hồ sơ cho tới khi bạn bấm áp dụng."
        }
        actions={
          <div className="flex items-center gap-2">
            {draft.filename && (
              <a
                href={profileDraftService.fileUrl(draft.id)}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" variant="outline">
                  <FileText className="size-4" />
                  Xem CV gốc
                </Button>
              </a>
            )}
            <Badge variant={draft.appliedAt ? "success" : "neutral"}>
              {draft.appliedAt ? "Đã áp dụng" : "Chờ xác nhận"}
            </Badge>
          </div>
        }
      >
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <FieldRow
              key={row.field}
              row={row}
              checked={selected.includes(row.field)}
              onToggle={() => onToggle(row.field)}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Đã chọn{" "}
            <span className="font-semibold text-slate-800">
              {selected.length}
            </span>{" "}
            trường
            {overwriting.length > 0 && (
              <span className="text-amber-700">
                {" "}
                · {overwriting.length} trường sẽ ghi đè dữ liệu hiện có
              </span>
            )}
          </p>
          <Button onClick={onApply} disabled={selected.length === 0 || applying}>
            <CheckCircle className="size-4.5" />
            {applying ? "Đang áp dụng…" : "Áp dụng vào hồ sơ"}
          </Button>
        </div>
      </SectionCard>

      {(draft.proposal?.missing.length ?? 0) > 0 && (
        <SectionCard
          title="AI không tìm thấy trong CV"
          icon={Warning}
          iconClassName="bg-amber-50 text-amber-700"
          description="Những phần này phải tự điền ở màn Hồ sơ — hệ thống cố ý không đoán chúng."
          compact
        >
          <ul className="space-y-1.5">
            {draft.proposal?.missing.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-600">
                <span className="text-slate-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {(draft.proposal?.notes.length ?? 0) > 0 && (
        <SectionCard title="Ghi chú khi đọc" icon={Info} compact>
          <ul className="space-y-1.5">
            {draft.proposal?.notes.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-600">
                <span className="text-slate-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
