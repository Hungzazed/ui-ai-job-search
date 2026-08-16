import { api } from "@/lib/axios";

export interface SkillRecord {
  name: string;
  description: string;
  contentHash: string;
  referenceFiles: string[];
}

export const skillsService = {
  list: () => api.get<SkillRecord[]>("/skills").then((r) => r.data),
  reload: () =>
    api.post<{ reloaded: number }>("/skills/reload").then((r) => r.data),
};
