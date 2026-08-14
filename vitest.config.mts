import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // `node` chứ không phải `jsdom`: những gì đang được kiểm là hàm thuần - đọc
    // JSON do model sinh ra, phân loại lỗi, định dạng chuỗi. Thêm jsdom vào chỉ
    // làm mỗi lần chạy chậm hơn mà không kiểm thêm được gì. Khi nào test đến
    // component thì mới đổi, và đổi cho riêng những tệp đó.
    environment: "node",
    // Test nằm ở `test/unit/**` phản chiếu cây nguồn, giống quy ước của backend.
    // Một quy ước cho cả hai repo để agent không phải nhớ hai kiểu.
    include: ["test/unit/**/*.spec.ts"],
  },
  resolve: {
    // Khớp với `paths: { "@/*": ["./*"] }` trong tsconfig. Thiếu alias này thì
    // mọi import `@/types` trong mã nguồn đều không phân giải được.
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
