import { salaryService } from "@/services/salary";
import { SalaryBrowser } from "./salary-browser";

/**
 * Phần thân của trang tra cứu lương, dùng chung cho HAI lối vào: trang công khai
 * `/salary` (để Google đọc được) và trang `/dashboard/salary` nằm trong khung
 * điều hướng. `basePath` quyết định link chi tiết trỏ về lối vào nào.
 */
export async function SalaryList({ basePath }: { basePath: string }) {
  const [occupations, positions] = await Promise.all([
    salaryService.occupations(),
    salaryService.positions(),
  ]);

  return (
    <SalaryBrowser
      occupations={occupations}
      positions={positions}
      basePath={basePath}
    />
  );
}

/** Số vị trí đang có dữ liệu, để mỗi lối vào tự viết câu mô tả của mình. */
export async function salaryPositionCount(): Promise<number> {
  return (await salaryService.positions()).length;
}
