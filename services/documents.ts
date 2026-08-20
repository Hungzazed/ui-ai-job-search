import { api } from "@/lib/axios";
import { blobErrorToError } from "./blob-error";
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
  source: (id: string) =>
    api
      .get<string>(`/documents/${id}/source`, { responseType: "text" })
      .then((r) => r.data),

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
  pdf: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get<Blob>(`/documents/${id}/pdf`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw await blobErrorToError(error);
    }
  },

  /** Không có jobId thì sinh CV tổng quát; có thì sinh CV theo vị trí. */
  createCv: (jobId?: string) =>
    api.post<QueuedDocument>("/documents/cv", { jobId }).then((r) => r.data),

  createCoverLetter: (jobId: string) =>
    api
      .post<QueuedDocument>("/documents/cover-letter", { jobId })
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

  /** Chạy ngay một tài liệu đã tạo. Dùng để thử nghiệm, mất vài chục giây. */
  generateSync: (id: string) =>
    api
      .post<DocumentRecord>(`/documents/${id}/generate-sync`)
      .then((r) => r.data),
};
