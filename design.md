# Design — Careelot

A locked design system for this app. Every page redesign reads this file before emitting code. Do not regenerate per page — extend or amend this file when the system needs to grow.

## Genre
modern-minimal

## Macrostructure family
- Dashboard / App pages: **Workbench** (high information density, crisp micro-borders, toolbars, split screens, OKLCH high-contrast accents, mono font for AI scores and metrics)

## Theme

Bảng màu dựng trên **ba màu gốc**. Không đặt màu thương hiệu ở bất kỳ chỗ nào khác — mọi thang màu đều dẫn về đây, khai ở đầu `@theme` trong `app/globals.css`.

| Màu gốc | HEX | OKLCH | Biến |
|---|---|---|---|
| Royal Blue | `#4952FF` | `oklch(0.5487 0.2501 272.4)` | `--brand-blue` |
| Bright White | `#FFFFFF` | — | `--brand-white` |
| Dark Gray | `#1F1F21` | `oklch(0.2401 0.0038 286.1)` | `--brand-ink` |

Ba con số này chốt luôn hai trục còn lại: **sắc độ 272.4** cho mọi bậc xanh, **sắc độ 286.1 với độ bão hoà ~0.004** cho mọi bậc xám. Thang xám cũ ám xanh (bão hoà 0.01–0.02) nên trang trông xám-xanh chứ không xám-chì như `#1F1F21`.

Token ngữ nghĩa (chế độ sáng):

- `--color-paper`: oklch(0.985 0.001 286.1) — nền trang
- `--color-paper-card`: `--brand-white` — nền thẻ
- `--color-ink`: `--brand-ink`
- `--color-ink-muted`: oklch(0.48 0.004 286.1)
- `--color-rule`: oklch(0.925 0.003 286.1)
- `--color-accent` / `--color-focus`: `--brand-blue`
- `--color-accent-ink`: `--brand-white`
- `--color-success`: oklch(0.65 0.19 150)
- `--color-warning`: oklch(0.72 0.16 70)

### Ba ràng buộc KHÔNG được phá

1. **Chế độ tối không dùng Royal Blue nguyên bản.** `#4952FF` trên `#1F1F21` chỉ đạt 3.08:1 — trượt AA. Trong `.dark`, màu nhấn kéo lên `oklch(0.68 0.20 272.4)` (`#7189FF`, 5.27:1), và `--color-accent-ink` đổi sang **Dark Gray**, không phải trắng: trắng trên `#7189FF` chỉ 3.12:1.
2. **Thang xám giữ NGUYÊN độ đậm của `slate` gốc Tailwind, chỉ đổi tông.** Mỗi bậc chọn độ sáng sao cho tương phản trên nền trắng khớp bậc gốc (ví dụ 600 = 7.56:1, 900 = 17.84:1). Lần đầu tôi tự rải đều độ sáng và chữ **nhạt hẳn đi** — `text-slate-900` (62 lượt, màu tiêu đề chính) tụt từ 17.84 xuống 15.31. Đổi tông màu thì được, đổi độ đậm thì không.

   Hệ quả: **không bậc `slate` nào bằng đúng `#1F1F21`** — nó nằm giữa 800 và 900. Đúng như vậy: Dark Gray là màu *bề mặt* (nền chế độ tối, `--color-slab`, `--color-ink`), không phải bậc đậm nhất của thang chữ.
3. **Nền trang và nền thẻ phải lệch nhau.** Thẻ là trắng thuần `#FFFFFF`, nền trang là `#FAFAFB`. Ép cả hai về trắng thuần thì 28 chỗ `bg-slate-50` tàng hình.

### Vì sao gán lại thang `slate` của Tailwind

575 lượt `slate-*` trong 136 file là đường đi thật của hai màu trung tính, và code **không dùng** `bg-accent`/`text-accent` (0 lượt) mà gọi thẳng `primary-*`. Nên đổi bảng màu = gán lại `--color-slate-*` và `--color-primary-*`, không sửa file component nào. Cùng kỹ thuật mà khối `.dark` đã dùng sẵn.

### Màu trạng thái

Nhóm emerald / amber / rose / red / sky / teal (~112 lượt) **giữ nguyên**, không ép về ba tông. Bỏ đi thì badge "Đã ứng tuyển" và "Bị từ chối" trông giống hệt nhau. Tất cả đã đo lại trên nền `#1F1F21` mới: thấp nhất 6.05:1.

## Typography
- Display: **SVN-Gilroy SemiBold**, weight 600, style normal (roman upright, no italic headers) — token `--font-display`, tự động áp cho `h1`–`h6` qua `@layer base`
- Body / UI: **Google Sans Flex**, biến thiên weight 1–1000, trục `opsz`, style normal — token `--font-sans`

Cách nạp:

- Google Sans Flex qua `next/font/google` trong `app/layout.tsx` (biến `--font-google-sans`), **không** dùng `@import` từ `fonts.googleapis.com`: `next/font` tự lưu font ngay trong ứng dụng nên bỏ được hai lượt kết nối ra ngoài và không nhảy chữ khi tải. Bắt buộc khai `subsets: ["latin", "vietnamese"]` — thiếu `vietnamese` thì dấu tiếng Việt rơi về font hệ thống.
- SVN-Gilroy qua `@font-face` trong `globals.css`, file ở `public/fonts/`. Bản `.woff2` (42 KB) đứng trước, `.otf` (99 KB) chỉ là dự phòng — thực tế trình duyệt không bao giờ tải tới nó.

### SVN-Gilroy chỉ có MỘT weight

Font này chỉ có SemiBold 600. Vì vậy **tiêu đề không được dùng `font-bold`** — trình duyệt sẽ bôi đậm giả và làm nét chữ nhoè. Sáu tiêu đề từng dùng `font-bold` đã hạ về `font-semibold`. Nếu sau này có bản Bold 700, thêm `@font-face` thứ hai rồi mới được dùng lại `font-bold`.

Kiểm tra đã làm: font phủ **đủ 186/186 ký tự tiếng Việt** (hoa + thường, mọi dấu). Thiếu duy nhất ký hiệu `₫` (U+20AB) — vô hại vì app hiển thị lương bằng chữ "triệu", không dùng ký hiệu này.
- Mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace (used for scores, percentages, KPI counts, match badges)
- Display tracking: -0.025em

## Thanh bên thu gọn được

Trạng thái nằm ở `data-sidebar` trên thẻ `<html>`, lưu vào `localStorage` key `aijob:sidebar`, đặt bởi `SIDEBAR_BOOTSTRAP` **trước lần vẽ đầu tiên** — cùng lý do với chủ đề và cỡ chữ: nếu để `useEffect` xử lý thì người đã thu gọn sẽ thấy thanh bên bung 256px rồi co lại 72px ở mọi lần tải trang, kéo theo cả vùng nội dung giật.

Bề ngang đi qua biến `--sidebar-width` (16rem ↔ 4.5rem). Cả `<aside>` lẫn phần đệm trái của vùng nội dung cùng đọc biến này, nên chúng không thể lệch nhau.

### Vì sao nhãn MỜ đi chứ không `display:none`

Bố cục bên trong thanh bên **giữ nguyên bề ngang 16rem**, khung ngoài `overflow-hidden` xén dần. Bản đầu tiên dùng `collapsed:hidden` cộng `justify-center` và chữ biến mất tức thì trong khi khung đang co — chuyển động của bề ngang trở nên vô nghĩa vì mọi thứ bên trong đã nhảy vị trí xong từ trước.

Hai chiều lệch pha có chủ ý, khai ở `[data-sidebar-label]` trong `globals.css`: thu gọn thì chữ tắt trong 90ms không trễ; mở ra thì chữ đợi 130ms cho khung nới xong mới hiện.

Biến thể `collapsed:` **chỉ áp từ 64rem trở lên**. Dưới ngưỡng đó thanh bên là ngăn kéo trượt ra, luôn đủ 16rem — không có biến thể theo màn hình thì ngăn kéo trên điện thoại sẽ mất sạch nhãn.

## Spacing
4-point named scale (`--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`)

## Motion
- Stance: motion-cut (fast, crisp opacity & transform micro-transitions, <= 150ms)

## Microinteractions stance
- Status pills with status dots instead of generic badges
- Focus visible 2px offset ring
- Active pressed-down feel (`active:translate-y-[1px]`)

## CTA voice
- Primary CTA: Solid AI Violet fill (`bg-accent text-accent-ink`), rounded-lg, font-medium
- Secondary CTA: Crisp border (`border border-rule bg-paper hover:bg-paper-2`)

## What pages MUST share
- The wordmark / logotype (`Careelot`)
- The accent color and its placement (<= 5% per viewport)
- The display + body + mono fonts
- Hairline borders (`border-slate-200/80` or `border-rule`)
- Anti-slop rule: **No blurred gradient clouds or blur blobs**
