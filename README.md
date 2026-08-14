# Frontend — AI Career Agent

Next.js 16 + React 19 + Tailwind 4. Đây là giao diện của backend NestJS ở repo `ai-job-search`; **không có API route nào ở đây** — trình duyệt gọi thẳng backend qua axios.

## Chạy

```bash
pnpm install
cp .env.local.example .env.local   # chỉnh nếu backend không ở localhost:4000
pnpm dev
```

Backend phải chạy trước. Xem `ai-job-search/server/README.md`.

Chỉ có **một** biến môi trường: `NEXT_PUBLIC_API_URL`. Nó mặc định về `http://localhost:4000/api` khi thiếu — tiện lúc dev nhưng là cái bẫy khi deploy: quên đặt thì mọi request đi vào localhost và người dùng chỉ thấy "Không kết nối được tới máy chủ".

## Kiểm tra trước khi coi một thay đổi là xong

```bash
pnpm lint && pnpm typecheck && pnpm test
```

### Kiểm bố cục bằng mắt — `pnpm test:visual`

Bốn lệnh trên **không nhìn được màn hình**. Chúng đã báo xanh trong khi `/admin` dán sát hai mép, ba nút trong lưới lệch nhau, cột địa điểm đẩy ô đổi trạng thái ra ngoài khung, và mọi hàng của một bảng nhận `key={undefined}`.

```bash
# Cần Postgres + backend :4000 + dev server :3000 đang chạy.
pnpm test:visual
```

Nó chụp 8 màn ở 1440×900, 4 màn ở 390×844, in ra mọi phản hồi HTTP ≥400 kèm URL và mọi lỗi console, đo `<select>` đổi trạng thái có nằm trong khung hay không, và kiểm không màn nào tràn ngang trên điện thoại. Ảnh ra `test/visual/screenshots/`.

**Hai điều bắt buộc, nếu không thì nó chỉ tạo cảm giác an toàn:**

1. **Phải trỏ vào database CÓ dữ liệu.** Mặc định đăng nhập `admin@aijob.local` trong DB dev. Lần chạy đầu tiên dùng một tài khoản chỉ tồn tại trong `aijob_test` — DB gần như trống — nên 3 kiểm đều xanh mà toàn bộ ảnh là trạng thái rỗng, và bố cục lúc có dữ liệu thì chưa từng được xem.
2. **Phải MỞ ẢNH RA XEM.** Bộ kiểm chỉ khẳng định được vài thứ đo được; phần còn lại — khoảng cách, khối trống, chữ bị cắt, nút lệch nhau — chỉ con người thấy.

Lưu ý: `pnpm build` ghi đè `.next` và làm dev server đang chạy trả 500. Chạy `test:visual` **trước** `build`, hoặc khởi động lại dev server sau khi build.

## Quy ước

- **Test nằm ở `test/unit/**` phản chiếu cây nguồn**, không đặt cạnh file nguồn. Cùng quy ước với backend để không phải nhớ hai kiểu. Runner là **vitest**, môi trường `node` — những gì đang được kiểm là hàm thuần. Khi nào test tới component thì thêm `jsdom` cho riêng các tệp đó.
- **Component không được gọi `api.get`/`api.post` trực tiếp.** Mọi lời gọi đi qua `services/`. Quy ước này đang được tuân thủ tuyệt đối; giữ nguyên như vậy.
- **`lib/document-content.ts` không bao giờ ép kiểu.** Nó đọc JSON do model sinh ra, nên mỗi trường được kiểm riêng: dữ liệu hỏng thì mất đúng khối đó chứ không làm trắng cả trang. Đừng "gọn hoá" bằng `as CvContent`.
- **Chỉ dùng pnpm.** `package-lock.json` đã bị gỡ: hai lockfile trong một dự án nghĩa là cài đặt phụ thuộc vào việc ai chạy lệnh gì trước.

## Nợ đã ghi, không phải bỏ sót

- **7 cảnh báo `react-hooks/set-state-in-effect`** trên 7 tệp. Đó là một triệu chứng chứ không phải bảy lỗi lẻ: toàn bộ ứng dụng tự viết `useEffect` + `useState` để tải dữ liệu, không dùng thư viện data-fetching nào. Lý do giữ ở mức `warn` và điều kiện để đưa về `error` ghi trong `eslint.config.mjs`.
- **Chưa có test cho component và hook.** Hook đáng test nhất là `use-document-job.ts` — máy trạng thái polling `idle → generating → done/failed/timeout`; nó cần jsdom.
- **Thẻ số liệu "Tỷ lệ match TB" không có link.** Nhãn cũ là "Chi tiết phân tích" nhưng không có trang phân tích nào; nay bỏ hẳn nhãn thay vì trỏ tạm sang trang khác. Khi có trang đó thật thì thêm `action` vào `dashboard-stats.tsx`.
- **`GET /api/upskill` trả 404 khi chưa có báo cáo**, nên console có một dòng 404 mỗi lần mở màn Lộ trình học lúc chưa có dữ liệu. Đúng REST cho một tài nguyên đơn, nhưng giao diện không phân biệt được "chưa có" với "route đã bị đổi tên" — `server/test/upskill.e2e-spec.ts` ghim đường dẫn lại để bịt khe đó.

## Vì sao mọi trang đều là client component

Các `page.tsx` chỉ là vỏ server để khai `metadata`; toàn bộ việc tải dữ liệu nằm trong client component. Đây là lựa chọn có ý thức, không phải sơ suất: mọi endpoint đều cần cookie xác thực của người dùng và không có gì cache được giữa các người dùng, nên render phía server không mua lại được gì đáng kể.
