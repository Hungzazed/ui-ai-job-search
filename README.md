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

- **Chưa có test đơn vị cho component và hook** — chưa cài `jsdom` lẫn `@testing-library/react`. Bộ đơn vị (vitest) cố ý chỉ kiểm hàm thuần; hành vi được kiểm bằng Playwright trên trình duyệt thật, và hai thứ dễ vỡ nhất đã có test riêng ở đó: `test/visual/document-job.spec.ts` (máy trạng thái tài liệu) và `test/visual/admin-refetch.spec.ts` (đếm request để bắt vòng lặp tải).
- **Thẻ số liệu "Tỷ lệ match TB" không có link.** Nhãn cũ là "Chi tiết phân tích" nhưng không có trang phân tích nào; nay bỏ hẳn nhãn thay vì trỏ tạm sang trang khác. Khi có trang đó thật thì thêm `action` vào `dashboard-stats.tsx`.
- **`GET /api/upskill` trả 404 khi chưa có báo cáo**, nên console có một dòng 404 mỗi lần mở màn Lộ trình học lúc chưa có dữ liệu. Đúng REST cho một tài nguyên đơn, nhưng giao diện không phân biệt được "chưa có" với "route đã bị đổi tên" — `server/test/upskill.e2e-spec.ts` ghim đường dẫn lại để bịt khe đó.

## Tải dữ liệu: `hooks/use-async-data.ts`

Mọi màn hình tải dữ liệu đều đi qua hook này. **Không tự viết `useEffect` + `useState` để gọi API nữa** — `react-hooks/set-state-in-effect` đang ở mức `error` nên lint sẽ chặn.

Điều đáng nhớ nhất: **`loading` được suy ra, không được lưu.** Kết quả trả về mang theo chính hàm `load` đã sinh ra nó, nên "đang tải" không thể nói khác với "có request đang chạy". Đi cùng nó là hai quy tắc:

- **Hàm `load` phải được bọc `useCallback`/`useMemo`** — định danh của nó chính là định nghĩa của "request này". Một closure mới mỗi lần render sẽ tải vô tận.
- **`load = null` nghĩa là chưa tới lúc tải**, dùng cho request phụ thuộc request khác (màn Admin chỉ đọc số liệu sau khi biết tài khoản là ADMIN).

Hai mẫu khác cũng đã bị bỏ, vì cùng một lý do — hai nguồn sự thật có thể lệch nhau:

- **Không chép dữ liệu sang state thứ hai rồi đồng bộ bằng effect.** Danh sách tài liệu ở màn CV/Thư xin việc được ghép lúc render (`useMemo`).
- **Dọn state khi đổi đối tượng thì dùng `key`**, không dùng effect đặt lại từng ô. `DocumentSource` bắt buộc người gọi truyền `key={documentId}`.

## Bảng rộng: đo bằng container query, không bằng breakpoint cửa sổ

`md:`/`lg:`/`xl:` đo bề ngang **cửa sổ**, nhưng bảng nằm trong khung hẹp hơn 256px vì sidebar. Đã trả giá đúng một lần: bảng "Tất cả việc làm" rộng 1593px trong khung 1118px, và cột Thao tác — nút Chấm điểm, Lưu, Mở tin gốc — nằm ở 1882px, ngoài màn hình 1440px. Trang không cuộn ngang nên ảnh chụp trông vẫn bình thường.

Nay `AllJobsTable` dùng `@2xl:`/`@4xl:`/`@6xl:` với `@container` trên thẻ bọc, và ô đầu dùng `w-full max-w-0` để `truncate` có chỗ cắt (`white-space: nowrap` khiến min-content bằng cả câu). `test/visual/jobs-table-width.spec.ts` đo lại ở bốn cỡ.

## Vì sao mọi trang đều là client component

Các `page.tsx` chỉ là vỏ server để khai `metadata`; toàn bộ việc tải dữ liệu nằm trong client component. Đây là lựa chọn có ý thức, không phải sơ suất: mọi endpoint đều cần cookie xác thực của người dùng và không có gì cache được giữa các người dùng, nên render phía server không mua lại được gì đáng kể.
