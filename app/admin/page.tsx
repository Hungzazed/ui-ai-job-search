import type { Metadata } from "next";
import { AdminView } from "./admin-view";

// Giữ trang này là server component chỉ để khai metadata — Next không cho
// export metadata từ client component. Toàn bộ phần tải dữ liệu nằm ở AdminView.
export const metadata: Metadata = {
  title: "Sức khoẻ AI Gateway — AI Career Agent",
};

export default function AdminPage() {
  return <AdminView />;
}
