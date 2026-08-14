import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { QueuedDocument, WorkStatus } from "./types";

/**
 * Đổi một lỗi có thân là Blob thành lỗi mà `apiErrorMessage` đọc được.
 *
 * Khi request dùng `responseType: "blob"`, axios trả **cả thân lỗi** dưới dạng Blob,
 * nên `error.response.data.message` là `undefined` và giao diện hiện câu mặc định
 * thay vì câu backend đã soạn ("Quá thời gian khi tạo PDF...", "Máy chủ chưa có bộ
 * công cụ LaTeX..."). Đọc Blob ra chữ rồi gắn lại `data` đã parse để phần còn lại
 * của giao diện không phải biết gì về chuyện này.
 */
async function blobErrorToError(error: unknown): Promise<unknown> {
  if (!(error instanceof AxiosError)) return error;

  const data: unknown = error.response?.data;
  if (!(data instanceof Blob)) return error;

  try {
    const text = await data.text();
    if (error.response) error.response.data = JSON.parse(text);
  } catch {
    // Thân lỗi không phải JSON: để nguyên, `apiErrorMessage` sẽ dùng câu mặc định.
  }
  return error;
}

export type DocumentKind = "CV" | "COVER_LETTER" | "FORM_ANSWER";

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
  list: (kind?: DocumentKind) =>
    api
      .get<DocumentRecord[]>("/documents", { params: kind ? { kind } : undefined })
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
