import { Suspense } from "react";
import type { Metadata } from "next";
import { ApplySkeleton } from "./apply-skeleton";
import { ApplyView } from "./apply-view";

// Giữ trang này là server component chỉ để khai metadata — Next không cho
// export metadata từ client component. Toàn bộ phần tải dữ liệu nằm ở ApplyView.
export const metadata: Metadata = { title: "Ứng tuyển — AI Career Agent" };

export default function ApplyPage() {
  return (
    // ApplyView đọc `?job=` bằng useSearchParams, và Next bắt buộc mọi thứ đọc
    // tham số truy vấn phải nằm dưới một ranh giới Suspense, nếu không cả trang
    // rơi khỏi render tĩnh lúc build.
    <Suspense
      fallback={<ApplySkeleton withGrid={false} />}
    >
      <ApplyView />
    </Suspense>
  );
}
