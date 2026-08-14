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

/**
 * Hồ sơ do model ĐỀ XUẤT — chưa phải hồ sơ thật.
 *
 * Khớp `profileProposalSchema` ở backend. Cố ý KHÔNG có `citizenship`,
 * `workPermit`, `careerGoals`, `energizingTasks`, `drainingTasks`,
 * `targetSectors`, `dealBreakers`, `lackingSkills`, `remotePreference`,
 * `willingToRelocate`: model bị cấm đoán những trường đó, vì chúng là sở thích và
 * tình trạng pháp lý. Người dùng tự điền ở màn Hồ sơ.
 *
 * Đừng thêm chúng vào đây "cho đủ" — danh sách trắng ở backend sẽ chặn, nên thêm
 * vào chỉ tạo ra một ô tích không bao giờ có tác dụng.
 */
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
  /** Những gì model KHÔNG tìm thấy — phần trung thực nhất của đề xuất. */
  missing: string[];
  /** Ghi chú của model về cách nó đọc bằng chứng. */
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
  /** null nghĩa là CHƯA áp dụng vào hồ sơ. */
  appliedAt: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
  updatedAt: string;
}

/** Bản rút gọn ở danh sách lịch sử — KHÔNG có `evidence` và `proposal`. */
export interface ProfileDraftSummary {
  id: string;
  status: WorkStatus;
  filename: string | null;
  createdAt: string;
  generatedAt: string | null;
  appliedAt: string | null;
  failureKind: AiFailureKind | null;
}

/** Biên nhận sau khi nộp CV. `extracted` là `meta` của từng mẩu bằng chứng. */
export interface CvUploadReceipt {
  draftId: string;
  queued: boolean;
  extracted: Array<Record<string, string | number | boolean>>;
}

export const profileDraftService = {
  /**
   * Nộp CV PDF.
   *
   * KHÔNG đặt `Content-Type` bằng tay: axios tự sinh header
   * `multipart/form-data; boundary=...` từ `FormData`, và ghi đè nó bằng chuỗi
   * không có boundary sẽ làm multer ở backend không parse được — lỗi hiện ra thành
   * "chưa có file nào được nộp", nên rất dễ đi truy sai chỗ.
   *
   * `undefined` ở đây là để **xoá** header mặc định `application/json` mà instance
   * axios dùng chung đang đặt.
   */
  uploadCv: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<CvUploadReceipt>("/profile-drafts/cv", form, {
        headers: { "Content-Type": undefined },
      })
      .then((r) => r.data);
  },

  /** Lượt đọc mới nhất, kể cả đang chạy hoặc đã hỏng. 404 khi chưa từng nộp. */
  latest: () =>
    api.get<ProfileDraftRecord>("/profile-drafts/latest").then((r) => r.data),

  get: (id: string) =>
    api.get<ProfileDraftRecord>(`/profile-drafts/${id}`).then((r) => r.data),

  history: () =>
    api.get<ProfileDraftSummary[]>("/profile-drafts/history").then((r) => r.data),

  /**
   * ĐƯỜNG GHI. Áp dụng đúng những trường người dùng đã tích vào hồ sơ thật.
   *
   * `fields` không được rỗng — backend trả 400. Đó là chủ đích: mảng rỗng gần như
   * luôn là bug ở giao diện, và nếu chấp nhận thì bản nháp bị đánh dấu "đã áp dụng"
   * mà hồ sơ không đổi gì.
   */
  apply: (id: string, fields: string[]) =>
    api
      .put<ProfileDraftRecord>(`/profile-drafts/${id}/apply`, { fields })
      .then((r) => r.data),
};
