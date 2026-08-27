import { Suspense } from "react";
import type { Metadata } from "next";
import { CvOptimizerView } from "./cv-optimizer-view";

// Giữ trang này là server component chỉ để khai metadata — Next không cho
// export metadata từ client component. Toàn bộ phần tải dữ liệu nằm ở
// CvOptimizerView.
export const metadata: Metadata = { title: "Tối ưu CV — Careelot" };

export default function CvOptimizerPage() {
  // useSearchParams cần Suspense, nếu không `next build` dừng ở bước prerender.
  return (
    <Suspense>
      <CvOptimizerView />
    </Suspense>
  );
}
