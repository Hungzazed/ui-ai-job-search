"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Keyboard,
  Wand2,
} from "lucide-react";
import { apiErrorMessage } from "@/lib/axios";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  applyAttemptsService,
  type ApplyAttemptRecord,
  type ApplyOutcome,
} from "@/services";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 3 giây: worker mất ~10 giây cho một lượt (đo được 8,1s trên form thật), nên nhịp
 * này cho khoảng 3–4 lần hỏi là xong.
 */
const POLL_INTERVAL_MS = 3000;

/// 40 lần × 3 giây = 2 phút. Vượt mốc này thì gần như chắc chắn hàng đợi kẹt chứ
/// không phải trang đang tải chậm — hạn của cả lượt chạy phía backend là 90 giây.
const MAX_POLLS = 40;

/// Nhãn và màu cho từng kết luận. `LOGIN_WALL` KHÔNG phải màu đỏ: nó là một kết
/// luận hợp lệ, không phải sự cố.
const OUTCOME: Record<
  ApplyOutcome,
  { label: string; variant: "success" | "info" | "warning" | "danger" }
> = {
  FILLED: { label: "Đã điền sẵn", variant: "success" },
  LOGIN_WALL: { label: "Trang đòi đăng nhập", variant: "info" },
  NO_FORM: { label: "Không thấy form", variant: "warning" },
  UNREACHABLE: { label: "Không mở được trang", variant: "danger" },
};

/**
 * Assisted Apply: mở trang tuyển dụng, điền form, chụp ảnh, **dừng**.
 *
 * Component này cố ý KHÔNG có nút nào nộp hồ sơ, và câu chữ ở mọi trạng thái đều nói
 * rõ việc nộp thuộc về người dùng. Đó không phải là sự thận trọng suông: máy dò nhãn
 * form bằng regex, nên nó có thể điền sai; và một hồ sơ đã gửi thì không thu hồi
 * được.
 */
export function AssistedApplyCard({
  jobId,
  jobUrl,
}: {
  jobId: string;
  jobUrl: string;
}) {
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const load = useCallback(
    () => applyAttemptsService.latest(jobId),
    [jobId],
  );

  const attemptData = useAsyncData(load, {
    loginNext: `/dashboard/jobs/${jobId}`,
    errorMessage: "Không đọc được lượt ứng tuyển gần nhất",
  });

  const [live, setLive] = useState<ApplyAttemptRecord | null>(null);
  const attempt = live ?? attemptData.data;

  const running =
    attempt !== null &&
    (attempt.status === "PENDING" || attempt.status === "RUNNING");

  /*
   * Vòng hỏi trạng thái.
   *
   * Hẹn giờ theo chuỗi chứ không `setInterval`: một lần đọc chậm hơn 3 giây sẽ khiến
   * `setInterval` chồng nhiều request lên nhau. Cùng khuôn với `useDocumentJob`.
   */
  const attemptId = attempt?.id ?? null;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!attemptId || !running) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let polls = 0;

    const read = async () => {
      try {
        const next = await applyAttemptsService.get(attemptId);
        if (cancelled) return;
        setLive(next);

        if (next.status === "PENDING" || next.status === "RUNNING") {
          polls += 1;
          if (polls >= MAX_POLLS) return;
          timer = setTimeout(() => void read(), POLL_INTERVAL_MS);
        }
      } catch {
        // Một lần đọc lỗi không đáng làm gì cả: lượt sau sẽ đọc lại. Dừng vòng hỏi
        // ở đây sẽ để màn hình đứng im ở "đang chạy" mãi.
        if (!cancelled) timer = setTimeout(() => void read(), POLL_INTERVAL_MS);
      }
    };

    timer = setTimeout(() => void read(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [attemptId, running]);

  const start = async () => {
    setStarting(true);
    setStartError(null);
    setLive(null);
    try {
      await applyAttemptsService.start(jobId);
      // `reload()` của hook thay cho một bộ đếm tự dựng: nó đặt lại đúng dấu
      // `loadedFor` nên effect tải lại, và không cần một state phụ nào.
      if (mounted.current) attemptData.reload();
    } catch (error) {
      if (mounted.current) {
        setStartError(apiErrorMessage(error, "Không mở được trang tuyển dụng"));
      }
    } finally {
      if (mounted.current) setStarting(false);
    }
  };

  const confirm = async () => {
    if (!attempt) return;
    try {
      setLive(await applyAttemptsService.confirm(attempt.id));
    } catch (error) {
      setStartError(apiErrorMessage(error, "Không ghi được xác nhận"));
    }
  };

  return (
    <SectionCard
      icon={Wand2}
      title="Điền hồ sơ tự động"
      description="Hệ thống mở trang tuyển dụng, điền những gì khớp được từ hồ sơ của bạn, rồi chụp ảnh lại. Nút nộp vẫn do bạn bấm."
      actions={
        <Button
          size="sm"
          onClick={() => void start()}
          loading={starting || running}
          disabled={starting || running}
        >
          {running ? "Đang mở trang…" : attempt ? "Chạy lại" : "Điền thử"}
        </Button>
      }
    >
      {(startError ?? attemptData.error) && (
        <Alert tone="danger" className="mb-4">
          {startError ?? attemptData.error}
        </Alert>
      )}

      {attemptData.loading && !attempt ? (
        <Skeleton className="h-24" />
      ) : !attempt ? (
        <p className="text-sm text-slate-500">
          Chưa chạy lần nào. Bấm <strong>Điền thử</strong> để xem trang này điền
          được tới đâu — mất khoảng 10 giây.
        </p>
      ) : running ? (
        <p className="text-sm text-slate-500">
          Đang mở trang trong môi trường cách ly rồi điền form. Việc này mất
          khoảng 10 giây và có thể không tới được form nếu trang đòi đăng nhập.
        </p>
      ) : attempt.status === "FAILED" ? (
        <Alert tone="danger">
          {attempt.error ?? "Lượt chạy thất bại nhưng không kèm lý do."}
        </Alert>
      ) : (
        <Result attempt={attempt} jobUrl={jobUrl} onConfirm={confirm} />
      )}
    </SectionCard>
  );
}

function Result({
  attempt,
  jobUrl,
  onConfirm,
}: {
  attempt: ApplyAttemptRecord;
  jobUrl: string;
  onConfirm: () => void;
}) {
  const meta = attempt.outcome ? OUTCOME[attempt.outcome] : null;
  const filled = attempt.filled ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {meta && <Badge variant={meta.variant}>{meta.label}</Badge>}
        {attempt.confirmedAt && (
          <Badge variant="success" dot>
            Bạn đã xác nhận tự nộp
          </Badge>
        )}
      </div>

      {/* Câu của backend, hiện nguyên văn: nó được soạn riêng cho từng kết luận và
          mỗi câu dẫn tới một bước tiếp theo khác nhau. */}
      {/*
        `Alert` chỉ có bốn tone và không có tone trung tính, nên kết luận FILLED dùng
        một khối chữ thường thay vì một hộp màu: điền xong KHÔNG phải một cảnh báo, và
        tô màu nó lên sẽ làm bốn kết luận trông giống nhau về mức độ nghiêm trọng.
      */}
      {attempt.message &&
        (attempt.outcome === "FILLED" ? (
          <p className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>{attempt.message}</span>
          </p>
        ) : (
          <Alert tone={attempt.outcome === "LOGIN_WALL" ? "info" : "warning"}>
            {attempt.message}
          </Alert>
        ))}

      {filled.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Đã điền {filled.length} trường
          </p>
          <dl className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
            {filled.map((field, index) => (
              <div
                key={`${field.label}-${index}`}
                className="flex gap-3 px-3 py-2 text-sm"
              >
                <dt className="w-40 shrink-0 truncate text-slate-500">
                  {field.label}
                </dt>
                <dd className="min-w-0 flex-1 truncate font-medium text-slate-900">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {attempt.unmatched.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <Keyboard className="size-3.5" />
            Bạn cần tự điền {attempt.unmatched.length} trường
          </p>
          {/* Hiện danh sách này chứ không ẩn đi: nó là phần việc còn lại của người
              dùng, và ẩn nó đi sẽ khiến họ tưởng hồ sơ đã đầy. */}
          <ul className="space-y-1 text-sm text-slate-600">
            {attempt.unmatched.slice(0, 8).map((label, index) => (
              <li key={`${label}-${index}`} className="truncate">
                • {label || "(ô không có nhãn)"}
              </li>
            ))}
            {attempt.unmatched.length > 8 && (
              <li className="text-slate-400">
                … và {attempt.unmatched.length - 8} trường nữa
              </li>
            )}
          </ul>
        </div>
      )}

      {attempt.screenshotKey && <Screenshot attemptId={attempt.id} />}

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <a href={jobUrl} target="_blank" rel="noreferrer">
          <Button size="sm">
            <ExternalLink className="size-3.5" />
            Mở trang để nộp
          </Button>
        </a>

        {!attempt.confirmedAt && (
          <Button size="sm" variant="outline" onClick={onConfirm}>
            <CheckCircle2 className="size-3.5" />
            Tôi đã tự nộp
          </Button>
        )}

        <Link
          href="/dashboard/profile"
          className="text-xs text-slate-500 underline"
        >
          Bổ sung hồ sơ để điền được nhiều hơn
        </Link>
      </div>
    </div>
  );
}

/**
 * Ảnh chụp trang sau khi điền.
 *
 * Lấy Blob qua axios rồi `URL.createObjectURL`, KHÔNG dùng `<img src={endpoint}>`:
 * xác thực đi qua instance axios (cookie httpOnly hoặc header Bearer), còn thẻ `img`
 * chỉ gửi cookie — nó sẽ chạy ở môi trường này rồi vỡ khi đổi sang Bearer. Cùng lý do
 * như nút "Xem PDF".
 */
function Screenshot({ attemptId }: { attemptId: string }) {
  const load = useCallback(
    () => applyAttemptsService.screenshot(attemptId),
    [attemptId],
  );

  const blob = useAsyncData(load, {
    loginNext: "/dashboard",
    errorMessage: "Không tải được ảnh chụp",
  });

  // `createObjectURL` trong `useMemo` và thu hồi khi tháo: không thu hồi thì mỗi lần
  // xem một lượt khác lại giữ thêm vài trăm KB trong bộ nhớ tab.
  const url = useMemo(
    () => (blob.data ? URL.createObjectURL(blob.data) : null),
    [blob.data],
  );
  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  if (blob.error) {
    return (
      <Alert tone="warning">
        <AlertTriangle className="mb-1 inline size-3.5" /> {blob.error}
      </Alert>
    );
  }

  if (!url) return <Skeleton className="h-64" />;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Ảnh trang sau khi điền
      </p>
      {/* Ảnh cao (chụp cả trang) nên giới hạn chiều cao và cho cuộn trong khung:
          không giới hạn thì một trang tuyển dụng dài đẩy mọi thứ khác ra khỏi màn
          hình. Bấm vào để mở đúng kích thước thật. */}
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Ảnh chụp trang tuyển dụng sau khi điền" className="w-full" />
        </div>
      </a>
    </div>
  );
}
