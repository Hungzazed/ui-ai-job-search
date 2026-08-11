"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { JobMatchWithJob } from "@/types";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
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
  const router = useRouter();
  const [matches, setMatches] = useState<JobMatchWithJob[] | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Rỗng nghĩa là chưa chọn. Backend BẮT BUỘC có jobId cho thư xin việc, nên
  // không có mục "tổng quát" như bên CV.
  const [jobId, setJobId] = useState<string>("");

  const job = useDocumentJob(LOGIN_NEXT);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [page, records] = await Promise.all([
          matchesService.list({ limit: MATCH_LIMIT }),
          documentsService.list("COVER_LETTER"),
        ]);
        if (cancelled) return;
        setMatches(page.items);
        setDocuments(records);
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(`/login?next=${LOGIN_NEXT}`);
          return;
        }
        setError(
          apiErrorMessage(err, "Không tải được dữ liệu trang thư xin việc"),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Bản ghi đang bám theo cũng là một dòng trong lịch sử; đồng bộ tại chỗ để
  // trạng thái ở hai nơi không mâu thuẫn nhau.
  useEffect(() => {
    const record = job.document;
    if (!record) return;
    setDocuments((current) =>
      current ? upsertDocument(current, record) : current,
    );
  }, [job.document]);

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
