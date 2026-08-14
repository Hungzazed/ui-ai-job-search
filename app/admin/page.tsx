import type { Metadata } from "next";
import { AdminView } from "./admin-view";

// Giữ trang này là server component chỉ để khai metadata — Next không cho
// export metadata từ client component. Toàn bộ phần tải dữ liệu nằm ở AdminView.
export const metadata: Metadata = {
  // Khớp tiêu đề hiện trên trang: nó không chỉ còn là sức khoẻ gateway nữa mà
  // gồm cả bảng điều khiển quét tin.
  title: "Bảng điều khiển vận hành — AI Career Agent",
};

export default function AdminPage() {
  return <AdminView />;
}
