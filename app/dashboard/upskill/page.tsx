import type { Metadata } from "next";
import { UpskillView } from "./upskill-view";

export const metadata: Metadata = {
  title: "Lộ trình học",
};

// Giữ trang này là server component chỉ để khai metadata; việc tải dữ liệu nằm
// ở client component vì endpoint cần cookie của người dùng.
export default function UpskillPage() {
  return <UpskillView />;
}
