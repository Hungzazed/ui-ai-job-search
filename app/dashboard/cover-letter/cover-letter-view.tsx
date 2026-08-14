"use client";

import { useCallback, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  documentsService,
  matchesService,
  type DocumentRecord,
} from "@/services";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  DocumentHistory,
  DocumentJobStatus,
  JobSelectCard,
  upsertDocument,
  useDocumentJob,
} from "@/components/dashboard/document-job";
import { PageError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { CoverLetterResult } from "./cover-letter-result";

const LOGIN_NEXT = "/dashboard/cover-letter";

const MATCH_LIMIT = 50;

export function CoverLetterView() {
  // Rỗng nghĩa là chưa chọn. Backend BẮT BUỘC có jobId cho thư xin việc, nên
  // không có mục "tổng quát" như bên CV.
  const [jobId, setJobId] = useState<string>("");

  const job = useDocumentJob(LOGIN_NEXT);

  const load = useCallback(async () => {
    const [page, records] = await Promise.all([
      matchesService.list({ limit: MATCH_LIMIT }),
      documentsService.list("COVER_LETTER"),
    ]);
    return { matches: page.items, documents: records };
  }, []);

  const page = useAsyncData(load, {
    loginNext: LOGIN_NEXT,
    errorMessage: "Không tải được dữ liệu trang thư xin việc",
  });

  const error = page.error;
  const matches = page.data?.matches ?? null;

  /**
   * Bản ghi đang bám theo cũng là một dòng trong lịch sử, và ở đây nó được **suy
   * ra** lúc render chứ không được ghi vào state bằng một effect.
   *
   * Trước đây một effect chép `job.document` vào `documents`, tức là cùng một bản
   * ghi tồn tại ở hai nơi và phải đồng bộ tay. Suy ra thì hai nơi không thể lệch
   * nhau, vì chỉ còn một nơi.
   */
  const documents: DocumentRecord[] | null = useMemo(() => {
    const list = page.data?.documents ?? null;
    if (!list) return null;
    return job.document ? upsertDocument(list, job.document) : list;
  }, [page.data, job.document]);

  const handleGenerate = () => {
    if (!jobId) return;
    job.start(() => documentsService.createCoverLetter(jobId));
  };

  if (error) return <PageError title="Không tải được dữ liệu" message={error} />;

  if (!matches || !documents) return <CoverLetterSkeleton />;

  const record = job.document;
  const isGenerating = job.phase === "generating";
  const selected = matches.find((match) => match.jobId === jobId) ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thư xin việc"
        subtitle="AI viết thư dựa trên hồ sơ của bạn và tin tuyển dụng bạn chọn"
      />

      <JobSelectCard
        title="Chọn tin tuyển dụng"
        description="Thư xin việc luôn viết cho một vị trí cụ thể, nên bước này là bắt buộc"
        selectId="letter-job"
        matches={matches}
        value={jobId}
        onChange={setJobId}
        disabled={isGenerating}
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
        <CoverLetterResult record={record} loginNext={LOGIN_NEXT} />
      )}

      <DocumentHistory
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
      <Skeleton className="h-14 w-72" />
      <Skeleton className="h-36" />
      <Skeleton className="h-64" />
    </SkeletonPage>
  );
}
