import type { DashboardOverview } from "@/types";
import { api } from "@/lib/axios";

/**
 * Đường ĐỌC thuần: backend chỉ truy vấn database, không gọi model. Nhờ vậy mở
 * dashboard mất vài chục mili-giây và điểm số không nhảy mỗi lần tải lại trang.
 */
export const dashboardService = {
  overview: () => api.get<DashboardOverview>("/dashboard").then((r) => r.data),
};
