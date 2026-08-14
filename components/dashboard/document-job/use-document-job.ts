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
 * Một LƯỢT theo dõi. Định danh của nó là chính object này, không phải nội dung:
 * bấm lại đúng tài liệu đang xem cũng là một lượt mới (nó có thể vừa đổi trạng
 * thái ở phía worker), nên `open` luôn tạo object mới thay vì so sánh id.
 */
type Watch =
  | { kind: "starting" }
  | { kind: "watching"; documentId: string };

/** Những gì đọc được, có ĐÓNG DẤU lượt mà chúng thuộc về. */
interface Progress {
  of: Watch | null;
  document: DocumentRecord | null;
  error: string | null;
  timedOut: boolean;
}

const NOTHING: Progress = {
  of: null,
  document: null,
  error: null,
  timedOut: false,
};

/**
 * Bám theo một tài liệu chạy nền: gọi đường GHI, nhận `documentId`, rồi hỏi
 * lại đường ĐỌC cho tới khi bản ghi rời khỏi PENDING/RUNNING.
 *
 * `phase` KHÔNG được lưu, nó được **suy ra** từ lượt đang chạy và bản ghi đọc
 * được. Trước đây nó là state riêng, và mỗi lần bắt đầu một lượt phải tự đặt lại
 * `phase = "generating"` cùng `error = null` ngay trong thân effect — tức là
 * `phase` có thể nói khác với `document.status`, và đã có đúng một đường để nó
 * nói sai: `recheck()` trên một tài liệu FAILED chỉ tăng số lượt mà không đặt lại
 * `phase`. Suy ra thì không còn hai nguồn để lệch nhau.
 *
 * `Progress` mang theo dấu của lượt sinh ra nó, nên dữ liệu của lượt trước không
 * bao giờ hiện dưới lượt sau. Đó cũng là cách `useAsyncData` làm.
 *
 * `loginNext` là đường dẫn để quay lại sau khi đăng nhập — cookie hết hạn giữa
 * lúc đang chờ 90 giây là chuyện hoàn toàn có thật.
 */
export function useDocumentJob(loginNext: string): DocumentJob {
  const router = useRouter();
  const [watch, setWatch] = useState<Watch | null>(null);
  const [progress, setProgress] = useState<Progress>(NOTHING);

  // `start` chạy ngoài useEffect nên không có hàm dọn dẹp nào chặn nó; cờ này
  // là chỗ duy nhất để nó biết component đã tháo mà thôi ghi state.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const current = progress.of === watch ? progress : NOTHING;

  useEffect(() => {
    if (watch?.kind !== "watching") return;

    const { documentId } = watch;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let polls = 0;

    const read = async () => {
      try {
        const record = await documentsService.get(documentId);
        if (cancelled) return;

        if (record.status === "DONE") {
          setProgress({ ...NOTHING, of: watch, document: record });
          return;
        }
        if (record.status === "FAILED") {
          setProgress({
            ...NOTHING,
            of: watch,
            document: record,
            // Gateway AI hỏng thường xuyên, nên lý do thật của worker đáng giá
            // hơn bất kỳ câu chữ chung chung nào ta tự nghĩ ra.
            error: record.error ?? "Worker báo thất bại nhưng không kèm lý do",
          });
          return;
        }

        polls += 1;
        if (polls >= MAX_POLLS) {
          setProgress({
            ...NOTHING,
            of: watch,
            document: record,
            timedOut: true,
          });
          return;
        }

        setProgress({ ...NOTHING, of: watch, document: record });
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
        setProgress({
          ...NOTHING,
          of: watch,
          error: apiErrorMessage(err, "Không đọc được trạng thái tài liệu"),
        });
      }
    };

    void read();

    // Rời trang giữa chừng thì hẹn giờ đang chờ phải bị huỷ, nếu không nó vẫn
    // gọi API rồi ghi state lên một component đã tháo — và vòng hỏi cứ thế
    // chạy tiếp suốt gần ba phút sau lưng người dùng.
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [watch, router, loginNext]);

  const start = useCallback(
    (create: () => Promise<QueuedDocument>) => {
      // Giữ đúng object này để đóng dấu lỗi vào chính lượt vừa mở.
      const opened: Watch = { kind: "starting" };
      setWatch(opened);

      void (async () => {
        try {
          const receipt = await create();
          if (!mounted.current) return;
          setWatch({ kind: "watching", documentId: receipt.documentId });
        } catch (err) {
          if (!mounted.current) return;
          if (apiErrorStatus(err) === 401) {
            router.replace(`/login?next=${loginNext}`);
            return;
          }
          setProgress({
            ...NOTHING,
            of: opened,
            error: apiErrorMessage(err, "Không gửi được yêu cầu tạo tài liệu"),
          });
        }
      })();
    },
    [router, loginNext],
  );

  const open = useCallback((documentId: string) => {
    setWatch({ kind: "watching", documentId });
  }, []);

  const recheck = useCallback(() => {
    // Object MỚI cho cùng một documentId: đó là cách nói "đọc lại lượt này".
    setWatch((now) =>
      now?.kind === "watching" ? { ...now } : now,
    );
  }, []);

  const phase: DocumentJobPhase = !watch
    ? "idle"
    : current.error
      ? "failed"
      : current.timedOut
        ? "timeout"
        : current.document?.status === "DONE"
          ? "done"
          : "generating";

  return {
    phase,
    document: current.document,
    error: current.error,
    start,
    open,
    recheck,
  };
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
