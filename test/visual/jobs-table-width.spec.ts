import { expect, test } from "@playwright/test";
import { waitForImages } from "./support";

/*
 * Bảng "Tất cả việc làm" KHÔNG được rộng hơn chỗ nó có.
 *
 * Lỗi đã đo được trước khi có test này: breakpoint của cột đo theo bề ngang CỬA SỔ
 * (`lg:`, `xl:`) trong khi bảng nằm trong một khung hẹp hơn 256px vì sidebar. Ở cửa
 * sổ 1440px, bảng rộng 1593px và cột "Thao tác" — nút Chấm điểm, Lưu, Mở tin gốc —
 * nằm ở 1882px, tức là ngoài màn hình. Trang không cuộn ngang nên nhìn ảnh chụp
 * không thấy gì sai; phải đo mới thấy.
 *
 * Nay cột đo bằng container query và ô đầu dùng `w-full max-w-0`. Test này ghim cả
 * hai, ở bốn cỡ, vì cả hai đều dễ bị "dọn dẹp" mất.
 */
const SIZES = [
  { name: "desktop 1440", width: 1440, height: 900 },
  { name: "laptop 1280", width: 1280, height: 800 },
  { name: "tablet 1024", width: 1024, height: 800 },
  { name: "dien thoai 390", width: 390, height: 844 },
];

test("bang Tat ca viec lam khong tran ra ngoai khung", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@aijob.local");
  await page.getByLabel("Mật khẩu").fill("MatKhauTest123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  for (const size of SIZES) {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.goto("/dashboard/jobs/all");
    await page.locator("table").first().waitFor();

    const m = await page.evaluate(() => {
      const table = document.querySelector("table")!;
      const scroller = table.parentElement!;
      return {
        viewport: window.innerWidth,
        bodyScrollWidth: document.body.scrollWidth,
        khung: Math.round(scroller.getBoundingClientRect().width),
        bang: Math.round(table.getBoundingClientRect().width),
        cot: [...document.querySelectorAll("thead th")]
          .map((th) => ({
            text: th.textContent?.trim(),
            rong: Math.round(th.getBoundingClientRect().width),
            right: Math.round(th.getBoundingClientRect().right),
          }))
          .filter((c) => c.rong > 0),
      };
    });

    console.log(`${size.name}: ${JSON.stringify(m)}`);

    expect(m.bodyScrollWidth, size.name).toBeLessThanOrEqual(m.viewport + 1);
    expect(m.bang, size.name).toBeLessThanOrEqual(m.khung + 1);
    const cuoi = m.cot[m.cot.length - 1];
    expect(cuoi.text, size.name).toBe("Thao tác");
    expect(cuoi.right, size.name).toBeLessThanOrEqual(m.viewport);

    await waitForImages(page);
    await page.screenshot({
      path: `test/visual/screenshots/10-jobs-table-${size.width}.png`,
    });
  }
});
