"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Code2 } from "lucide-react";
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

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((current) => !current)}
      >
        <Code2 className="size-3.5" />
        {open ? "Ẩn mã .tex" : "Xem mã .tex"}
      </Button>

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
