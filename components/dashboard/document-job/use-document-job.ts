"use client";

import type { PartialCv } from "@/lib/cv-partial";
import { ModelStreamError, streamModel } from "@/lib/model-stream";
import type { DocumentJob, DocumentJobPhase } from "./document-job.types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { invalidateAfter } from "@/lib/query-keys";
import {
  documentsService,
  type DocumentRecord,
  type QueuedDocument,
} from "@/services";

/**
 * 4 giây: đủ thưa để không nện backend suốt hai phút, đủ dày để người dùng
 * không có cảm giác màn hình đã đứng hình.
 */
const POLL_INTERVAL_MS = 2000;

/**
 * 40 lần × 4 giây ≈ 2 phút 40 giây. Worker mất 30-90 giây khi mọi thứ bình
 * thường; vượt xa mốc này thì gần như chắc chắn là hàng đợi kẹt chứ không phải
 * model đang viết chậm, và hỏi thêm nữa cũng không đổi được gì.
 */
const MAX_POLLS = 80;

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
  partial: PartialCv | null;
}

const NOTHING: Progress = {
  of: null,
  document: null,
  error: null,
  timedOut: false,
  partial: null,
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
  const queryClient = useQueryClient();
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
          // Kho tài liệu vừa có thêm một dòng. Màn hình đang mở đã tự ghép bản
          // ghi này vào danh sách, nhưng bản trong cache thì chưa - rời đi rồi
          // quay lại trong 30 giây sẽ thấy nó biến mất.
          invalidateAfter(queryClient, "createDocument");
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
  }, [watch, router, loginNext, queryClient]);

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

  const startStream = useCallback(
    (create: () => Promise<QueuedDocument>) => {
      const opened: Watch = { kind: "starting" };
      setWatch(opened);
      setProgress({ ...NOTHING, of: opened });

      void (async () => {
        try {
          const receipt = await create();
          if (!mounted.current) return;

          const document = await streamModel<DocumentRecord, PartialCv>({
            path: `/documents/${receipt.documentId}/generate-stream`,
            onPartial: (partial) => {
              if (mounted.current)
                setProgress((now) => ({ ...now, of: opened, partial }));
            },
          });
          if (!mounted.current) return;
          setProgress({ ...NOTHING, of: opened, document });
          invalidateAfter(queryClient, "createDocument");
        } catch (err) {
          if (!mounted.current) return;
          if (apiErrorStatus(err) === 401) {
            router.replace(`/login?next=${loginNext}`);
            return;
          }
          setProgress({
            ...NOTHING,
            of: opened,
            error:
              err instanceof ModelStreamError
                ? err.message
                : apiErrorMessage(err, "Không tạo được tài liệu"),
          });
        }
      })();
    },
    [router, loginNext, queryClient],
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
    partial: current.partial,
    start,
    startStream,
    open,
    recheck,
  };
}
