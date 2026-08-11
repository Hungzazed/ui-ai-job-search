import type { Metadata } from "next";
import { ProfileView } from "./profile-view";

// Giữ trang này là server component chỉ để khai metadata — Next không cho
// export metadata từ client component. Toàn bộ phần tải dữ liệu nằm ở ProfileView.
export const metadata: Metadata = { title: "Hồ sơ của tôi — AI Career Agent" };

export default function ProfilePage() {
  return <ProfileView />;
}
