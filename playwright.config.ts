import { defineConfig, devices } from "@playwright/test";

/**
 * Cấu hình cho phần kiểm BỐ CỤC bằng mắt.
 *
 * Đây không phải bộ test chạy trong CI. Nó tồn tại để trả lời một câu mà
 * typecheck, lint, unit test và build đều không trả lời được: **màn hình nhìn ra
 * sao**. Bảy màn hình từng được dựng mà chưa ai xem, và tất cả đều xanh ở mọi
 * kiểm tra tự động.
 *
 * `testDir` trỏ riêng `test/visual` để không đụng `test/unit` của vitest.
 *
 * KHÔNG khai `webServer`: backend cần Postgres và biến môi trường riêng, nên tự
 * khởi động nó ở đây sẽ che mất lỗi cấu hình thật. Chạy hai server trước rồi mới
 * chạy lệnh này — xem README.
 */
export default defineConfig({
  testDir: "./test/visual",
  outputDir: "./test/visual/.output",
  // Chụp tuần tự: ảnh chụp song song hay bắt được đúng lúc skeleton chưa kịp
  // biến thành nội dung, và một ảnh skeleton thì không nói được gì về bố cục.
  workers: 1,
  /*
   * Mỗi test đi qua nhiều màn với dữ liệu thật, nên mức mặc định 30 giây của
   * Playwright là cho cả một lượt duyệt chứ không phải cho một hành động. Với 8
   * màn nạp dữ liệu thật từ backend, nó hết giờ giữa đường và báo đỏ vì hết thời
   * gian, không phải vì bố cục sai.
   */
  timeout: 180_000,
  reporter: [["list"]],
  use: {
    baseURL: process.env.VISUAL_BASE_URL ?? "http://localhost:3000",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
  },
});
