import { api } from "@/lib/axios";
import { blobErrorToError } from "./blob-error";
import type { WorkStatus } from "./types";

/**
 * Kết luận của một lượt Assisted Apply. Khớp enum `ApplyOutcome` ở backend.
 *
 * KHÔNG có giá trị nào nghĩa là "đã nộp": hệ thống không bấm nút nộp. Việc người dùng
 * tự nộp được ghi bằng `confirmedAt`.
 */
export type ApplyOutcome = "FILLED" | "LOGIN_WALL" | "NO_FORM" | "UNREACHABLE";

export interface FilledField {
  label: string;
  value: string;
}

export interface ApplyAttemptRecord {
  id: string;
  jobId: string;
  status: WorkStatus;
  outcome: ApplyOutcome | null;
  /// Câu backend đã soạn cho đúng kết luận này. Giao diện hiện nguyên văn.
  message: string | null;
  filled: FilledField[] | null;
  unmatched: string[];
  screenshotKey: string | null;
  /// Thời điểm NGƯỜI DÙNG khẳng định đã tự nộp trên trang tuyển dụng.
  confirmedAt: string | null;
  error: string | null;
  createdAt: string;
}

export const applyAttemptsService = {
  /**
   * Đường GHI: trả biên nhận, không trả kết quả. Worker mất ~10 giây.
   *
   * `jobId` đi trong THÂN. Bản đầu truyền qua `params` với thân `null`, và axios gửi
   * chuỗi `null` kèm `Content-Type: application/json` — `express.json()` ở backend
   * mặc định `strict: true` nên nó trả 400 với câu `Unexpected token 'n', "null" is
   * not valid JSON`, hiện thẳng lên màn hình người dùng.
   */
  start: (jobId: string) =>
    api
      .post<{ attemptId: string }>("/apply-attempts", { jobId })
      .then((r) => r.data),

  /**
   * Lượt gần nhất của một tin. `null` khi chưa từng chạy lượt nào.
   *
   * Backend bọc trong `{ attempt }` chứ không trả thẳng `null`: Nest gửi `null` thành
   * thân RỖNG kèm HTTP 200, và axios đổ `Unexpected token 'n', "null" is not valid
   * JSON` lên màn hình. Đã gặp đúng vậy khi chạy thật.
   */
  latest: (jobId: string) =>
    api
      .get<{ attempt: ApplyAttemptRecord | null }>("/apply-attempts/latest", {
        params: { jobId },
      })
      .then((r) => r.data.attempt),

  get: (attemptId: string) =>
    api
      .get<ApplyAttemptRecord>(`/apply-attempts/${attemptId}`)
      .then((r) => r.data),

  /**
   * Ảnh chụp trang sau khi điền.
   *
   * Lấy Blob qua axios chứ KHÔNG dùng `<img src={...}>` trỏ thẳng endpoint: xác thực
   * đi bằng cookie httpOnly và header Bearer qua instance axios, còn thẻ `<img>` chỉ
   * gửi cookie — nó sẽ chạy ở môi trường này rồi vỡ ngay khi đổi sang Bearer. Cùng lý
   * do như nút "Xem PDF".
   */
  screenshot: (attemptId: string) =>
    api
      .get<Blob>(`/apply-attempts/${attemptId}/screenshot`, {
        responseType: "blob",
      })
      .then((r) => r.data)
      .catch(async (error: unknown) => {
        throw await blobErrorToError(error);
      }),

  /// Người dùng khẳng định đã TỰ nộp. Hệ thống không thể tự biết điều này.
  confirm: (attemptId: string) =>
    api
      .put<ApplyAttemptRecord>(`/apply-attempts/${attemptId}/confirm`)
      .then((r) => r.data),
};
