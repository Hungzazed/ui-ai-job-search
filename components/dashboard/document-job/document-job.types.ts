import { type DocumentRecord, type QueuedDocument } from "@/services";


export type DocumentJobPhase =
  | "idle"
  | "generating"
  | "done"
  | "failed"
  | "timeout";

export interface DocumentJob {
  phase: DocumentJobPhase;
  /** Bản ghi mới nhất đọc được; null khi chưa kịp đọc lần nào. */
  document: DocumentRecord | null;
  error: string | null;
  /** Gọi đường GHI rồi bám theo biên nhận `{queued, documentId}` trả về. */
  start: (create: () => Promise<QueuedDocument>) => void;
  /** Mở lại một tài liệu đã có; nếu nó còn đang chạy thì cũng bám theo. */
  open: (documentId: string) => void;
  /** Đọc lại từ đầu mà không sinh tài liệu mới. Dùng sau khi hết hạn chờ. */
  recheck: () => void;
}

/**
 * Ghép bản ghi vừa đọc được vào danh sách lịch sử.
 *
 * Tài liệu đã tồn tại trong database ngay lúc bấm nút (trạng thái PENDING), nên
 * cập nhật tại chỗ thay vì gọi lại `list()` sau mỗi lần hỏi — cùng dữ liệu, ít
 * hơn một request mỗi 4 giây.
 */
export function upsertDocument(
  documents: DocumentRecord[],
  record: DocumentRecord,
): DocumentRecord[] {
  const index = documents.findIndex((item) => item.id === record.id);
  if (index === -1) return [record, ...documents];
  const next = [...documents];
  next[index] = record;
  return next;
}
