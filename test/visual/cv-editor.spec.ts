import { expect, test } from "@playwright/test";

/** Mở CV đầu tiên trong kho tài liệu của tài khoản kế toán. */
async function moCv(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("ketoan@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/cv-optimizer");
  await page.locator("li button").filter({ hasText: /^CV/ }).first().click();
  await expect(page.getByRole("heading", { name: /^Sửa CV/ })).toBeVisible({
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

  await page.getByRole("tab", { name: "Bố cục" }).click();
  await page.getByRole("button", { name: "Ẩn Học vấn khỏi CV" }).click();

  await expect(frame.getByText("HỌC VẤN")).toBeHidden({ timeout: 15_000 });
  await expect(
    page.getByRole("button", { name: "Đưa Học vấn lại vào CV" }),
  ).toBeVisible();
});

test("doi thu tu muc bang nut mui ten", async ({ page }) => {
  await moCv(page);

  await page.getByRole("tab", { name: "Bố cục" }).click();

  const tieuDe = page.locator("div:has(> button[aria-label^='Ẩn']) > span");
  await expect(tieuDe.first()).toHaveText("Giới thiệu");

  await page.getByRole("button", { name: "Đưa Năng lực chính lên trên" }).click();

  await expect(tieuDe.first()).toHaveText("Năng lực chính");
  await expect(tieuDe.nth(1)).toHaveText("Giới thiệu");
});

test("bam vao mot muc tren ban xem truoc thi o sua mo dung muc do", async ({
  page,
}) => {
  await moCv(page);

  const frame = page.frameLocator("iframe");
  await expect(frame.getByText("HỌC VẤN")).toBeVisible({ timeout: 15_000 });

  const hocVan = page.getByRole("button", { name: /^Học vấn/ });
  await expect(hocVan).toHaveAttribute("aria-expanded", "false");

  await frame.locator("[data-section='education']").click();

  await expect(hocVan).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("button", { name: /^Giới thiệu/ })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("chuyen sang tab Mau van dung chung mot khung xem truoc", async ({
  page,
}) => {
  await moCv(page);

  await page.getByRole("tab", { name: "Mẫu trình bày" }).click();

  await expect(page.getByRole("button", { name: /Trang trọng/ })).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(1);
});
