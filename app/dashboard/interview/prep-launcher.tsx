"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkle } from "@phosphor-icons/react/ssr";
import { applicationsService, interviewService } from "@/services";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SelectMenu } from "@/components/ui/select-menu";

/**
 * Trần số đơn đổ vào ô chọn.
 *
 * Chỉ đơn ĐÃ NỘP mới vào đây nên con số thật sẽ nhỏ; đặt trần để một tài khoản
 * nộp rất nhiều không kéo cả danh sách về.
 */
const LIMIT = 100;

/**
 * Chọn một tin đã nộp rồi soạn bộ câu hỏi cho nó.
 *
 * Đặt ở ĐÂY chứ không ở trang chi tiết tin: việc chạy nền mất khoảng một phút,
 * và đây là màn hình hiển thị kết quả. Bấm xong thấy ngay một dòng mới ở trạng
 * thái đang chạy ngay bên dưới, thay vì bắn đi rồi phải tự đoán có gì đang chạy.
 *
 * Chỉ liệt kê đơn `APPLIED`: soạn bộ đề cho một tin mới chỉ xem qua là tốn một
 * lượt gọi model cho việc chưa chắc xảy ra.
 */
export function PrepLauncher({ onQueued }: { onQueued: () => void }) {
  const router = useRouter();
  const [jobId, setJobId] = useState("");
  const [queueing, setQueueing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applied = useApiQuery(
    ["applications", "list", "APPLIED", 0],
    () => applicationsService.list(undefined, { limit: LIMIT }, "APPLIED"),
    { errorMessage: "Không tải được danh sách đơn đã nộp" },
  );

  const options = applied.data?.items ?? [];

  const launch = async () => {
    if (!jobId) return;
    setQueueing(true);
    setError(null);
    try {
      await interviewService.prep(jobId);
      setJobId("");
      onQueued();
    } catch (cause: unknown) {
      if (apiErrorStatus(cause) === 401) {
        router.replace("/login?next=/dashboard/interview");
        return;
      }
      setError(apiErrorMessage(cause, "Không xếp được vào hàng đợi"));
    } finally {
      setQueueing(false);
    }
  };

  if (applied.data && options.length === 0) {
    return (
      <Alert tone="info" title="Chưa có đơn nào ở trạng thái Đã nộp">
        Bộ câu hỏi soạn theo tin bạn thật sự đã nộp. Mở Lịch sử ứng tuyển và đánh
        dấu một đơn là <strong>Đã nộp</strong>, rồi quay lại đây.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <label
            htmlFor="prep-job"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Tin đã nộp
          </label>
          <SelectMenu
            id="prep-job"
            variant="field"
            value={jobId}
            options={options.map((application) => ({
              value: application.jobId,
              label: application.job.title,
              hint: application.job.company,
            }))}
            onChange={setJobId}
            label="Chọn một tin để soạn bộ câu hỏi…"
            searchPlaceholder="Tìm theo chức danh hoặc công ty…"
            disabled={applied.loading || queueing}
          />
        </div>

        <Button onClick={() => void launch()} loading={queueing} disabled={!jobId}>
          <Sparkle className="size-4.5" />
          Soạn bộ câu hỏi
        </Button>

        <p className="w-full text-xs text-slate-500">
          Soạn xong mất khoảng một phút. Bạn có thể rời trang, việc vẫn chạy tiếp
          và bộ câu hỏi sẽ xuất hiện ở danh sách bên dưới.
        </p>

        {error && (
          <p className="w-full text-xs text-rose-600" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
