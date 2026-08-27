/* =========================================================
   Careelot — Data Models

   File này chỉ TÁI XUẤT, không định nghĩa gì. Nhờ vậy `import ... from
   "@/types"` ở khắp nơi vẫn chạy nguyên như cũ, còn khi cần sửa một kiểu thì
   biết ngay phải mở file nào.

   Cách chia soi gương theo `lib/services/`: thêm kiểu cho module x ở backend
   thì sửa `types/x.ts` và `lib/services/x.ts`.

   Một lưu ý xuyên suốt: có hai họ kiểu ở đây và đừng lẫn chúng.
   - Kiểu GIAO DIỆN (`Job`, `UserProfile`) là hình dạng component cần.
   - Kiểu BACKEND (`JobMatchWithJob`, `DashboardOverview`, `Application`) là
     hình dạng thật server trả về.
   `lib/adapters.ts` là chỗ chuyển từ họ sau sang họ trước.
   ========================================================= */

export type { AuthUser } from "./auth";

export type {
  ActivityItem,
  CertificateItem,
  ConnectionSource,
  ConnectionSourceType,
  ConnectionStatus,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  Skill,
  SkillLevel,
  UserProfile,
} from "./profile";

export type {
  AiMatchDetail,
  Job,
  JobMatchWithJob,
  JobTimestamp,
  SalaryCurrency,
  SalaryPeriod,
  SalaryRange,
} from "./job";

export type {
  Application,
  ApplicationGroup,
  ApplicationList,
  ApplicationStatus,
} from "./application";

export type {
  AiSuggestion,
  AiSuggestionType,
  DashboardOverview,
  TodayScore,
} from "./dashboard";

// types/admin.ts cố ý trống - kiểu của màn hình Quản trị nằm ở
// lib/services/admin.ts, cạnh chính lời gọi API sinh ra chúng.
