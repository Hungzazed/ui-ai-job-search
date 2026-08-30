import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { SalaryList, salaryPositionCount } from "@/components/salary/salary-list";

export const metadata: Metadata = {
  title: "Tra cứu lương",
};

export default async function DashboardSalaryPage() {
  const count = await salaryPositionCount();

  return (
    <>
      <PageHeader
        title="Tra cứu lương"
        subtitle={`Khoảng lương phổ biến của ${count} vị trí, phân tách theo số năm kinh nghiệm`}
      />
      <SalaryList basePath="/dashboard/salary" />
    </>
  );
}
