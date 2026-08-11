import type { JobMatchWithJob } from "./job";

/* =========================================================
   Màn hình Tổng quan
   ========================================================= */

export type AiSuggestionType = "cv" | "apply" | "network" | "skill";

/**
 * Thẻ "Gợi ý từ AI".
 *
 * Backend suy ra bằng SQL chứ KHÔNG gọi model: hồ sơ thiếu gì, kỹ năng nào lặp
 * lại, việc nào đang điểm cao và còn mới. Tên gọi vẫn đúng theo nghĩa rộng —
 * dữ liệu dùng để suy ra đều do AI chấm điểm sinh ra.
 */
export interface AiSuggestion {
  id: string;
  type: AiSuggestionType;
  title: string;
  description: string;
  /** Backend gợi ý sẵn nơi cần đi tới khi bấm vào thẻ. */
  href?: string;
}

/**
 * Bốn chiều của `todayScore` đúng bằng bốn chiều CÓ TRỌNG SỐ trong
 * `04-job-evaluation.md` (kỹ thuật 30, kinh nghiệm 25, hành vi 15, định hướng
 * 30). Cố ý không có "mức lương": khung đánh giá không chấm lương.
 *
 * Mọi trường đều có thể null khi chưa có lần chấm nào — `sampleSize` cho biết
 * số liệu dựa trên bao nhiêu lần chấm, để giao diện không hiện số trông như
 * thật khi thực ra chưa có dữ liệu.
 */
export interface TodayScore {
  overall: number | null;
  skills: number | null;
  experience: number | null;
  behavioral: number | null;
  career: number | null;
  sampleSize: number;
}

/**
 * Payload của `GET /api/dashboard`.
 *
 * Mọi con số phù hợp ở đây đều đã LOẠI những tin bị cổng điều kiện chặn
 * (eligibility = FAIL). Điểm 0 của các tin đó nghĩa là "không được xét", không
 * phải "chấm thấp", nên trộn vào trung bình sẽ kéo tụt con số một cách sai
 * lệch. Tin bị loại được đếm riêng và báo qua thẻ gợi ý.
 */
export interface DashboardOverview {
  profileCompletion: number;
  matchingJobs: { total: number; newThisWeek: number };
  averageMatchScore: number | null;
  topMatches: JobMatchWithJob[];
  suggestions: AiSuggestion[];
  applications: { total: number; active: number };
  todayScore: TodayScore;
}

// `StatSummary` của bản mock cũ đã bị gỡ: mọi màn hình nay đọc
// `DashboardOverview`, tức hình dạng thật backend trả về. Giữ lại một kiểu
// song song chỉ tạo ra hai nguồn sự thật cho cùng một bộ số.
