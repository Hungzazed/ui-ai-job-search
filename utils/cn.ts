import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Ghép class Tailwind và để lớp sau thắng lớp trước.
 *
 * `clsx` lo phần điều kiện, `twMerge` lo phần xung đột: không có nó thì
 * `cn("p-4", "p-6")` giữ cả hai và trình duyệt chọn theo thứ tự trong file CSS
 * chứ không theo thứ tự ta viết.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
