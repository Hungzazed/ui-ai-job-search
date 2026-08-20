"use client";

import { useCallback, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import type { JobMatchWithJob } from "@/types";
import { documentsService, type DocumentRecord } from "@/services";
import {
  DocumentHistory,
  DocumentJobStatus,
  JobSelectCard,
  upsertDocument,
  useDocumentJob,
} from "@/components/dashboard/document-job";
import { useAsyncData } from "@/hooks/use-async-data";
import { PageError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { CoverLetterResult } from "./cover-letter-result";

/** Số tài liệu hiện một lúc trong kho; phần còn lại lật bằng phân trang. */
const DOCUMENT_PAGE_SIZE = 10;

/**
 * Thư xin việc trang trọng, kết quả có bản `.tex` và tải được PDF.
 *
 * Khác mail ứng tuyển ở nguồn tin: thư xin việc BẮT BUỘC gắn với một tin đã có
 * trong hệ thống, vì bản `.tex` được đặt tên và đóng dấu theo tin đó.
 */
export function CoverLetterPanel({
  matches,
  fixedJobId,
  loginNext,
}: {
  matches: JobMatchWithJob[];
  fixedJobId: string | null;
  loginNext: string;
}) {
  // Rỗng nghĩa là chưa chọn. Backend BẮT BUỘC có jobId cho thư xin việc, nên
  // không có mục "tổng quát" như bên CV.
  const [jobId, setJobId] = useState<string>(fixedJobId ?? "");
  const job = useDocumentJob(loginNext);
  const [documentOffset, setDocumentOffset] = useState(0);

  const load = useCallback(
    () =>
      documentsService.list("COVER_LETTER", fixedJobId ?? undefined, {
        limit: DOCUMENT_PAGE_SIZE,
        offset: documentOffset,
      }),
    [fixedJobId, documentOffset],
  );

  const page = useAsyncData(load, {
    loginNext,
    errorMessage: "Không tải được kho thư xin việc",
  });

  /**
   * Bản ghi đang bám theo cũng là một dòng trong lịch sử, và ở đây nó được **suy
   * ra** lúc render chứ không được ghi vào state bằng một effect.
   *
   * Trước đây một effect chép `job.document` vào `documents`, tức là cùng một bản
   * ghi tồn tại ở hai nơi và phải đồng bộ tay. Suy ra thì hai nơi không thể lệch
   * nhau, vì chỉ còn một nơi.
   */
  const documents: DocumentRecord[] | null = useMemo(() => {
    const list = page.data?.items ?? null;
    if (!list) return null;
    return job.document ? upsertDocument(list, job.document) : list;
  }, [page.data, job.document]);

  const handleGenerate = () => {
    if (!jobId) return;
    job.start(() => documentsService.createCoverLetter(jobId));
  };

  if (page.error)
    return <PageError title="Không tải được dữ liệu" message={page.error} />;

  if (!documents) return <CoverLetterSkeleton />;

  const record = job.document;
  const isGenerating = job.phase === "generating";
  const selected = matches.find((match) => match.jobId === jobId) ?? null;

  return (
    <div className="space-y-6">
      <JobSelectCard
        title="Chọn tin tuyển dụng"
        description="Thư xin việc luôn viết cho một vị trí cụ thể, nên bước này là bắt buộc"
        selectId="letter-job"
        matches={matches}
        value={jobId}
        onChange={setJobId}
        disabled={isGenerating || Boolean(fixedJobId)}
        emptyOptionLabel="— Chọn một công việc —"
        hint={
          matches.length === 0
            ? "Chưa có công việc nào được chấm điểm. Hãy quét tin tuyển dụng trước."
            : undefined
        }
        action={
          <Button
            onClick={handleGenerate}
            loading={isGenerating}
            disabled={!jobId}
          >
            <Sparkles className="size-4" />
            {isGenerating ? "Đang tạo…" : "Tạo thư xin việc"}
          </Button>
        }
      />

      {selected && !isGenerating && job.phase !== "done" && (
        <p className="text-xs text-slate-500">
          Thư sẽ được viết cho vị trí{" "}
          <span className="font-semibold text-slate-700">
            {selected.job.title}
          </span>{" "}
          tại{" "}
          <span className="font-semibold text-slate-700">
            {selected.job.company}
          </span>
          .
        </p>
      )}

      <DocumentJobStatus job={job} onRegenerate={handleGenerate} />

      {job.phase === "done" && record && (
        <CoverLetterResult record={record} loginNext={loginNext} />
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
        emptyLabel="Bạn chưa tạo thư xin việc nào. Chọn một công việc rồi bấm “Tạo thư xin việc”."
      />
    </div>
  );
}

/** Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong. */
function CoverLetterSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-36" />
      <Skeleton className="h-64" />
    </SkeletonPage>
  );
}
