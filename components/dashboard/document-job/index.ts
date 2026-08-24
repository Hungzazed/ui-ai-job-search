/**
 * Bộ khối dùng chung cho hai trang tài liệu (Tối ưu CV và Thư xin việc).
 *
 * Cả hai trang có cùng một vòng đời: bấm nút → xếp hàng → hỏi lại trạng thái →
 * hiện kết quả hoặc lý do hỏng. Chỉ phần hiển thị NỘI DUNG là khác nhau, nên
 * mọi thứ còn lại nằm ở đây.
 */
export { DocumentHistory } from "./document-history";
export {
  documentSubtitle,
  UNREADABLE_CONTENT_MESSAGE,
} from "./document-meta";
export { JobSelect, JobSelectCard } from "./job-select-card";
export { DocumentJobStatus } from "./document-job-status";
export { DocumentSource } from "./document-source";
export { DocumentStatusBadge } from "./document-status-badge";
export { useDocumentJob } from "./use-document-job";
export {
  upsertDocument,
  type DocumentJob,
  type DocumentJobPhase,
} from "./document-job.types";
