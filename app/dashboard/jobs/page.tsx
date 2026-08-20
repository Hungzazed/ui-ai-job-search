import { Suspense } from "react";
import type { Metadata } from "next";
import { JobsView } from "./jobs-view";

// Giữ trang này là server component chỉ để khai metadata — Next không cho
// export metadata từ client component. Toàn bộ phần tải dữ liệu nằm ở JobsView.
export const metadata: Metadata = { title: "Việc làm phù hợp — AI Career Agent" };

export default function JobsPage() {
  // useSearchParams cần Suspense, nếu không `next build` dừng ở bước prerender.
  return (
    <Suspense>
      <JobsView />
    </Suspense>
  );
}
