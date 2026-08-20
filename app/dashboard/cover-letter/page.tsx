import { Suspense } from "react";
import type { Metadata } from "next";
import { CoverLetterView } from "./cover-letter-view";

// Giữ trang này là server component chỉ để khai metadata — Next không cho
// export metadata từ client component. Toàn bộ phần tải dữ liệu nằm ở
// CoverLetterView.
export const metadata: Metadata = { title: "Thư xin việc — AI Career Agent" };

export default function CoverLetterPage() {
  // useSearchParams cần Suspense, nếu không `next build` dừng ở bước prerender.
  return (
    <Suspense>
      <CoverLetterView />
    </Suspense>
  );
}
