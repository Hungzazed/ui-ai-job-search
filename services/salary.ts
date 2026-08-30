export interface SalaryOccupation {
  code: string;
  name: string;
  positionCount: number;
}

export interface SalaryPositionSummary {
  positionSlug: string;
  positionName: string;
  occupationCode: string | null;
  occupationName: string | null;
  avgMonthly: number | null;
  rangeMin: number | null;
  rangeMax: number | null;
  currency: string;
}

export interface SalaryBand {
  experienceLabel: string;
  minAmount: number | null;
  avgAmount: number | null;
  maxAmount: number | null;
}

export interface SalaryPeer {
  positionSlug: string;
  positionName: string;
  avgMonthly: number | null;
  /** Hạng trong TOÀN ngành, không phải vị trí trong danh sách đã cắt. */
  rank: number;
  isCurrent: boolean;
}

export interface SalaryPositionDetail extends SalaryPositionSummary {
  provider: string;
  providerUrl: string;
  updatedAt: string;
  /** `null` khi số đến từ nguồn tham chiếu - nguồn đó không công bố cỡ mẫu. */
  sampleSize: number | null;
  bands: SalaryBand[];
  peers: SalaryPeer[];
}

/**
 * `BACKEND_URL` chứ KHÔNG phải `NEXT_PUBLIC_API_URL`.
 *
 * Biến public là `/api` - một đường dẫn TƯƠNG ĐỐI, chỉ có nghĩa trong trình duyệt
 * nơi rewrite của `next.config.ts` chuyển tiếp sang backend. Dùng nó ở server thì
 * `fetch` ném "Failed to parse URL" và cả trang thành 500.
 */
const API = `${process.env.BACKEND_URL ?? "http://localhost:4000"}/api`;

/**
 * Gọi từ SERVER COMPONENT, không qua `lib/axios`.
 *
 * Ba route lương đều công khai nên không cần cookie, và render ở server là điều
 * kiện để Google đọc được trang - đó là lý do trang này nằm ngoài `/dashboard`.
 */
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Salary API ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export const salaryService = {
  occupations: () => get<SalaryOccupation[]>("/salary/occupations"),
  positions: () => get<SalaryPositionSummary[]>("/salary/positions"),
  position: (slug: string) =>
    get<SalaryPositionDetail>(`/salary/positions/${encodeURIComponent(slug)}`),
};
