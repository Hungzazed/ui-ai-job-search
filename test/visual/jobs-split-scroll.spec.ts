import { expect, test } from "@playwright/test";
const SIZES = [
  { name: "desktop 1440", width: 1440, height: 900 },
  { name: "laptop 1280", width: 1280, height: 800 },
];
const MIN_DETAIL_WIDTH = 520;

test("danh sach va chi tiet cuon rieng, trang khong cuon", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  for (const size of SIZES) {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.goto("/dashboard/jobs");
    await page.locator("li button").first().waitFor();
    await page.locator("li button").first().click();
    await page
      .getByTestId("job-detail-pane")
      .getByText("Mô tả công việc")
      .waitFor();

    const m = await page.evaluate(() => {
      const box = (id: string) => {
        const el = document.querySelector(`[data-testid="${id}"]`)!;
        const scroller = el.querySelector("[data-scroll]") ?? el;
        return {
          rong: Math.round(el.getBoundingClientRect().width),
          cuonDuoc: scroller.scrollHeight > scroller.clientHeight + 1,
        };
      };
      return {
        viewport: window.innerWidth,
        bodyScrollWidth: document.body.scrollWidth,
        trangCuon:
          document.documentElement.scrollHeight >
          document.documentElement.clientHeight + 1,
        danhSach: box("job-list-pane"),
        chiTiet: box("job-detail-pane"),
      };
    });

    console.log(`${size.name}: ${JSON.stringify(m)}`);
    expect(m.bodyScrollWidth, size.name).toBeLessThanOrEqual(m.viewport + 1);
    
    expect(m.trangCuon, size.name).toBe(false);
    expect(m.chiTiet.cuonDuoc, size.name).toBe(true);
    expect(m.chiTiet.rong, size.name).toBeGreaterThanOrEqual(MIN_DETAIL_WIDTH);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard/jobs");
  await page.getByRole("button", { name: "Địa điểm" }).click();
  const menu = page.getByPlaceholder("Nhập Tỉnh/Thành phố").locator("..");
  await menu.waitFor();
  const box = (await menu.boundingBox())!;
  expect(box.x, "menu tràn trái").toBeGreaterThanOrEqual(0);
  expect(box.x + box.width, "menu tràn phải").toBeLessThanOrEqual(1440);
  await expect(page.getByRole("button", { name: "Áp dụng" })).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/dashboard/jobs");
  await page.locator("li button").first().waitFor();
  await expect(page.getByTestId("job-detail-pane")).toBeHidden();
});
