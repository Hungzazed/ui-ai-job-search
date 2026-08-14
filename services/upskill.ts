import type { AiFailureKind } from "@/lib/failure-message";
import { api } from "@/lib/axios";
import type { QueuedReport, WorkStatus } from "./types";

/**
 * Bản ghi báo cáo Upskill.
 *
 * ĐÃ SỬA cho khớp `model UpskillReport` trong schema.prisma. Bản trước khai
 * `softGaps` và `roadmap` — hai trường **không tồn tại** ở backend; tên thật là
 * `synthesisedGaps` và `learningPlan`. Nó cũng thiếu hẳn `jobsAnalysed` và
 * `summary`. Dựng màn hình trên kiểu cũ sẽ ra một trang trống mà TypeScript
 * không kêu một tiếng nào, vì mọi trường đều là `unknown`.
 *
 * Các trường JSON để `unknown` là có chủ đích, giống `DocumentRecord.content`:
 * chúng do model sinh ra nên phải parse phòng thủ ở chỗ hiển thị, không ép kiểu.
 */
export interface UpskillReportRecord {
  id: string;
  /** AGGREGATE: tổng hợp mọi việc đã chấm. TARGETED: phân tích một việc. */
  mode: "AGGREGATE" | "TARGETED";
  jobId: string | null;
  status: WorkStatus;
  /**
   * Số công việc đưa vào phân tích.
   *
   * PHẢI hiện ra cho người dùng thấy — schema backend ghi rõ lý do: báo cáo dựa
   * trên 2 công việc không đáng tin như báo cáo dựa trên 20, và người đọc cần
   * biết cỡ mẫu trước khi tin vào lộ trình học.
   */
  jobsAnalysed: number;
  /** Thiếu hụt kỹ năng cứng, đã tính trọng số theo điểm phù hợp. */
  hardGaps: unknown;
  /** Thiếu hụt suy luận: domain, soft skill, tooling, credential. */
  synthesisedGaps: unknown;
  /** Lộ trình học theo thứ tự ưu tiên. */
  learningPlan: unknown;
  summary: string | null;
  modelId: string | null;
  /** null khi báo cáo chưa chạy xong. */
  generatedAt: string | null;
  /**
   * Phân loại lý do thất bại. null khi không thất bại.
   *
   * Thay cho trường `error` cũ, thứ mang nguyên văn thông báo của SDK ra tới giao
   * diện ("AI_APICallError: Error from provider..."). Backend giờ chỉ trả phân
   * loại; câu chữ cho người dùng nằm ở `lib/failure-message.ts`, và nguyên văn
   * vẫn còn trong DB cùng màn quản trị cho người vận hành.
   */
  failureKind: AiFailureKind | null;
  createdAt: string;
  // KHÔNG có `updatedAt`: khác `InterviewPrep`, model này chỉ có `createdAt`.
  // Mỗi lần chạy sinh một báo cáo mới thay vì sửa bản cũ, nên không có gì để
  // "cập nhật". Đừng thêm lại trường đó vì thấy các bản ghi khác đều có.
}

export const upskillService = {
  /** Báo cáo mới nhất đã hoàn thành — màn hình Upskill đọc cái này. */
  latest: () => api.get<UpskillReportRecord>("/upskill").then((r) => r.data),

  history: () =>
    api.get<UpskillReportRecord[]>("/upskill/history").then((r) => r.data),

  get: (id: string) =>
    api.get<UpskillReportRecord>(`/upskill/${id}`).then((r) => r.data),

  /** Có jobId thì chạy chế độ TARGETED, không có thì AGGREGATE. */
  generate: (jobId?: string) =>
    api.post<QueuedReport>("/upskill/generate", { jobId }).then((r) => r.data),

  generateSync: (jobId?: string) =>
    api
      .post<UpskillReportRecord>("/upskill/generate-sync", { jobId })
      .then((r) => r.data),
};
