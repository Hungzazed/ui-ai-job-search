import { expect, test } from "@playwright/test";

/*
 * Kiểm nút "Xem PDF" như người dùng gặp nó.
 *
 * KHÔNG canh theo `popup.url()`: blob PDF được Chromium mở bằng plugin xem PDF, và
 * ở tab đó `url()` trả về chuỗi rỗng — cách đo đó sai chứ không phải app sai. Thay
 * vào đó chặn `window.open` để lấy đúng URL nút truyền vào, rồi đọc lại chính blob
 * đó trong trang để xem có phải PDF thật.
 */
test("nut Xem PDF mo duoc ban PDF", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@aijob.local");
  await page.getByLabel("Mật khẩu").fill("MatKhauTest123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/cv-optimizer");

  await page.addInitScript(() => {
    // Ghi lại URL thay vì mở tab: tab PDF không đọc được từ phía test.
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = (url?: string | URL) => {
      (window as unknown as { __opened: string[] }).__opened.push(String(url));
      return null;
    };
  });
  await page.reload();

  // Khối nội dung (kèm nút PDF) chỉ hiện sau khi chọn một tài liệu, và phải là
  // tài liệu Hoàn tất — bản Thất bại không có nội dung để render.
  const done = page.getByRole("button", { name: /Hoàn tất/ }).first();
  await done.waitFor({ state: "visible", timeout: 30_000 });
  await done.click();

  const button = page.getByRole("button", { name: "Xem PDF" }).first();
  await button.waitFor({ state: "visible", timeout: 30_000 });
  await button.click();

  // Compile LaTeX mất vài giây; đợi theo điều kiện chứ không theo thời gian.
  await expect
    .poll(
      () =>
        page.evaluate(
          () => (window as unknown as { __opened: string[] }).__opened.length,
        ),
      { timeout: 120_000 },
    )
    .toBe(1);

  const opened = await page.evaluate(
    () => (window as unknown as { __opened: string[] }).__opened[0],
  );
  expect(opened).toMatch(/^blob:/);

  // Đọc lại chính blob đó: 200 và content-type đúng vẫn có thể là một file rác
  // (đã gặp đúng chuyện đó với `{"type":"Buffer"}`), nên phải xem byte đầu.
  const head = await page.evaluate(async (url: string) => {
    const response = await fetch(url);
    const bytes = new Uint8Array(await response.arrayBuffer());
    return {
      size: bytes.length,
      magic: String.fromCharCode(...bytes.slice(0, 5)),
    };
  }, opened);

  console.log("PDF mo tu nut:", head);
  expect(head.magic).toBe("%PDF-");
  expect(head.size).toBeGreaterThan(10_000);

  // Không có thông báo lỗi nào hiện ra sau khi bấm.
  await expect(page.getByText("Không tạo được PDF")).toHaveCount(0);

  await page.screenshot({
    path: "test/visual/screenshots/07-cv-xem-pdf.png",
    fullPage: true,
  });
});
