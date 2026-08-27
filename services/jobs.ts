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
  
  met: boolean | null;
  note?: string;
  
  via?: string;
}
export interface SystemMatch {
  
  kind: "REQUIREMENTS" | "KEYWORDS";
  met: number;
  total: number;
  score: number;
  eligibility: "PASS" | "FAIL" | "UNVERIFIED";
  checks: RequirementCheck[];
}
export type JobListItem = JobMatchWithJob["job"] & {
  source: string;
  workMode: string | null;
  match: JobMatchState | null;
  systemMatch: SystemMatch | null;
};
export type JobMatchDetail = Omit<JobMatchWithJob, "job">;
export type JobRecord = Omit<JobListItem, "match"> & {
  description: string;
  match: JobMatchDetail | null;
};
export type JobSort = "newest" | "salary" | "match";
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
  
  scored?: boolean;
  
  saved?: boolean;
  
  applied?: boolean;
}
export interface FilterOption {
  code: string;
  name: string;
  count: number;
}
    
export interface OccupationOption extends FilterOption {
  subs?: FilterOption[];
}

export interface JobFilters {
  provinces: FilterOption[];
  occupations: OccupationOption[];
  remote: FilterOption;
}

export interface CreateJobInput {
  title: string;
  company: string;
  
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
