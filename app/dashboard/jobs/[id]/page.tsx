import type { Metadata } from "next";
import { JobDetailView } from "./job-detail-view";

// Giữ trang này là server component chỉ để khai metadata — Next không cho
// export metadata từ client component. Toàn bộ phần tải dữ liệu nằm ở
// JobDetailView.
export const metadata: Metadata = {
  title: "Chi tiết việc làm — AI Career Agent",
};

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  return <JobDetailView jobId={id} />;
}
