import type {
  Job,
  JobMatchWithJob,
  JobTimestamp,
  SalaryCurrency,
  SalaryRange,
} from "@/types";
import type { JobListItem } from "@/services";
import {
  companyColor,
  companyInitials,
  relativeDay,
  relativeTime,
} from "@/utils";

/** Hình dạng lương thô mà backend trả về, dùng chung cho cả hai đường vào. */
type RawSalary = Pick<
  JobMatchWithJob["job"],
  "salaryMin" | "salaryMax" | "currency"
>;

/** Hai mốc thời gian backend trả về cho mọi tin. */
type RawTiming = Pick<JobMatchWithJob["job"], "postedAt" | "scrapedAt">;

/**
 * Chọn mốc thời gian để hiển thị, và nói rõ đó là mốc gì.
 *
 * Ưu tiên ngày đăng vì đó là thứ người tìm việc cần biết. Chỉ khi portal không
 * cho biết — TopCV không bao giờ trả trường này — mới rơi về ngày thu thập, và
 * lúc đó phải mang nhãn "thu thập" chứ không được đội lốt ngày đăng.
 */
export function toJobTimestamp(job: RawTiming): JobTimestamp {
  if (job.postedAt) {
    return {
      label: relativeDay(job.postedAt),
      source: "posted",
      at: job.postedAt,
    };
  }
  return {
    label: relativeTime(job.scrapedAt),
    source: "scraped",
    at: job.scrapedAt,
  };
}

const isCurrency = (value: string | null): value is SalaryCurrency =>
  value === "VND" || value === "USD";

/**
 * Chỉ dựng khoảng lương khi backend có ĐỦ min, max và một đơn vị tiền tệ nhận
 * ra được. Thiếu bất kỳ mảnh nào thì trả null và để `salaryRaw` nói thay —
 * xem `formatJobSalary`.
 */
export function toSalaryRange(job: RawSalary): SalaryRange | null {
  // Kiểm tra ngay trong biểu thức chứ không qua một biến boolean trung gian:
  // TypeScript không thu hẹp kiểu xuyên qua biến như vậy, và job.salaryMin sẽ
  // vẫn là `number | null` ở chỗ dùng.
  return job.salaryMin !== null &&
    job.salaryMax !== null &&
    isCurrency(job.currency)
    ? {
        min: job.salaryMin,
        max: job.salaryMax,
        currency: job.currency,
        period: "month" as const,
      }
    : null;
}

/** Phần dùng chung của hai bộ chuyển đổi — mọi thứ trừ điểm phù hợp. */
function toCardBase(
  job: JobMatchWithJob["job"],
): Omit<Job, "aiMatch" | "systemMatch" | "hasAiScore"> {
  return {
    id: job.id,
    company: job.company,
    companyInitials: companyInitials(job.company),
    companyColor: companyColor(job.company),
    companyLogo: job.companyLogo,
    title: job.title,
    location: job.location ?? "Không rõ",
    salary: toSalaryRange(job),
    salaryRaw: job.salaryRaw,
    // Bỏ tag trùng: portal trả về những tin có "AI" hoặc "Cloud Architecture"
    // hai lần, và thẻ dùng chính chuỗi tag làm `key` của React nên trùng là
    // React cảnh báo rồi bỏ bớt phần tử.
    tags: [...new Set(job.tags)],
    postedAt: toJobTimestamp(job),
    saved: job.saved,
  };
}

/** Chuyển một kết quả chấm điểm của backend thành thẻ công việc của giao diện. */
export function toJobCard(match: JobMatchWithJob): Job {
  return {
    ...toCardBase(match.job),
    // Giữ nguyên null: bản ghi đang chạy dở chưa có điểm, và trên thẻ thì
    // "chưa chấm" phải đọc khác hẳn "0%".
    aiMatch: match.overallScore,
    systemMatch: null,
    hasAiScore: match.status === "DONE",
  };
}

/**
 * Chuyển một tin THÔ từ `GET /jobs` — tin chưa hề đi qua khâu chấm điểm.
 *
 * `aiMatch` luôn null ở đây, và đó là sự thật chứ không phải giá trị mặc định:
 * endpoint này không biết gì về hồ sơ người dùng.
 */
export function toJobCardFromRecord(job: JobListItem): Job {
  return {
    ...toCardBase(job),
    aiMatch: null,
    systemMatch: job.systemMatch
      ? {
          kind: job.systemMatch.kind,
          met: job.systemMatch.met,
          total: job.systemMatch.total,
        }
      : null,
    hasAiScore: job.match?.status === "DONE",
  };
}
