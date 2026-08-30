import type { Metadata } from "next";
import { SalaryList, salaryPositionCount } from "@/components/salary/salary-list";

export const metadata: Metadata = {
  title: "Tra cứu mức lương theo vị trí và ngành nghề",
  description:
    "Tra cứu khoảng lương phổ biến và mức lương trung bình theo từng vị trí công việc, phân tách theo số năm kinh nghiệm.",
};

/**
 * Lối vào CÔNG KHAI, nằm ngoài `/dashboard` một cách cố ý: `middleware.ts` chỉ
 * chặn `/dashboard` và `/admin`, nên đây là đường duy nhất để Google đọc được.
 * Người đã đăng nhập đi vào cùng nội dung này qua `/dashboard/salary`.
 */
export default async function SalaryPage() {
  const count = await salaryPositionCount();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Tra cứu mức lương
        </h1>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Khoảng lương phổ biến của {count} vị trí công việc, phân tách theo số năm
          kinh nghiệm.
        </p>
      </header>

      <SalaryList basePath="/salary" />
    </main>
  );
}
