import { api } from "@/lib/axios";

/**
 * Các trường này thay thế trực tiếp placeholder trong file skill
 * (`[YOUR_PRIMARY_SKILLS]`, `[YOUR_CAREER_GOAL_1]`...), nên hồ sơ càng đầy thì
 * kết quả chấm điểm càng đáng tin. `completion` do backend tự tính.
 */
export interface ProfileRecord {
  id: string;
  userId: string;
  completion: number;
  headline: string | null;
  summary: string | null;
  location: string | null;
  country: string | null;
  citizenship: string | null;
  workPermit: string | null;
  employmentStatus: string | null;
  remotePreference: string | null;
  commuteConstraint: string | null;
  willingToRelocate: boolean;
  languages: string[];
  primarySkills: string[];
  secondarySkills: string[];
  lackingSkills: string[];
  directExperienceDomains: string[];
  adjacentExperience: string[];
  careerGoals: string[];
  energizingTasks: string[];
  drainingTasks: string[];
  targetSectors: string[];
  dealBreakers: string[];
  experiences: unknown;
  educations: unknown;
  behavioralTraits: unknown;
  createdAt: string;
  updatedAt: string;
}

export const profileService = {
  get: () => api.get<ProfileRecord>("/profile").then((r) => r.data),

  /** PATCH: chỉ gửi những trường muốn đổi, phần còn lại giữ nguyên. */
  update: (input: Partial<Omit<ProfileRecord, "id" | "userId" | "completion" | "createdAt" | "updatedAt">>) =>
    api.patch<ProfileRecord>("/profile", input).then((r) => r.data),
};
