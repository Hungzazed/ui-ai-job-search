import { api } from "@/lib/axios";
import type { Paginated } from "./types";

export type AiFailureKind = "SCHEMA" | "TIMEOUT" | "UPSTREAM" | "OTHER";

export interface PurposeStats {
  purpose: string;
  total: number;
  ok: number;
  successRate: number;
  p50Ms: number;
  p95Ms: number;
  failures: Partial<Record<AiFailureKind, number>>;
}

/**
 * Dùng p50/p95 chứ KHÔNG dùng trung bình: độ trễ gọi model có đuôi rất dài
 * (đã đo được một lần 517 giây), và trung bình sẽ che mất thực tế là phần lớn
 * lần gọi đều nhanh.
 */
export interface AiHealth {
  total: number;
  ok: number;
  successRate: number;
  p50Ms: number;
  p95Ms: number;
  failures: Partial<Record<AiFailureKind, number>>;
  byPurpose: PurposeStats[];
  byModel: Array<{
    modelId: string;
    total: number;
    successRate: number;
    p50Ms: number;
  }>;
}

export interface AiFailureRecord {
  id: string;
  purpose: string;
  provider: string;
  modelId: string;
  failureKind: AiFailureKind | null;
  errorMessage: string | null;
  durationMs: number;
  createdAt: string;
}

/**
 * Chỉ tài khoản ADMIN gọi được. Vai trò đọc tươi từ database mỗi request nên
 * hạ quyền một tài khoản có hiệu lực ngay, không phải đợi token hết hạn.
 */
export const adminService = {
  /**
   * Phân loại nguyên nhân là thông tin giá trị nhất ở đây. SCHEMA nghĩa là
   * model quá yếu cho tác vụ; TIMEOUT/UPSTREAM nghĩa là gateway có vấn đề.
   * Hai kết luận dẫn tới hai hành động ngược nhau.
   */
  aiHealth: (days = 7) =>
    api.get<AiHealth>("/admin/ai-health", { params: { days } }).then((r) => r.data),

  aiFailures: (limit = 20) =>
    api
      .get<Paginated<AiFailureRecord>>("/admin/ai-failures", {
        params: { limit },
      })
      .then((r) => r.data),

  /**
   * Chạy ngay lượt quét hằng đêm, không đợi tới 23:00.
   *
   * Đường GHI: trả về biên nhận rồi worker chạy nền, mỗi portal mất vài phút.
   * Gọi xong KHÔNG có nghĩa là đã có tin mới — theo dõi bằng
   * `scraperService.history()`.
   */
  scrapeNow: () =>
    api
      .post<{
        queued: number;
        runs: Array<{ portal: string; runId: string }>;
        note: string;
      }>("/admin/scrape/run-now")
      .then((r) => r.data),
};
