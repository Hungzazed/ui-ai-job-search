"use client";

import { useCallback, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  documentsService,
  matchesService,
  type DocumentRecord,
} from "@/services";
import { isCvContentEmpty, parseCvContent } from "@/lib/document-content";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  documentSubtitle,
  DocumentHistory,
  DocumentJobStatus,
  DocumentSource,
  DocumentStatusBadge,
  JobSelectCard,
  UNREADABLE_CONTENT_MESSAGE,
  upsertDocument,
  useDocumentJob,
} from "@/components/dashboard/document-job";
import { Alert, PageError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { CvContentView } from "./cv-content";

const LOGIN_NEXT = "/dashboard/cv-optimizer";

/** Đủ để chọn trong một danh sách thả xuống mà không kéo cả bảng matches về. */
const MATCH_LIMIT = 50;

/** Giá trị của mục "không nhắm vị trí nào" — backend coi jobId là tuỳ chọn. */
const NO_JOB = "";

export function CvOptimizerView() {
  const [jobId, setJobId] = useState<string>(NO_JOB);

  const job = useDocumentJob(LOGIN_NEXT);

  const load = useCallback(async () => {
    const [page, records] = await Promise.all([
      matchesService.list({ limit: MATCH_LIMIT }),
      documentsService.list("CV"),
    ]);
    return { matches: page.items, documents: records };
  }, []);

  const page = useAsyncData(load, {
    loginNext: LOGIN_NEXT,
    errorMessage: "Không tải được dữ liệu trang tối ưu CV",
  });

  const error = page.error;
  const matches = page.data?.matches ?? null;

  // Suy ra lúc render, không chép vào state bằng effect — xem giải thích ở
  // `cover-letter-view.tsx`, hai màn dùng cùng một cách.
  const documents: DocumentRecord[] | null = useMemo(() => {
    const list = page.data?.documents ?? null;
    if (!list) return null;
    return job.document ? upsertDocument(list, job.document) : list;
  }, [page.data, job.document]);

  const handleGenerate = () => {
    job.start(() =>
      documentsService.createCv(jobId === NO_JOB ? undefined : jobId),
    );
  };

  if (error) return <PageError title="Không tải được dữ liệu" message={error} />;

  if (!matches || !documents) return <CvOptimizerSkeleton />;

  const record = job.document;
  const isGenerating = job.phase === "generating";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tối ưu CV"
        subtitle="AI viết lại CV của bạn theo hồ sơ đã lưu, có thể bám theo một tin tuyển dụng cụ thể"
      />

      <JobSelectCard
        title="Chọn vị trí muốn nhắm tới"
        description="Không chọn gì thì hệ thống sinh CV tổng quát từ hồ sơ của bạn"
        selectId="cv-job"
        matches={matches}
        value={jobId}
        onChange={setJobId}
        disabled={isGenerating}
        emptyOptionLabel="CV tổng quát (không nhắm vị trí nào)"
        action={
          <Button onClick={handleGenerate} loading={isGenerating}>
            <Sparkles className="size-4" />
            {isGenerating ? "Đang tạo…" : "Tạo CV bằng AI"}
          </Button>
        }
      />

      <DocumentJobStatus job={job} onRegenerate={handleGenerate} />

      {job.phase === "done" && record && <CvResult record={record} />}

      <DocumentHistory
        documents={documents}
        activeId={record?.id ?? null}
        onSelect={job.open}
        emptyLabel="Bạn chưa tạo CV nào. Bấm “Tạo CV bằng AI” để bắt đầu."
      />
    </div>
  );
}

function CvResult({ record }: { record: DocumentRecord }) {
  const cv = parseCvContent(record.content);

  return (
    <div className="space-y-4">
      <SectionCard
        compact
        title={record.title}
        description={documentSubtitle(record)}
        className="border-slate-200/90"
        contentClassName="space-y-5"
        actions={<DocumentStatusBadge status={record.status} />}
      >
        {isCvContentEmpty(cv) ? (
          <Alert tone="warning">{UNREADABLE_CONTENT_MESSAGE}</Alert>
        ) : null}
        <CvContentView cv={cv} />
      </SectionCard>

      {/* `key` là BẮT BUỘC: nó buộc React dựng lại component khi đổi tài
          liệu, thay cho một effect tự dọn state bên trong. */}
      <DocumentSource
        key={record.id}
        documentId={record.id}
        loginNext={LOGIN_NEXT}
      />
    </div>
  );
}

/** Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong. */
function CvOptimizerSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-14 w-72" />
      <Skeleton className="h-36" />
      <Skeleton className="h-64" />
    </SkeletonPage>
  );
}
