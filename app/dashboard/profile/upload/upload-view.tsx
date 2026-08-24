"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FailedCard, RunningCard, UploadCard } from "./upload-cards";
import { ReviewCard } from "./review-card";
import { useCvUpload } from "./use-cv-upload";

export function UploadCvView() {
  const {
    draft,
    loading,
    error,
    file,
    setFile,
    uploading,
    retrying,
    selected,
    applying,
    applied,
    rows,
    running,
    upload,
    retry,
    apply,
    toggle,
  } = useCvUpload();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đọc hồ sơ từ CV"
        subtitle="Nộp CV PDF, AI đọc thành đề xuất — bạn chọn nhận phần nào"
        actions={
          <Link href="/dashboard/profile">
            <Button variant="outline">
              <ArrowLeft className="size-4" />
              Về hồ sơ
            </Button>
          </Link>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <UploadCard
        file={file}
        onPick={setFile}
        onUpload={() => void upload()}
        uploading={uploading}
        disabled={running}
      />

      {loading ? (
        <Skeleton className="h-48 animate-pulse" />
      ) : running ? (
        <RunningCard draft={draft} />
      ) : draft?.status === "FAILED" ? (
        <FailedCard
          draft={draft}
          onRetry={() => void retry()}
          retrying={retrying}
        />
      ) : draft?.status === "DONE" ? (
        <ReviewCard
          draft={draft}
          rows={rows}
          selected={selected}
          onToggle={toggle}
          onApply={() => void apply()}
          applying={applying}
          applied={applied}
        />
      ) : null}
    </div>
  );
}
