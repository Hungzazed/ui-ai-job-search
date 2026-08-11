import type { Metadata } from "next";
import { AllJobsView } from "./all-jobs-view";

// Giữ trang này là server component chỉ để khai metadata — Next không cho
// export metadata từ client component. Toàn bộ phần tải dữ liệu nằm ở
// AllJobsView.
//
// Đoạn tĩnh "all" được Next ưu tiên hơn đoạn động "[id]" cùng cấp, nên
// /dashboard/jobs/all vào đây chứ không rơi vào trang chi tiết công việc.
export const metadata: Metadata = {
  title: "Tất cả việc làm — AI Career Agent",
};

export default function AllJobsPage() {
  return <AllJobsView />;
}
