import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { waitForImages } from "./support";

/**
 * Kiểm BẰNG MẮT thanh lọc và phân trang của trang tìm việc.
 *
 * Ba thứ typecheck và e2e của backend không trả lời được: menu chọn nhiều tỉnh
 * có mở ra đúng chỗ không, bộ lọc có nằm lại trên URL sau khi tải lại trang
 * không, và lật trang có thật sự đổi nội dung không.
 */
const SHOTS = "test/visual/screenshots";
const EMAIL = process.env.VISUAL_EMAIL ?? "admin@aijob.local";
const PASSWORD = process.env.VISUAL_PASSWORD ?? "Demo@12345";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Mật khẩu").fill(PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);
}

test.beforeAll(() => {
  mkdirSync(SHOTS, { recursive: true });
});

test("thanh lọc, phân trang và trạng thái trên URL", async ({ page }) => {
  const failures: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failures.push(`HTTP ${response.status()} ${response.url()}`);
    }
  });

  await login(page);
  await page.goto("/dashboard/jobs");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await waitForImages(page);
  await page.screenshot({ path: `${SHOTS}/07-jobs-default.png`, fullPage: true });

  // Menu chọn tỉnh mở ra, có ô lọc nhanh và số tin từng mục.
  await page.getByRole("button", { name: /Địa điểm/ }).click();
  await expect(page.getByPlaceholder("Nhập Tỉnh/Thành phố")).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/08-jobs-province-menu.png` });

  await page.getByRole("button", { name: /^Hà Nội/ }).click();
  await page.getByRole("button", { name: "Áp dụng" }).click();

  // Bộ lọc phải nằm trên URL, nếu không thì không chia sẻ được và Back sẽ hỏng.
  await expect(page).toHaveURL(/province=HN/);

  // Danh sách phải còn nguyên trong lúc tải trang mới, không chớp về khung xám.
  await expect(
    page.locator('a[href^="/dashboard/jobs/"]').first(),
  ).toBeVisible();
  await waitForImages(page);
  await page.screenshot({
    path: `${SHOTS}/09-jobs-filtered.png`,
    fullPage: true,
  });

  // Tải lại trang: kết quả phải y nguyên vì trạng thái nằm ở URL chứ không ở
  // bộ nhớ của component.
  const subtitle = page.locator("p", { hasText: /tin khớp với bộ lọc/ }).first();
  const countBeforeReload = await subtitle.innerText();
  await page.reload();
  await expect(
    page.locator("p", { hasText: /tin khớp với bộ lọc/ }).first(),
  ).toHaveText(countBeforeReload);

  // Lật trang: nội dung phải ĐỔI và `offset` phải nằm trên URL. Trước đây trang
  // chỉ tải 50 tin đầu rồi lọc trong bộ nhớ, nên không có trang thứ hai để lật.
  const firstJob = () =>
    page.locator('a[href^="/dashboard/jobs/"]').first().getAttribute("href");
  const before = await firstJob();

  await page.getByRole("button", { name: "Sau" }).click();
  await expect(page).toHaveURL(/offset=20/);
  await expect.poll(firstJob).not.toBe(before);
  await waitForImages(page);
  await page.screenshot({ path: `${SHOTS}/10-jobs-page-2.png`, fullPage: true });

  expect(failures).toEqual([]);
});
