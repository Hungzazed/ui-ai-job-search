/**
 * Một cửa duy nhất cho mọi lời gọi backend.
 *
 * Quy tắc: component KHÔNG được gọi `api.get`/`api.post` trực tiếp. Đây là nơi
 * duy nhất biết đường dẫn thật, nên đổi một route ở backend chỉ phải sửa đúng
 * một chỗ ở đây. Cách chia file soi gương theo module của backend — thêm route
 * ở `server/src/modules/x/` thì sửa `lib/services/x.ts`.
 *
 * Lưu ý xuyên suốt: những hàm tên `evaluate`, `prep`, `generate`, `start` là
 * ĐƯỜNG GHI chạy ở nền. Chúng trả về biên nhận chứ không trả kết quả — gọi
 * xong phải đọc lại bằng đường ĐỌC tương ứng. Các bản `*Sync` thì chờ tới khi
 * xong nhưng mất vài chục giây, chỉ dùng để thử nghiệm.
 */
export { authService } from "./auth";
export { dashboardService } from "./dashboard";
export { applicationsService } from "./applications";
export { jobsService } from "./jobs";
export { matchesService } from "./matches";
export { documentsService } from "./documents";
export { interviewService } from "./interview";
export { upskillService } from "./upskill";
export { profileService } from "./profile";
export { scraperService } from "./scraper";
export { skillsService } from "./skills";
export { adminService } from "./admin";

export type {
  AuthResult,
  Paginated,
  QueuedDocument,
  QueuedReport,
  QueuedResult,
  QueuedScrapeRun,
  WorkStatus,
} from "./types";

export type { CreateJobInput, JobRecord } from "./jobs";
export type { DocumentKind, DocumentRecord } from "./documents";
export type { InterviewPrepRecord } from "./interview";
export type { UpskillReportRecord } from "./upskill";
export type { ProfileRecord } from "./profile";
export type { ScrapeRunRecord } from "./scraper";
export type { SkillRecord } from "./skills";
export type { AiFailureKind, AiFailureRecord, AiHealth, PurposeStats } from "./admin";
