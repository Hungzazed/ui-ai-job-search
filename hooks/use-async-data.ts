"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";

type Loader<T> = () => Promise<T>;

export interface AsyncData<T> {
  /** Kết quả THÀNH CÔNG gần nhất. Giữ nguyên trong lúc đang tải lượt kế. */
  data: T | null;
  error: string | null;
  /**
   * Mã HTTP của lỗi, để người gọi phân nhánh mà không phải tự bắt lỗi lại.
   *
   * Có vì 403 KHÔNG phải hỏng hóc: vai trò được đọc tươi từ database mỗi request
   * nên một tài khoản có thể bị hạ quyền ngay giữa phiên, và màn Admin cần hiện
   * "không có quyền" chứ không hiện một thông báo lỗi đỏ.
   */
  errorStatus: number | null;
  loading: boolean;
  /** Tải lại cùng một request. Dùng cho nút "Tải lại". */
  reload: () => void;
}

/**
 * Tải dữ liệu cho một màn hình, và **KHÔNG lưu cờ `loading` thành state**.
 *
 * Vì sao viết riêng một hook thay vì để mỗi màn tự `useEffect`: bốn màn trước đây
 * lặp lại đúng một khối — cờ `cancelled`, `setLoading(true)` ngay trong thân
 * effect, một nhánh 401 chuyển sang trang đăng nhập, một `apiErrorMessage` với câu
 * mặc định. Lặp bốn lần thì bốn chỗ có thể lệch nhau.
 *
 * ĐIỂM CHÍNH: `loading` được **suy ra** chứ không được lưu.
 *
 *     loading = (kết quả đang giữ) KHÔNG phải của (request hiện tại)
 *
 * Định danh của một request chính là **hàm `load`**. Khi lượt tải xong, hàm đó
 * được lưu kèm kết quả (`loadedFor`); nó khớp với `load` hiện tại nghĩa là đã tải
 * xong, lệch nghĩa là đang tải. Nhờ vậy cờ `loading` **không thể** nói sai — không
 * có đường nào để nó còn `true` sau khi dữ liệu đã về, hay `false` khi tham số vừa
 * đổi. Đó đúng là chỗ một `setLoading` viết tay hay sai, nhất là ở nhánh lỗi và ở
 * `finally`.
 *
 * Hệ quả phụ đúng như React khuyến nghị: không còn `setState` đồng bộ trong thân
 * effect, nên không còn một vòng render dư mỗi lần đổi tham số.
 *
 * `load` PHẢI được bọc `useCallback` (hoặc `useMemo`). Truyền một closure mới mỗi
 * lần render thì `loadedFor` không bao giờ khớp và nó tải vô tận —
 * `react-hooks/exhaustive-deps` ở phía người gọi là chỗ bắt lỗi đó.
 *
 * `load = null` nghĩa là **chưa tới lúc tải**, dùng cho request phụ thuộc request
 * khác (màn Admin chỉ đọc số liệu sau khi biết tài khoản là ADMIN). Lúc đó
 * `loading` là `false` vì thật sự không có request nào đang chạy — người gọi tự
 * quyết định hiện gì trong khoảng chờ đó.
 */
export function useAsyncData<T>(
  load: Loader<T> | null,
  options: { loginNext: string; errorMessage: string },
): AsyncData<T> {
  const router = useRouter();
  const { loginNext, errorMessage } = options;

  const [result, setResult] = useState<{
    /** Hàm `load` đã sinh ra dữ liệu đang giữ. `null` = chưa tải gì. */
    loadedFor: Loader<T> | null;
    data: T | null;
    error: string | null;
    errorStatus: number | null;
  }>({ loadedFor: null, data: null, error: null, errorStatus: null });

  useEffect(() => {
    if (!load) return;
    // Đã có kết quả cho đúng request này thì không gọi lại. Cái `return` này là
    // thứ giữ cho effect không thành vòng lặp: mỗi `setResult` bên dưới đều làm
    // effect chạy lại (vì `result.loadedFor` nằm trong deps), và lần đó phải
    // dừng ở đây.
    if (result.loadedFor === load) return;

    let alive = true;

    void (async () => {
      try {
        const data = await load();
        if (alive) {
          setResult({ loadedFor: load, data, error: null, errorStatus: null });
        }
      } catch (err) {
        if (!alive) return;
        const status = apiErrorStatus(err);
        // 401 xử lý ở MỘT chỗ. Cookie hết hạn giữa lúc đang xem là chuyện thật,
        // và để mỗi màn tự xử lý thì sẽ có màn quên.
        if (status === 401) {
          router.replace(`/login?next=${loginNext}`);
          return;
        }
        setResult({
          // `apiErrorStatus` trả `undefined` khi lỗi không phải từ HTTP (mất
          // mạng, huỷ request). Quy về `null` để kiểu trả về của hook chỉ có một
          // cách biểu diễn "không có mã".
          errorStatus: status ?? null,
          // Vẫn phải ghi `loadedFor`, kể cả khi lỗi: thiếu nó thì effect thấy
          // "chưa tải xong" và gọi lại ngay, thành một vòng lặp gọi API.
          loadedFor: load,
          // BỎ dữ liệu cũ khi lỗi, không giữ lại: giữ thì màn hình có thể hiện
          // dữ liệu của request TRƯỚC dưới nhãn của request SAU — ví dụ đổi
          // khoảng thời gian ở màn Admin rồi lượt mới lỗi, người đọc tin vào
          // những con số không thuộc nhãn đang hiện.
          data: null,
          error: apiErrorMessage(err, errorMessage),
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [load, result.loadedFor, router, loginNext, errorMessage]);

  /// Đặt `loadedFor` về null để effect thấy "chưa có kết quả cho request này".
  /// Đây là setState trong một hàm xử lý sự kiện, không phải trong effect.
  const reload = useCallback(
    () => setResult((current) => ({ ...current, loadedFor: null })),
    [],
  );

  return {
    data: result.data,
    error: result.error,
    errorStatus: result.errorStatus,
    // `load === null` thì không có request nào để chờ.
    loading: load !== null && result.loadedFor !== load,
    reload,
  };
}
