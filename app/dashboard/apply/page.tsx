import type { Metadata } from "next";
import { ApplyView } from "./apply-view";

// Server component chỉ để khai metadata; phần tải dữ liệu nằm ở ApplyView.
export const metadata: Metadata = { title: "Ứng tuyển tự động — Careelot" };

export default function ApplyPage() {
  return <ApplyView />;
}
