"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, FileDown } from "lucide-react";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useAsyncData } from "@/hooks/use-async-data";
import { documentsService } from "@/services";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mã `.tex` thô. Chỉ tải khi người dùng bấm mở — phần lớn người dùng không bao
 * giờ cần tới nó, và nó là một request riêng.
 *
 * NGƯỜI GỌI PHẢI TRUYỀN `key={documentId}`. Trước đây component tự dọn state
 * bằng một effect chạy theo `documentId` (đóng khối mã, xoá nội dung cũ) — nhưng
 * mở tài liệu khác thật ra là **một component khác**, không phải cùng một
 * component với dữ liệu mới. Đặt `key` để React tháo và dựng lại là cách React
 * khuyến nghị, và nó xoá luôn cả effect kia: không còn khoảng thời gian nào mà
 * `documentId` mới đứng cạnh `source` cũ.
 */
export function DocumentSource({
  documentId,
  loginNext,
}: {
  documentId: string;
  loginNext: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // `null` khi khối mã đang đóng: chưa ai cần thì chưa gọi request nào.
  const load = useMemo(
    () => (open ? () => documentsService.source(documentId) : null),
    [open, documentId],
  );

  const tex = useAsyncData(load, {
    loginNext,
    errorMessage: "Không đọc được mã .tex",
  });

  const source = tex.data;
  const error = pdfError ?? tex.error;

  /**
   * Tải PDF rồi MỞ TRONG TAB MỚI.
   *
   * Không dùng `<a href>` trực tiếp tới endpoint: xác thực đi bằng cookie httpOnly
   * và header Bearer qua instance axios, còn một thẻ `<a>` chỉ gửi cookie — nên nó
   * sẽ hoạt động ở môi trường này rồi vỡ ngay khi đổi sang Bearer. Lấy Blob qua
   * axios là dùng đúng một đường xác thực cho mọi request.
   *
   * `revokeObjectURL` sau một nhịp: gọi ngay thì tab mới chưa kịp nạp xong và hiện
   * trang trắng.
   */
  const openPdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const blob = await documentsService.pdf(documentId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      if (apiErrorStatus(err) === 401) {
        router.replace(`/login?next=${loginNext}`);
        return;
      }
      setPdfError(apiErrorMessage(err, "Không tạo được PDF"));
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={pdfLoading} onClick={() => void openPdf()}>
          <FileDown className="size-3.5" />
          {pdfLoading ? "Đang tạo PDF…" : "Xem PDF"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((current) => !current)}
        >
          <Code2 className="size-3.5" />
          {open ? "Ẩn mã .tex" : "Xem mã .tex"}
        </Button>
      </div>

      {/* Lỗi hiện kể cả khi khối .tex đang đóng: lỗi PDF không liên quan tới
          việc mở/đóng mã nguồn. Trước đây chỗ này là hai nhánh `!open &&` và
          `open &&` cùng vẽ đúng một thứ. */}
      {error && <Alert tone="danger">{error}</Alert>}

      {open && !error && source === null && (
        <div className="animate-pulse">
          <Skeleton className="h-40" />
        </div>
      )}

      {open && source !== null && (
        <pre className="max-h-96 overflow-auto rounded-xl border-slab-2 bg-slab text-slab-muted border p-4 font-mono text-2xs leading-relaxed">
          {source}
        </pre>
      )}
    </div>
  );
}
