import type { Metadata } from "next";
import { UploadCvView } from "./upload-view";

// Server component chỉ để khai metadata — Next không cho export metadata từ client
// component. Toàn bộ phần tải dữ liệu nằm ở UploadCvView.
export const metadata: Metadata = {
  title: "Đọc hồ sơ từ CV — AI Career Agent",
};

export default function UploadCvPage() {
  return <UploadCvView />;
}
