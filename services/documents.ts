import { api } from "@/lib/axios";
import { blobErrorToError, textErrorToError } from "./blob-error";
import type { Paginated, QueuedDocument, WorkStatus } from "./types";

export type DocumentKind =
  | "CV"
  | "COVER_LETTER"
  | "APPLICATION_EMAIL"
  | "FORM_ANSWER";

/**
 * Nguồn tin tuyển dụng cho mail ứng tuyển: một tin đã có trong hệ thống, hoặc
 * một JD dán tay. Backend từ chối nếu gửi nửa vời (có JD nhưng thiếu công ty).
 */
export type ApplicationEmailInput =
  | { jobId: string }
  | { jobDescription: string; company: string; title: string };

/**
 * Nội dung CV gửi lên để LƯU. Khác `CvContent` trong `lib/document-content`: bên
 * đó dùng `string | null` để hiển thị an toàn, còn ở đây backend từ chối `null`.
 */
export interface CvContentInput {
  profileStatement: string;
  coreCompetencies: string[];
  experiences: Array<{
    position: string;
    company: string;
    location: string;
    period: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    role: string;
    organization: string;
    period: string;
    description: string;
    bullets: string[];
    tools: string[];
  }>;
  educations: Array<{
    degree: string;
    institution: string;
    period: string;
    detail: string;
  }>;
  skillGroups: Array<{ label: string; items: string[] }>;
}

/** Khoá của sáu mục CV. Phải khớp `SECTION_KEYS` phía backend. */
export type CvSectionKey =
  | "profile"
  | "competencies"
  | "experience"
  | "projects"
  | "education"
  | "skills";

/** Thứ tự mục và mục bị ẩn. Tách khỏi nội dung. */
export interface CvLayout {
  order: CvSectionKey[];
  hidden: CvSectionKey[];
}

/** Một mẫu CV trong kho chọn mẫu. */
export interface CvTemplate {
  id: string;
  name: string;
  description: string;
  style: "don-gian" | "chuyen-nghiep" | "hien-dai";
  accent: string;
  /** Mẫu đen trắng thì `false`, và giao diện phải ẩn bảng chọn màu đi. */
  usesAccent: boolean;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  jobId: string | null;
  kind: DocumentKind;
  status: WorkStatus;
  title: string;
  /** Nội dung có cấu trúc do model sinh; bản .tex chỉ là một cách trình bày. */
  content: unknown;
  storageKey: string | null;
  /** Mẫu trình bày đang chọn. Chỉ có nghĩa với CV. */
  templateId: string;
  /** Tuỳ chọn của mẫu, hiện chỉ có `{ accent }`. */
  templateOptions: { accent?: string } | null;
  /** Thứ tự mục và mục ẩn. `null` nghĩa là chưa đụng tới. */
  layout: CvLayout | null;
  modelId: string | null;
  generatedAt: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export const documentsService = {
  list: (
    kind?: DocumentKind,
    jobId?: string,
    page?: { limit?: number; offset?: number },
  ) =>
    api
      .get<Paginated<DocumentRecord>>("/documents", {
        params: {
          ...(kind ? { kind } : {}),
          ...(jobId ? { jobId } : {}),
          ...page,
        },
      })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<DocumentRecord>(`/documents/${id}`).then((r) => r.data),

  /** File .tex thô, trả về text/plain chứ không phải JSON. */
  source: async (id: string) => {
    try {
      const response = await api.get<string>(`/documents/${id}/source`, {
        responseType: "text",
      });
      return response.data;
    } catch (error) {
      throw textErrorToError(error);
    }
  },

  /**
   * Compile ra PDF rồi trả về bytes. Mất khoảng 5 giây — đã đo.
   *
   * `responseType: "blob"` là BẮT BUỘC: mặc định axios cố parse phản hồi thành
   * JSON, và với dữ liệu nhị phân thì nó làm hỏng bytes trước khi ta chạm tới.
   *
   * Backend trả 422 kèm câu tiếng Việt khi tài liệu không compile được. Với
   * `responseType: "blob"`, thân phản hồi lỗi CŨNG là Blob, nên `apiErrorMessage`
   * không đọc ra được câu đó — vì vậy phải đọc Blob thành chữ ở đây.
   */
  pdf: async (id: string, engine?: "latex" | "html"): Promise<Blob> => {
    try {
      const response = await api.get<Blob>(`/documents/${id}/pdf`, {
        params: engine ? { engine } : undefined,
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw await blobErrorToError(error);
    }
  },

  /** Không có jobId thì sinh CV tổng quát; có thì sinh CV theo vị trí. */
  createCv: (jobId?: string, stream = false) =>
    api
      .post<QueuedDocument>("/documents/cv", { jobId, stream })
      .then((r) => r.data),

  createCoverLetter: (jobId: string, stream = false) =>
    api
      .post<QueuedDocument>("/documents/cover-letter", { jobId, stream })
      .then((r) => r.data),

  /**
   * Mail ứng tuyển gửi thẳng cho nhà tuyển dụng.
   *
   * JD dán tay KHÔNG được lưu thành tin tuyển dụng: kho việc làm là của chung,
   * nên tin dán tay sẽ hiện trong danh sách của mọi người dùng khác.
   */
  createApplicationEmail: (input: ApplicationEmailInput) =>
    api
      .post<QueuedDocument>("/documents/application-email", input)
      .then((r) => r.data),

  /**
   * Câu trả lời cho ô văn bản tự do trên form ứng tuyển của portal.
   * `question` phải từ 5 ký tự trở lên, `characterLimit` trong khoảng 20-5000.
   */
  createFormAnswer: (input: {
    question: string;
    jobId?: string;
    characterLimit?: number;
  }) =>
    api.post<QueuedDocument>("/documents/form-answer", input).then((r) => r.data),

  /** Danh mục mẫu CV. Là hằng số phía backend nên gọi một lần là đủ. */
  cvTemplates: () =>
    api
      .get<{ items: CvTemplate[] }>("/documents/cv-templates")
      .then((r) => r.data.items),

  /**
   * Bản HTML của CV để nhúng vào khung xem trước. Truyền `templateId` để xem thử
   * mà KHÔNG lưu. `responseType: "text"` bắt buộc, nếu không axios cố parse JSON.
   */
  previewHtml: async (
    id: string,
    override?: { templateId?: string; accent?: string },
  ) => {
    try {
      const response = await api.get<string>(`/documents/${id}/preview`, {
        params: override,
        responseType: "text",
      });
      return response.data;
    } catch (error) {
      throw textErrorToError(error);
    }
  },

  /**
   * Xem trước bản nháp CHƯA lưu. Thiếu trường nào thì backend lấy bản đã lưu cho
   * trường đó. POST vì nội dung CV không nhét vừa query string, nhưng KHÔNG ghi gì.
   */
  previewDraft: async (
    id: string,
    draft: {
      content?: CvContentInput;
      layout?: CvLayout;
      templateId?: string;
      accent?: string;
    },
  ) => {
    try {
      const response = await api.post<string>(
        `/documents/${id}/preview`,
        draft,
        { responseType: "text" },
      );
      return response.data;
    } catch (error) {
      throw textErrorToError(error);
    }
  },

  /** Lưu bản CV người dùng đã sửa. KHÔNG tốn lượt gọi model. */
  updateCv: (id: string, input: { content?: CvContentInput; layout?: CvLayout }) =>
    api.put<DocumentRecord>(`/documents/${id}/cv`, input).then((r) => r.data),

  /** Lưu mẫu đã chọn. KHÔNG tốn lượt gọi model. */
  setTemplate: (id: string, templateId: string, accent?: string) =>
    api
      .put<DocumentRecord>(`/documents/${id}/template`, { templateId, accent })
      .then((r) => r.data),

  /** Chạy ngay một tài liệu đã tạo. Dùng để thử nghiệm, mất vài chục giây. */
  generateSync: (id: string) =>
    api
      .post<DocumentRecord>(`/documents/${id}/generate-sync`)
      .then((r) => r.data),
};
