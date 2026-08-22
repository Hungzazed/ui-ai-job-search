import { expect, test } from "@playwright/test";

/**
 * Kho chọn mẫu nằm trong tab "Mẫu trình bày" của khối "Sửa CV", và khối đó chỉ
 * hiện SAU KHI mở một CV đã sinh xong. Vào thẳng trang thì chưa có gì để chọn
 * mẫu cho.
 *
 * Spec này KHÔNG bấm Lưu: nó chạy trên database DEV, nên mọi thao tác ghi sẽ sửa
 * dữ liệu thật của người dùng.
 */
test("kho chon mau CV hien sau khi mo mot CV da tao", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("ketoan@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/cv-optimizer");
  await expect(page.getByRole("heading", { name: "CV đã tạo" })).toBeVisible({
    timeout: 30_000,
  });

  await page.locator("main button").filter({ hasText: /^CV/ }).first().click();
  await expect(page.getByRole("heading", { name: "Sửa CV" })).toBeVisible({
    timeout: 30_000,
  });

  await page.getByRole("tab", { name: "Mẫu trình bày" }).click();

  await expect(page.getByRole("button", { name: /Tiêu chuẩn/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Trang trọng/ })).toBeVisible();
  await expect(page.frameLocator("iframe").locator("body")).toBeVisible();

  // Chụp RIÊNG iframe: ảnh fullPage của Playwright không vẽ nội dung iframe,
  // nên khung xem trước sẽ ra một ô trắng và trông y như tính năng hỏng.
  await page.locator("iframe").scrollIntoViewIfNeeded();
  await page.locator("iframe").screenshot({
    path: "test/visual/screenshots/cv-template-xem-truoc.png",
  });
});
