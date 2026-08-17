import type { AiFailureKind } from "@/lib/failure-message";
import { api } from "@/lib/axios";
import type { WorkStatus } from "./types";

/**
 * Một mẩu bằng chứng đã thu, khớp `server/src/modules/profile-sources/evidence.ts`.
 */
export interface EvidenceRecord {
  kind:
    | "CV_PDF_TEXT"
    | "CV_PDF_VISION"
    | "GITHUB"
    | "LINKEDIN_EXPORT"
    | "MANUAL";
  label: string;
  text: string;
  meta: Record<string, string | number | boolean>;
}

/** Một dòng kinh nghiệm trong đề xuất. Chưa có `id` — id sinh khi áp dụng. */
export interface ProposedExperience {
  company: string;
  position: string;
  period: string;
  location?: string;
  highlights: string[];
}

export interface ProposedEducation {
  school: string;
  degree: string;
  field: string;
  period?: string;
  gpa?: string;
}

export interface ProposedCertificate {
  name: string;
  issuer?: string;
  year?: string;
}

export interface ProposedProject {
  name: string;
  description: string;
  technologies: string[];
  period?: string;
}

export interface ProfileProposal {
  headline?: string;
  location?: string;
  country?: string;
  summary?: string;
  languages: string[];
  primarySkills: string[];
  secondarySkills: string[];
  directExperienceDomains: string[];
  adjacentExperience: string[];
  experiences: ProposedExperience[];
  educations: ProposedEducation[];
  certificates: ProposedCertificate[];
  projects: ProposedProject[];
  missing: string[];
  notes: string[];
}

export interface ProfileDraftRecord {
  id: string;
  status: WorkStatus;
  evidence: EvidenceRecord[] | null;
  proposal: ProfileProposal | null;
  filename: string | null;
  storageKey: string | null;
  modelId: string | null;
  generatedAt: string | null;
  appliedAt: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileDraftSummary {
  id: string;
  status: WorkStatus;
  filename: string | null;
  createdAt: string;
  generatedAt: string | null;
  appliedAt: string | null;
  failureKind: AiFailureKind | null;
}

export interface CvUploadReceipt {
  draftId: string;
  queued: boolean;
  extracted: Array<Record<string, string | number | boolean>>;
}

export const profileDraftService = {
  uploadCv: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<CvUploadReceipt>("/profile-drafts/cv", form, {
        headers: { "Content-Type": undefined },
      })
      .then((r) => r.data);
  },

  latest: () =>
    api.get<ProfileDraftRecord>("/profile-drafts/latest").then((r) => r.data),

  get: (id: string) =>
    api.get<ProfileDraftRecord>(`/profile-drafts/${id}`).then((r) => r.data),

  history: () =>
    api.get<ProfileDraftSummary[]>("/profile-drafts/history").then((r) => r.data),

  /** Link mở CV gốc trong tab mới. Cookie `sameSite: lax` nên thẻ `<a>` là đủ. */
  fileUrl: (id: string) => `${api.defaults.baseURL}/profile-drafts/${id}/file`,

  apply: (id: string, fields: string[]) =>
    api
      .put<ProfileDraftRecord>(`/profile-drafts/${id}/apply`, { fields })
      .then((r) => r.data),
};
