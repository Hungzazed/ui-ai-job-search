/* =========================================================
   Màn hình Quản trị
   ========================================================= */

/**
 * Kiểu cho màn hình Quản trị nằm ở `lib/services/admin.ts`, cạnh chính lời gọi
 * API sinh ra chúng: `AiHealth`, `PurposeStats`, `AiFailureRecord`,
 * `AiFailureKind`.
 *
 * File này trống là có chủ đích. Trước đây nó khai `KpiMetric`,
 * `ActivityPoint` và `JobSourceSlice` cho ba biểu đồ chạy bằng dữ liệu bịa —
 * backend không có endpoint nào trả KPI, hoạt động theo ngày hay phân bố nguồn
 * tin. Ba biểu đồ đó đã bị gỡ khỏi giao diện, nên ba kiểu này cũng đi theo.
 *
 * Khi nào backend có thật những số đó thì khai kiểu ở `lib/services/admin.ts`
 * chứ không phải ở đây.
 */

export {};
