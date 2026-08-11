/**
 * Một cửa duy nhất cho mọi hàm thuần tuý dùng chung ở giao diện.
 *
 * Quy tắc chia file: mỗi file lo đúng một loại dữ liệu (tiền lương, ngày tháng,
 * điểm số...). Component không tự viết lại cách định dạng — mọi chỗ hiện cùng
 * một loại dữ liệu phải đọc giống hệt nhau, và cách rẻ nhất để giữ được điều đó
 * là chỉ có một chỗ viết ra nó.
 */
export { cn } from "./cn";
export { companyColor, companyInitials, personInitials } from "./company";
export { formatDate, formatDateTime, relativeDay, relativeTime } from "./date";
export { formatCount, formatDuration } from "./duration";
export { formatJobSalary, formatSalary } from "./salary";
export {
  matchTone,
  matchToneClasses,
  scoreBarClass,
  successRateTone,
  type ScoreTone,
  type ToneClasses,
} from "./score";
export { isJsonText, joinList, parseList, toJsonText } from "./text";
