import { api } from "@/lib/axios";

export interface ProfileRecord {
  id: string;
  userId: string;
  completion: number;
  headline: string | null;
  summary: string | null;
  location: string | null;
  phone: string | null;
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
  /** Dự án đã làm. Với hồ sơ kỹ thuật, đây mới là phần chứng minh năng lực. */
  projects: unknown;
  educations: unknown;
  certificates: unknown;
  behavioralTraits: unknown;
  createdAt: string;
  updatedAt: string;
}

export const profileService = {
  get: () => api.get<ProfileRecord>("/profile").then((r) => r.data),

  update: (input: Partial<Omit<ProfileRecord, "id" | "userId" | "completion" | "createdAt" | "updatedAt">>) =>
    api.put<ProfileRecord>("/profile", input).then((r) => r.data),
};
