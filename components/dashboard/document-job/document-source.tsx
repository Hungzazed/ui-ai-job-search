"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, FileDown } from "lucide-react";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { documentsService } from "@/services";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mã `.tex` thô. Chỉ tải khi người dùng bấm mở — phần lớn người dùng không bao
 * giờ cần tới nó, và nó là một request riêng.
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
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Đổi sang tài liệu khác thì đóng lại, kẻo người dùng thấy mã của tài liệu cũ.
  useEffect(() => {
    setOpen(false);
    setSource(null);
    setError(null);
  }, [documentId]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    void (async () => {
      try {
        const tex = await documentsService.source(documentId);
        if (cancelled) return;
        setSource(tex);
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(`/login?next=${loginNext}`);
          return;
        }
        setError(apiErrorMessage(err, "Không đọc được mã .tex"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, documentId, router, loginNext]);

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
    setError(null);
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
      setError(apiErrorMessage(err, "Không tạo được PDF"));
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

      {/* Lỗi của PDF hiện kể cả khi khối .tex đang đóng: nó không liên quan tới
          việc mở/đóng mã nguồn. */}
      {!open && error && <Alert tone="danger">{error}</Alert>}

      {open && error && <Alert tone="danger">{error}</Alert>}

      {open && !error && source === null && (
        <div className="animate-pulse">
          <Skeleton className="h-40" />
        </div>
      )}

      {open && source !== null && (
        <pre className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-[11px] leading-relaxed text-slate-100">
          {source}
        </pre>
      )}
    </div>
  );
}
