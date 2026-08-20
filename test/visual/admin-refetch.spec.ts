import { expect, test } from "@playwright/test";

/*
 * Màn Admin có ba thứ cùng dựa vào `useAsyncData`: `load = null` cho tới khi biết
 * vai trò, đổi tab khoảng thời gian phải tải lại, và nút Tải lại của bảng quét
 * dùng `reload()`.
 *
 * ĐẾM REQUEST là phần chính. `useAsyncData` dừng vòng lặp bằng một phép so sánh
 * (`loadedFor === load`); sai chỗ đó thì màn hình vẫn trông đúng nhưng gọi API
 * không ngừng, và không ảnh chụp nào thấy được điều đó.
 *
 * Lưu ý khi đọc số: ở chế độ dev, React Strict Mode gọi effect HAI lần mỗi lần
 * mount, nên `scrape/runs` xuất hiện 2 lần lúc vào trang. Vì thế các phép khẳng
 * định dưới đây đếm những lượt SAU khi vào, không đếm lượt mount.
 */
test("man Admin: doi khoang thoi gian tai lai dung mot lan", async ({
  page,
}) => {
  const calls: string[] = [];
  page.on("request", (r) => {
    const url = r.url();
    if (url.includes("/api/admin") || url.includes("/api/scrape")) {
      calls.push(url.replace(/^.*\/api\//, ""));
    }
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Bảng điều khiển vận hành" }),
  ).toBeVisible({ timeout: 30_000 });

  // Chờ bảng quét tải xong rồi mới chốt mốc đếm.
  await expect(page.getByRole("button", { name: /Tải lại/ })).toBeEnabled();
  await page.waitForTimeout(1500);
  const sauKhiVao = [...calls];
  console.log("Sau khi vao:", JSON.stringify(sauKhiVao));

  // Đổi khoảng thời gian: chỉ số liệu AI tải lại, KHÔNG kéo theo bảng quét.
  calls.length = 0;
  await page.getByRole("tab", { name: "30 ngày" }).click();
  await page.waitForTimeout(2500);
  console.log("Sau khi doi 30 ngay:", JSON.stringify(calls));

  const health = calls.filter((c) => c.startsWith("admin/ai-health"));
  expect(health).toHaveLength(1);
  expect(health[0]).toContain("days=30");
  expect(calls.filter((c) => c.startsWith("scrape"))).toHaveLength(0);

  // Nút Tải lại của bảng quét: đúng một request.
  calls.length = 0;
  await page.getByRole("button", { name: /Tải lại/ }).click();
  await page.waitForTimeout(2000);
  console.log("Sau khi bam Tai lai:", JSON.stringify(calls));
  expect(calls.filter((c) => c.startsWith("scrape/runs"))).toHaveLength(1);

  await page.screenshot({
    path: "test/visual/screenshots/09-admin-30-ngay.png",
    fullPage: true,
  });
});
