import type { JobSort } from "@/services";
import type { JobFilterValue } from "@/components/dashboard/job-filter-bar";

/**
 * Bộ lọc việc làm nằm trên URL, không nằm trong state.
 *
 * Nhờ vậy một trang kết quả đã lọc chia sẻ được, và nút Back của trình duyệt trả
 * đúng bộ lọc trước đó. Cái giá là hai hàm này phải KHỨ HỒI chính xác:
 * `readFilter(writeFilter(x)) === x`. Sai một trường thì bộ lọc âm thầm mất khi
 * tải lại trang - một triệu chứng trông y hệt lỗi hiển thị.
 *
 * File chỉ import KIỂU nên không kéo theo React, và chạy được trong bộ test
 * `environment: node` của repo.
 */
export const SORTS: JobSort[] = ["newest", "salary", "match"];

/** Màn hình "đã chấm" mặc định xếp theo điểm; màn hình thường xếp theo ngày. */
export const defaultSort = (scored: boolean): JobSort =>
  scored ? "match" : "newest";

export function readFilter(
  params: URLSearchParams,
  scored: boolean,
): JobFilterValue {
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    province: params.getAll("province"),
    occupation: params.getAll("occupation"),
    salaryMin: Number(params.get("salaryMin") ?? 0) || 0,
    postedWithin: Number(params.get("postedWithin") ?? 0) || 0,
    sort: SORTS.includes(sort as JobSort)
      ? (sort as JobSort)
      : defaultSort(scored),
    saved: params.get("saved") === "1",
    applied: params.get("applied") === "1",
    subOccupation: params.getAll("subOccupation"),
  };
}

/**
 * Giá trị rỗng và giá trị mặc định KHÔNG được ghi vào URL.
 *
 * Không phải để URL cho đẹp: `keys.jobList` băm nguyên bộ lọc làm khoá cache, nên
 * cùng một bộ lọc mà ra hai chuỗi khác nhau sẽ tách đôi cache và tải lại thừa.
 */
export function writeFilter(
  filter: JobFilterValue,
  offset: number,
  scored: boolean,
  selected?: string | null,
): string {
  const params = new URLSearchParams();
  if (scored) params.set("scored", "1");
  if (selected) params.set("job", selected);
  if (filter.q) params.set("q", filter.q);
  for (const code of filter.province) params.append("province", code);
  for (const code of filter.occupation) params.append("occupation", code);
  for (const code of filter.subOccupation) params.append("subOccupation", code);
  if (filter.salaryMin) params.set("salaryMin", String(filter.salaryMin));
  if (filter.postedWithin)
    params.set("postedWithin", String(filter.postedWithin));
  if (filter.saved) params.set("saved", "1");
  if (filter.applied) params.set("applied", "1");
  if (filter.sort !== defaultSort(scored)) params.set("sort", filter.sort);
  if (offset) params.set("offset", String(offset));
  return params.toString();
}
