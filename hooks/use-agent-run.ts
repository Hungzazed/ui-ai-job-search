"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { agentService, type AgentRunRecord } from "@/services";

/**
 * 4 giây, cùng nhịp với vòng hỏi trạng thái tài liệu. Một bước của agent mất
 * 5-60 giây nên nhịp này đủ dày để tiến trình trông như đang chạy.
 */
const POLL_INTERVAL_MS = 2000;

/**
 * 165 lần × 4 giây = 11 phút, tức DÀI HƠN `AGENT_TIMEOUT_MS` 9 phút của backend.
 *
 * Thứ tự này phải giữ: vòng hỏi ngắn hơn hạn của lượt chạy thì màn hình bỏ cuộc
 * trong khi agent vẫn đang chạy, và người dùng thấy "chờ quá lâu" cho một lượt
 * hai phút sau đó kết thúc bình thường.
 */
const MAX_POLLS = 330;

export interface AgentRunView {
  run: AgentRunRecord | null;
  error: string | null;
  /** Hết hạn chờ mà lượt chạy vẫn chưa dừng. Khác hẳn "hỏng". */
  timedOut: boolean;
  /** Đọc lại ngay, không đợi hết nhịp. Dùng sau khi gửi câu trả lời. */
  refresh: () => void;
}

/** Lượt chạy còn động hay đã dừng hẳn. */
const isRunning = (run: AgentRunRecord | null): boolean =>
  run?.status === "PENDING" || run?.status === "RUNNING";

/**
 * Bám theo một lượt chạy agent cho tới khi nó dừng.
 *
 * "Dừng" gồm cả `WAITING_USER`, không chỉ DONE/FAILED: lúc đó agent đã nhả
 * worker và đang chờ người, nên hỏi tiếp chỉ tốn request. Người dùng trả lời
 * xong thì `refresh()` mở lại vòng hỏi.
 *
 * `runId = null` nghĩa là chưa có gì để theo dõi — người dùng còn đang gõ form.
 */
export function useAgentRun(
  runId: string | null,
  loginNext: string,
): AgentRunView {
  const router = useRouter();
  const [run, setRun] = useState<AgentRunRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Giữ bản ghi của ĐÚNG lượt đang xem: đổi runId thì dữ liệu cũ phải biến mất
  // ngay, không được nhấp nháy nội dung của lượt trước.
  const watching = useRef<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    if (watching.current !== runId) {
      watching.current = runId;
      setRun(null);
      setError(null);
      setTimedOut(false);
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let polls = 0;

    const read = async () => {
      try {
        const record = await agentService.get(runId);
        if (cancelled) return;

        setRun(record);
        if (!isRunning(record)) return;

        polls += 1;
        if (polls >= MAX_POLLS) {
          setTimedOut(true);
          return;
        }
        // Hẹn giờ theo chuỗi chứ không setInterval: một lần đọc chậm sẽ khiến
        // setInterval chồng nhiều request lên nhau.
        timer = setTimeout(() => void read(), POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(`/login?next=${loginNext}`);
          return;
        }
        setError(apiErrorMessage(err, "Không đọc được lượt chạy"));
      }
    };

    void read();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [runId, attempt, router, loginNext]);

  const refresh = useCallback(() => setAttempt((count) => count + 1), []);

  return { run, error, timedOut, refresh };
}
