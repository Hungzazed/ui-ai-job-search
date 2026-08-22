"use client";

import {
  keepPreviousData,
  useQuery,
  type QueryKey,
} from "@tanstack/react-query";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import type { AsyncData } from "@/hooks/use-async-data";

/**
 * `useQuery` mặc lại đúng bộ đồ của `useAsyncData`.
 *
 * Cố ý trả về CÙNG hình dạng (`data` / `error` / `errorStatus` / `loading` /
 * `reload`) để chuyển một màn sang TanStack Query chỉ là đổi lời gọi hook, không
 * phải viết lại phần render. Nhờ vậy mỗi bước chuyển đều kiểm được bằng chính
 * các spec Playwright đang có — thứ duy nhất phủ tầng dữ liệu của app này.
 *
 * Ba khác biệt so với mặc định của TanStack, đều là **giữ lại quyết định cũ**:
 *
 * 1. **Lỗi thì XOÁ dữ liệu cũ.** TanStack giữ `data` của lượt trước. Bản cũ cố ý
 *    không, vì màn Admin đổi khoảng thời gian rồi lượt mới hỏng sẽ hiện số của
 *    request TRƯỚC dưới nhãn của request SAU.
 * 2. **`loading` bao gồm cả lượt nạp lại**, không chỉ lượt đầu. Người dùng bấm
 *    "Tải lại" phải thấy có gì đó đang chạy.
 * 3. **`enabled: false` thì `loading` là `false`** — không có request nào đang
 *    chờ thật, nên nói đang tải là nói sai. Đây là chỗ `load = null` của bản cũ.
 *
 * 401 KHÔNG xử lý ở đây mà ở `QueryProvider`, cho cả query lẫn mutation.
 */
export function useApiQuery<T>(
  key: QueryKey,
  fetcher: () => Promise<T>,
  options: {
    errorMessage: string;
    /** `false` = chưa tới lúc tải. Thay cho `load = null` của `useAsyncData`. */
    enabled?: boolean;
    /** Mili-giây giữa hai lượt tự nạp lại. Thay cho các vòng hẹn giờ viết tay. */
    refetchInterval?: number | false;
    /**
     * Giữ kết quả của khoá TRƯỚC trong lúc khoá mới đang tải.
     *
     * Chỉ bật cho danh sách có phân trang hoặc bộ lọc: không có nó thì mỗi lần
     * lật trang hay tích một ô lọc, cả trang chớp về khung xám rồi mới hiện lại
     * - `loading` vẫn cho biết đang tải, nên không mất thông tin nào.
     *
     * KHÔNG bật cho những màn đã cố ý xoá dữ liệu cũ, ví dụ màn Admin đổi
     * khoảng thời gian: ở đó số của request trước nằm dưới nhãn của request sau
     * là nói sai.
     */
    keepPrevious?: boolean;
    /**
     * Bao lâu thì dữ liệu bị coi là cũ. Mặc định 30 giây, khai ở `QueryProvider`.
     *
     * Đặt `Infinity` cho những thứ KHÔNG PHẢI dữ liệu người dùng: danh mục tỉnh
     * và ngành, danh sách mẫu CV - chúng là hằng số khai trong code, chỉ đổi khi
     * deploy bản mới. Hỏi lại chúng sau mỗi 30 giây là hỏi một câu đã biết trước
     * câu trả lời.
     *
     * ĐỪNG dùng cho dữ liệu có tiến trình nền đang ghi vào (lượt chạy agent, báo
     * cáo đang soạn, lượt quét đang chạy): ở đó cache dài không làm app nhanh
     * hơn, nó làm màn hình đứng ở chữ "Đang chạy" trong khi việc đã xong.
     */
    staleTime?: number;
  },
): AsyncData<T> {
  const enabled = options.enabled ?? true;

  const query = useQuery({
    queryKey: key,
    queryFn: fetcher,
    enabled,
    refetchInterval: options.refetchInterval ?? false,
    ...(options.staleTime === undefined ? {} : { staleTime: options.staleTime }),
    ...(options.keepPrevious ? { placeholderData: keepPreviousData } : {}),
  });

  return {
    data: query.isError ? null : (query.data ?? null),
    error: query.isError
      ? apiErrorMessage(query.error, options.errorMessage)
      : null,
    errorStatus: query.isError ? (apiErrorStatus(query.error) ?? null) : null,
    loading: enabled && query.isFetching,
    reload: () => {
      void query.refetch();
    },
  };
}
