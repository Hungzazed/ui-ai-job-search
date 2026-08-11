import { api } from "@/lib/axios";

export interface SkillRecord {
  name: string;
  description: string;
  /** Băm nội dung file skill. Đổi hash nghĩa là mọi kết quả chấm cũ hết hạn. */
  contentHash: string;
  referenceFiles: string[];
}

/**
 * Route vận hành, không phải chức năng người dùng.
 *
 * Backend đọc `.claude/skills/*.md` một lần lúc khởi động. Sửa file skill rồi
 * gọi `reload()` là áp dụng được ngay mà không phải khởi động lại máy chủ —
 * cũng không phải build lại giao diện, vì giao diện không hề biết nội dung
 * skill.
 */
export const skillsService = {
  list: () => api.get<SkillRecord[]>("/skills").then((r) => r.data),
  reload: () =>
    api.post<{ reloaded: number }>("/skills/reload").then((r) => r.data),
};
