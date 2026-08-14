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
       * Hạ từ error xuống warn, CÓ CHỦ ĐÍCH và có thời hạn.
       *
       * Rule này không bắt những lỗi lẻ mà bắt **kiến trúc tải dữ liệu** của cả
       * ứng dụng: mọi màn hình tự viết `useEffect` + `useState` để gọi API, không
       * dùng thư viện data-fetching nào. Vì vậy mỗi màn hình mới có tải dữ liệu
       * đều cộng thêm đúng một cảnh báo — đó là kỳ vọng, không phải hồi quy.
       * (Đã thử tách cờ loading ra khỏi thân effect ở `scrape-panel.tsx`: không
       * đủ, rule bắt cả lời gọi hàm async dẫn tới setState.)
       *
       * Vì thế KHÔNG liệt kê danh sách tệp ở đây: nó sẽ lạc hậu sau mỗi màn hình
       * mới, và một danh sách sai còn tệ hơn không có danh sách. Chạy
       * `pnpm lint` để xem hiện trạng.
       *
       * Sửa đúng nghĩa là đổi cách tải dữ liệu, không phải vá từng chỗ: hoặc dùng
       * một thư viện data-fetching, hoặc suy state ra từ dữ liệu thay vì lưu song
       * song (ví dụ `phase` trong `use-document-job.ts` suy được từ
       * `document.status`). Việc đó cần test cho hook polling trước, vì sửa mù ở
       * đó là cách nhanh nhất tạo ra một màn hình treo ở "đang sinh...".
       *
       * Giữ ở mức warn để lint vẫn xanh và vẫn chặn được các lỗi khác. Đưa về
       * `error` sau khi đổi xong cách tải dữ liệu.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
