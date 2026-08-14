import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// `eslint-config-next` v16 xuất trực tiếp flat config array, nên import thẳng.
// KHÔNG bọc qua `FlatCompat`: lớp chuyển eslintrc sẽ cố `JSON.stringify` cấu hình
// để dựng thông báo lỗi và vỡ vì cấu trúc vòng ("Converting circular structure to
// JSON") - một thông báo chẳng liên quan gì tới nguyên nhân thật.
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      // Do Next sinh ra, không phải mã của mình.
      "next-env.d.ts",
      // Skill của agent được vendor vào repo, không phải mã sản phẩm.
      ".agents/**",
    ],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      /**
       * Đã ở mức `error` — và đó là mức mặc định của `eslint-config-next`, nên
       * dòng này chỉ còn để giữ lại lời giải thích.
       *
       * Nó từng bị hạ xuống `warn` với 7 chỗ vi phạm, vì rule này không bắt lỗi lẻ
       * mà bắt **kiến trúc tải dữ liệu**: mọi màn hình tự viết `useEffect` +
       * `useState` để gọi API, nên mỗi màn mới lại cộng thêm một cảnh báo.
       *
       * Cách sửa KHÔNG phải vá từng chỗ mà là bỏ hẳn ba mẫu hỏng:
       *
       * 1. Cờ `loading` **suy ra** thay vì lưu — `hooks/use-async-data.ts`. Kết
       *    quả được đóng dấu bằng chính hàm `load` sinh ra nó, nên "đang tải"
       *    không thể nói khác với "có request đang chạy".
       * 2. Không chép dữ liệu sang state thứ hai để đồng bộ bằng effect. Danh sách
       *    tài liệu ở màn CV/Thư xin việc nay được ghép lúc render (`useMemo`).
       * 3. Dọn state khi đổi đối tượng thì dùng `key` để React dựng lại component,
       *    không dùng effect đặt lại từng ô — xem `DocumentSource`.
       *
       * Giữ `error` để ba mẫu đó không quay lại: cái giá của chúng không phải một
       * vòng render dư, mà là hai nguồn sự thật có thể lệch nhau.
       */
      "react-hooks/set-state-in-effect": "error",
    },
  },
];

export default config;
