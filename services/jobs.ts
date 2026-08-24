import type { JobMatchWithJob } from "@/types";
import { api } from "@/lib/axios";
import type { Paginated, QueuedResult, WorkStatus } from "./types";

export interface JobMatchState {
  status: WorkStatus;
  overallScore: number | null;
  verdict: JobMatchWithJob["verdict"];
}

export interface RequirementCheck {
  label: string;
  kind: "SKILL" | "NICE" | "YEARS" | "ELIGIBILITY" | "LOCATION";
  /** `null` = hồ sơ thiếu dữ liệu để kết luận, không tính vào mẫu số. */
  met: boolean | null;
  note?: string;
  /** Khớp được nhờ danh bạ từ tương đương, không nhờ trùng chữ. */
  via?: string;
}

/**
 * Đối chiếu hồ sơ với yêu cầu của tin. `score` là tỉ lệ khớp có trọng số
 * (bắt buộc 1, ưu tiên 0,5) và chính là con số lọc trang "Việc làm phù hợp".
 *
 * Chỉ có nghĩa khi `kind` là `REQUIREMENTS`; nhánh `KEYWORDS` luôn trả 0.
 */
export interface SystemMatch {
  /** `KEYWORDS` khi tin chưa được rút trích yêu cầu. */
  kind: "REQUIREMENTS" | "KEYWORDS";
  met: number;
  total: number;
  score: number;
  eligibility: "PASS" | "FAIL" | "UNVERIFIED";
  checks: RequirementCheck[];
}

/**
 * Một tin trong DANH SÁCH. Không có `description`: nó có trần 60KB và không thẻ
 * việc làm nào hiển thị nó, nên backend cố ý không trả về ở danh sách.
 */
export type JobListItem = JobMatchWithJob["job"] & {
  source: string;
  workMode: string | null;
  match: JobMatchState | null;
  systemMatch: SystemMatch | null;
};

/** Một tin ở màn CHI TIẾT. Chỉ `GET /jobs/:id` trả về dạng đầy đủ này. */
export type JobRecord = JobListItem & { description: string };

/** Ba cách sắp xếp, khớp với `JOB_SORTS` của backend. */
export type JobSort = "newest" | "salary" | "match";

/** Tham số của thanh bộ lọc. Mảng rỗng nghĩa là không lọc theo chiều đó. */
export interface JobListParams {
  limit?: number;
  offset?: number;
  q?: string;
  province?: string[];
  occupation?: string[];
  workMode?: string[];
  salaryMin?: number;
  postedWithin?: number;
  sort?: JobSort;
  /** Chỉ tin đã có đánh giá AI. */
  scored?: boolean;
}

/** Một mục trong menu lọc, kèm số tin đang có. */
export interface FilterOption {
  code: string;
  name: string;
  count: number;
}

export interface JobFilters {
  provinces: FilterOption[];
  occupations: FilterOption[];
  remote: FilterOption;
}

export interface CreateJobInput {
  title: string;
  company: string;
  /** Backend từ chối mô tả dưới 20 ký tự: quá ngắn để chấm điểm. */
  description: string;
  url?: string;
  source?: string;
  externalId?: string;
  companyLogo?: string;
  location?: string;
  workMode?: string;
  salaryRaw?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  tags?: string[];
}

export const jobsService = {
  list: (params?: JobListParams) =>
    api.get<Paginated<JobListItem>>("/jobs", { params }).then((r) => r.data),

  /** Danh mục tỉnh/thành và ngành nghề kèm số tin, để dựng menu lọc. */
  filters: () => api.get<JobFilters>("/jobs/filters").then((r) => r.data),

  listSaved: (page?: { limit?: number; offset?: number }) =>
    api
      .get<Paginated<JobListItem>>("/jobs/saved", { params: page })
      .then((r) => r.data),

  get: (id: string) => api.get<JobRecord>(`/jobs/${id}`).then((r) => r.data),

  save: (id: string) =>
    api.post<{ saved: true }>(`/jobs/${id}/save`).then((r) => r.data),

  unsave: (id: string) =>
    api.delete<{ saved: false }>(`/jobs/${id}/save`).then((r) => r.data),

  create: (input: CreateJobInput) =>
    api
      .post<{ job: JobRecord } & QueuedResult>("/jobs", input)
      .then((r) => r.data),
};
