"use client";

import { Hourglass, Loader2, RotateCcw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DocumentJob } from "./use-document-job";

const RUNNING_LABELS = {
  RUNNING: "AI đang soạn nội dung…",
  PENDING: "Đã xếp hàng, đang chờ worker nhận…",
  SENDING: "Đang gửi yêu cầu tới máy chủ…",
} as const;

interface DocumentJobStatusProps {
  job: DocumentJob;
  /** Sinh lại từ đầu — tạo một tài liệu MỚI, khác với `recheck`. */
  onRegenerate: () => void;
}

/**
 * Ba trạng thái mà người dùng phải phân biệt được: đang chạy, hỏng, và chờ quá
 * lâu. Trả về null khi chưa bắt đầu hoặc đã xong — lúc đó trang tự lo phần nội
 * dung.
 */
export function DocumentJobStatus({
  job,
  onRegenerate,
}: DocumentJobStatusProps) {
  if (job.phase === "generating") {
    const status = job.document?.status;
    return (
      <Card className="border-primary-200 bg-primary-50/40 p-5">
        <div className="flex items-start gap-3.5">
          <Loader2 className="text-primary-600 mt-0.5 size-5 shrink-0 animate-spin" />
          <div className="space-y-1">
            <p className="text-primary-900 text-sm font-semibold">
              {status === "RUNNING"
                ? RUNNING_LABELS.RUNNING
                : status === "PENDING"
                  ? RUNNING_LABELS.PENDING
                  : RUNNING_LABELS.SENDING}
            </p>
            {/*
              Không có thanh tiến độ ở đây, và đó là cố ý: ta không biết còn bao
              lâu, một thanh chạy đều chỉ là lời hứa bịa ra.
            */}
            <p className="text-primary-800/80 text-xs leading-relaxed">
              Việc này thường mất 30 đến 90 giây. Bạn cứ để trang mở, trạng thái
              sẽ tự cập nhật khi worker chạy xong.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (job.phase === "timeout") {
    return (
      <Alert
        tone="warning"
        icon={Hourglass}
        title="Quá lâu, hãy tải lại trang"
        actions={
          <Button variant="outline" size="sm" onClick={job.recheck}>
            <RotateCcw className="size-3.5" />
            Đọc lại trạng thái
          </Button>
        }
      >
        Đã chờ gần ba phút mà tài liệu vẫn chưa xong. Hàng đợi có thể đang kẹt —
        bạn có thể đọc lại trạng thái, hoặc quay lại sau.
      </Alert>
    );
  }

  if (job.phase === "failed") {
    return (
      <Alert
        tone="danger"
        title="Tạo tài liệu thất bại"
        actions={
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RotateCcw className="size-3.5" />
            Thử lại
          </Button>
        }
      >
        <span className="break-words">{job.error}</span>
      </Alert>
    );
  }

  return null;
}
