"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import {
  documentsService,
  type DocumentRecord,
  type QueuedDocument,
} from "@/services";

/**
 * 4 giây: đủ thưa để không nện backend suốt hai phút, đủ dày để người dùng
 * không có cảm giác màn hình đã đứng hình.
 */
const POLL_INTERVAL_MS = 4000;

/**
 * 40 lần × 4 giây ≈ 2 phút 40 giây. Worker mất 30-90 giây khi mọi thứ bình
 * thường; vượt xa mốc này thì gần như chắc chắn là hàng đợi kẹt chứ không phải
 * model đang viết chậm, và hỏi thêm nữa cũng không đổi được gì.
 */
const MAX_POLLS = 40;

export type DocumentJobPhase =
  | "idle"
  | "generating"
  | "done"
  | "failed"
  | "timeout";

export interface DocumentJob {
  phase: DocumentJobPhase;
  /** Bản ghi mới nhất đọc được; null khi chưa kịp đọc lần nào. */
  document: DocumentRecord | null;
  error: string | null;
  /** Gọi đường GHI rồi bám theo biên nhận `{queued, documentId}` trả về. */
  start: (create: () => Promise<QueuedDocument>) => void;
  /** Mở lại một tài liệu đã có; nếu nó còn đang chạy thì cũng bám theo. */
  open: (documentId: string) => void;
  /** Đọc lại từ đầu mà không sinh tài liệu mới. Dùng sau khi hết hạn chờ. */
  recheck: () => void;
}

/**
 * Bám theo một tài liệu chạy nền: gọi đường GHI, nhận `documentId`, rồi hỏi
 * lại đường ĐỌC cho tới khi bản ghi rời khỏi PENDING/RUNNING.
 *
 * `loginNext` là đường dẫn để quay lại sau khi đăng nhập — cookie hết hạn giữa
 * lúc đang chờ 90 giây là chuyện hoàn toàn có thật.
 */
export function useDocumentJob(loginNext: string): DocumentJob {
  const router = useRouter();
  const [documentId, setDocumentId] = useState<string | null>(null);
  /** Tăng lên để buộc vòng hỏi chạy lại trên cùng một `documentId`. */
  const [round, setRound] = useState(0);
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [phase, setPhase] = useState<DocumentJobPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  // `start` chạy ngoài useEffect nên không có hàm dọn dẹp nào chặn nó; cờ này
  // là chỗ duy nhất để nó biết component đã tháo mà thôi ghi state.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!documentId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let polls = 0;

    const read = async () => {
      try {
        const record = await documentsService.get(documentId);
        if (cancelled) return;
        setDocument(record);

        if (record.status === "DONE") {
          setPhase("done");
          return;
        }
        if (record.status === "FAILED") {
          setPhase("failed");
          // Gateway AI hỏng thường xuyên, nên lý do thật của worker đáng giá
          // hơn bất kỳ câu chữ chung chung nào ta tự nghĩ ra.
          setError(record.error ?? "Worker báo thất bại nhưng không kèm lý do");
          return;
        }

        polls += 1;
        if (polls >= MAX_POLLS) {
          setPhase("timeout");
          return;
        }
        // Hẹn giờ theo chuỗi chứ không dùng setInterval: nếu một lần đọc chậm
        // hơn 4 giây, setInterval sẽ chồng nhiều request lên nhau.
        timer = setTimeout(() => {
          void read();
        }, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(`/login?next=${loginNext}`);
          return;
        }
        setPhase("failed");
        setError(apiErrorMessage(err, "Không đọc được trạng thái tài liệu"));
      }
    };

    setPhase("generating");
    setError(null);
    void read();

    // Rời trang giữa chừng thì hẹn giờ đang chờ phải bị huỷ, nếu không nó vẫn
    // gọi API rồi ghi state lên một component đã tháo — và vòng hỏi cứ thế
    // chạy tiếp suốt gần ba phút sau lưng người dùng.
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [documentId, round, router, loginNext]);

  const start = useCallback(
    (create: () => Promise<QueuedDocument>) => {
      setPhase("generating");
      setError(null);
      setDocument(null);
      setDocumentId(null);

      void (async () => {
        try {
          const receipt = await create();
          if (!mounted.current) return;
          setDocumentId(receipt.documentId);
        } catch (err) {
          if (!mounted.current) return;
          if (apiErrorStatus(err) === 401) {
            router.replace(`/login?next=${loginNext}`);
            return;
          }
          setPhase("failed");
          setError(apiErrorMessage(err, "Không gửi được yêu cầu tạo tài liệu"));
        }
      })();
    },
    [router, loginNext],
  );

  const open = useCallback((id: string) => {
    setDocument(null);
    setDocumentId(id);
    // Bấm lại đúng tài liệu đang xem vẫn phải đọc lại: nó có thể vừa đổi
    // trạng thái ở phía worker.
    setRound((current) => current + 1);
  }, []);

  const recheck = useCallback(() => setRound((current) => current + 1), []);

  return { phase, document, error, start, open, recheck };
}

/**
 * Ghép bản ghi vừa đọc được vào danh sách lịch sử.
 *
 * Tài liệu đã tồn tại trong database ngay lúc bấm nút (trạng thái PENDING), nên
 * cập nhật tại chỗ thay vì gọi lại `list()` sau mỗi lần hỏi — cùng dữ liệu, ít
 * hơn một request mỗi 4 giây.
 */
export function upsertDocument(
  documents: DocumentRecord[],
  record: DocumentRecord,
): DocumentRecord[] {
  const index = documents.findIndex((item) => item.id === record.id);
  if (index === -1) return [record, ...documents];
  const next = [...documents];
  next[index] = record;
  return next;
}
