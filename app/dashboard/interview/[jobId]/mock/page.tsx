import type { Metadata } from "next";
import { MockInterviewView } from "./mock-view";

export const metadata: Metadata = {
  title: "Phỏng vấn thử",
};

// Server component chỉ để khai metadata và mở gói `params`; mọi việc tải dữ
// liệu nằm ở client component vì các endpoint đều cần cookie của người dùng.
export default async function MockInterviewPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <MockInterviewView jobId={jobId} />;
}
