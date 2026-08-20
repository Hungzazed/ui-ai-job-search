"use client";

import { useCallback, useMemo, useState } from "react";
import type { JobMatchWithJob } from "@/types";
import {
  documentsService,
  type ApplicationEmailInput,
  type DocumentRecord,
} from "@/services";
import {
  DocumentHistory,
  DocumentJobStatus,
  upsertDocument,
  useDocumentJob,
} from "@/components/dashboard/document-job";
import { useAsyncData } from "@/hooks/use-async-data";
import { PageError } from "@/components/ui/alert";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { ApplicationEmailResult } from "./application-email-result";
import { ApplicationEmailSourceCard } from "./application-email-source-card";

/** Số tài liệu hiện một lúc trong kho; phần còn lại lật bằng phân trang. */
const DOCUMENT_PAGE_SIZE = 10;

/**
 * Mail ứng tuyển: chọn nguồn tin, chờ AI viết, đọc kết quả, mở lại bản cũ.
 *
 * Cùng vòng đời với thư xin việc nên dùng lại nguyên bộ khối chung; khác duy
 * nhất ở chỗ nguồn tin có thể là một JD dán tay, và kết quả là một lá mail có
 * tiêu đề chứ không phải một tài liệu để in ra PDF.
 */
export function ApplicationEmailPanel({
  matches,
  fixedJobId,
  loginNext,
}: {
  matches: JobMatchWithJob[];
  fixedJobId: string | null;
  loginNext: string;
}) {
  const job = useDocumentJob(loginNext);
  const [documentOffset, setDocumentOffset] = useState(0);

  const load = useCallback(
    () =>
      documentsService.list("APPLICATION_EMAIL", fixedJobId ?? undefined, {
        limit: DOCUMENT_PAGE_SIZE,
        offset: documentOffset,
      }),
    [fixedJobId, documentOffset],
  );

  const page = useAsyncData(load, {
    loginNext,
    errorMessage: "Không tải được kho mail ứng tuyển",
  });

  /**
   * Bản ghi đang bám theo cũng là một dòng trong lịch sử, và ở đây nó được suy
   * ra lúc render chứ không được ghi vào state bằng một effect — hai nơi giữ
   * cùng một bản ghi thì sớm muộn cũng lệch nhau.
   */
  const documents: DocumentRecord[] | null = useMemo(() => {
    const list = page.data?.items ?? null;
    if (!list) return null;
    return job.document ? upsertDocument(list, job.document) : list;
  }, [page.data, job.document]);

  /**
   * Nguồn tin của lượt vừa bấm, giữ lại để nút "Thử lại" ở khối trạng thái gửi
   * đúng JD đó lần nữa. Không giữ thì lần thử lại chỉ đọc lại một bản ghi đã
   * FAILED, tức là một cái nút không làm gì cả.
   */
  const [lastInput, setLastInput] = useState<ApplicationEmailInput | null>(
    null,
  );

  const handleGenerate = useCallback(
    (input: ApplicationEmailInput) => {
      setLastInput(input);
      job.start(() => documentsService.createApplicationEmail(input));
    },
    [job],
  );

  if (page.error)
    return <PageError title="Không tải được dữ liệu" message={page.error} />;

  if (!documents) return <EmailPanelSkeleton />;

  const record = job.document;
  const isGenerating = job.phase === "generating";

  return (
    <div className="space-y-6">
      <ApplicationEmailSourceCard
        matches={matches}
        fixedJobId={fixedJobId}
        disabled={isGenerating}
        onSubmit={handleGenerate}
      />

      <DocumentJobStatus
        job={job}
        onRegenerate={() => lastInput && handleGenerate(lastInput)}
      />

      {job.phase === "done" && record && (
        <ApplicationEmailResult record={record} />
      )}

      <DocumentHistory
        page={{
          offset: documentOffset,
          limit: DOCUMENT_PAGE_SIZE,
          total: page.data?.total ?? 0,
          onOffsetChange: setDocumentOffset,
        }}
        documents={documents}
        activeId={record?.id ?? null}
        onSelect={job.open}
        emptyLabel="Bạn chưa viết mail ứng tuyển nào. Dán mô tả công việc rồi bấm “Viết mail ứng tuyển”."
      />
    </div>
  );
}

function EmailPanelSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-72" />
      <Skeleton className="h-56" />
    </SkeletonPage>
  );
}
