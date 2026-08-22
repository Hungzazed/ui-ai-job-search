import { expect, test } from "@playwright/test";

/** Mở CV đầu tiên trong kho tài liệu của tài khoản kế toán. */
async function moCv(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("ketoan@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/cv-optimizer");
  await page.locator("main button").filter({ hasText: /^CV/ }).first().click();
  await expect(page.getByRole("heading", { name: "Sửa CV" })).toBeVisible({
    timeout: 30_000,
  });
}

test("sua chu thi ban xem truoc doi theo", async ({ page }) => {
  await moCv(page);

  const gioiThieu = page.getByPlaceholder("Vài câu giới thiệu bản thân");
  await gioiThieu.fill("CHU-VUA-SUA-TRONG-TEST");

  // Debounce 400ms rồi mới gọi xem trước.
  await expect(
    page.frameLocator("iframe").getByText("CHU-VUA-SUA-TRONG-TEST"),
  ).toBeVisible({ timeout: 15_000 });

  await page.locator("iframe").scrollIntoViewIfNeeded();
  await page.locator("iframe").screenshot({
    path: "test/visual/screenshots/cv-editor-sua-chu.png",
  });
});

test("an mot muc thi muc do bien khoi ban xem truoc", async ({ page }) => {
  await moCv(page);

  const frame = page.frameLocator("iframe");
  await expect(frame.getByText("HỌC VẤN")).toBeVisible({ timeout: 15_000 });

  await page
    .getByRole("button", { name: "Ẩn mục này" })
    .nth(3)
    .click();

  await expect(frame.getByText("HỌC VẤN")).toBeHidden({ timeout: 15_000 });
});

test("doi thu tu muc bang nut mui ten", async ({ page }) => {
  await moCv(page);

  // Khoanh đúng panel sửa: màn hình còn một khối xem nội dung cũng dùng h3.
  const tieuDe = page.locator(
    "section:has(button[aria-label='Ẩn mục này']) h3",
  );
  await expect(tieuDe.first()).toHaveText("Giới thiệu");

  // Đưa mục thứ hai lên đầu.
  await page.getByRole("button", { name: "Đưa lên trên" }).nth(1).click();

  await expect(tieuDe.first()).toHaveText("Năng lực chính");
  await expect(tieuDe.nth(1)).toHaveText("Giới thiệu");
});

test("chuyen sang tab Mau van dung chung mot khung xem truoc", async ({
  page,
}) => {
  await moCv(page);

  await page.getByRole("tab", { name: "Mẫu trình bày" }).click();

  await expect(page.getByRole("button", { name: /Trang trọng/ })).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(1);
});
