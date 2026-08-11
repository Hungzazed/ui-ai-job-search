import type { JobMatchWithJob } from "@/types";
import { api } from "@/lib/axios";
import type { Paginated, QueuedResult } from "./types";

export const matchesService = {
  /** Đường ĐỌC. Chỉ truy vấn database, không gọi model. */
  list: (params?: { limit?: number; offset?: number }) =>
    api
      .get<Paginated<JobMatchWithJob>>("/matches", { params })
      .then((r) => r.data),

  get: (jobId: string) =>
    api.get<JobMatchWithJob>(`/matches/${jobId}`).then((r) => r.data),

  /**
   * Đường GHI, chạy ở nền. Trả về ngay lập tức — KHÔNG có kết quả chấm điểm
   * trong phản hồi. Giao diện hiện trạng thái đang chạy rồi đọc lại sau.
   *
   * `force` bỏ qua kiểm tra promptHash để chấm lại khi người dùng bấm nút.
   */
  evaluate: (jobId: string, force = false) =>
    api
      .post<QueuedResult>("/matches/evaluate", { jobId, force })
      .then((r) => r.data),

  /**
   * Chấm ngay và chờ kết quả. CHỈ dùng để thử nghiệm hoặc đo chất lượng model:
   * một lần gọi mất vài chục giây và có thể chạm hạn 90 giây của backend. Đừng
   * gọi từ màn hình người dùng đang ngồi chờ.
   */
  evaluateSync: (jobId: string, force = false) =>
    api
      .post<JobMatchWithJob>("/matches/evaluate-sync", { jobId, force })
      .then((r) => r.data),
};
