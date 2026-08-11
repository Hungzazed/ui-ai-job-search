import type {
  Application,
  ApplicationGroup,
  ApplicationList,
  ApplicationStatus,
} from "@/types";
import { api } from "@/lib/axios";

export const applicationsService = {
  /**
   * Lọc ở backend chứ đừng lọc mảng đã tải: `counts` phải là tổng thật trên
   * toàn bộ đơn, không phải đếm lại sau khi đã lọc theo chính tab đang mở.
   */
  list: (group?: ApplicationGroup) =>
    api
      .get<ApplicationList>("/applications", {
        params: group ? { group } : undefined,
      })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<Application>(`/applications/${id}`).then((r) => r.data),

  /**
   * Backend từ chối nếu công việc chưa được chấm điểm, hoặc chấm ra
   * eligibility = FAIL. Tạo xong thì CV và thư xin việc tự vào hàng đợi.
   */
  create: (jobId: string) =>
    api.post<Application>("/applications", { jobId }).then((r) => r.data),

  /**
   * Backend chặn hai trạng thái HIRED và OFFER_DECLINED nếu đơn chưa từng ở
   * OFFER, và chặn mọi nguồn tự động đặt hai trạng thái đó. Chuyển sang
   * INTERVIEW sẽ tự xếp hàng đợi chuẩn bị phỏng vấn.
   */
  updateStatus: (id: string, status: ApplicationStatus, note?: string) =>
    api
      .patch<Application>(`/applications/${id}/status`, { status, note })
      .then((r) => r.data),
};
