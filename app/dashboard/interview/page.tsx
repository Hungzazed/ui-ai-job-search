import type { Metadata } from "next";
import { InterviewView } from "./interview-view";

export const metadata: Metadata = {
  title: "Chuẩn bị phỏng vấn",
};

// Giữ trang này là server component chỉ để khai metadata; toàn bộ việc tải dữ
// liệu nằm ở client component bên dưới vì mọi endpoint đều cần cookie của người
// dùng và không có gì cache được giữa các người dùng.
export default function InterviewPage() {
  return <InterviewView />;
}
