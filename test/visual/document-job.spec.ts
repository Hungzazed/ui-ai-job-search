import { expect, test } from "@playwright/test";

/*
 * Kiểm máy trạng thái `useDocumentJob` sau khi `phase` chuyển từ state sang suy ra.
 *
 * Không gọi AI: bấm vào các dòng trong Lịch sử là đủ để đi qua `open()` → đọc bản
 * ghi → suy `phase`. Dev DB có cả dòng Hoàn tất và dòng Thất bại, tức là cả hai
 * nhánh kết thúc đều đi được.
 */
test("mo tai lieu Hoan tat va That bai, phase phai theo dung ban ghi", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/cv-optimizer");

  // --- Dòng Hoàn tất: phải hiện nội dung CV và nút Xem PDF ---
  await page.getByRole("button", { name: /Hoàn tất/ }).first().click();
  await expect(page.getByRole("button", { name: "Xem PDF" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Đang tạo…")).toHaveCount(0);

  // --- Dòng Thất bại: phải hiện lý do, KHÔNG treo ở "đang sinh" ---
  await page.getByRole("button", { name: /Thất bại/ }).first().click();

  // Câu của failureMessage cho một tác vụ thất bại. Chờ theo điều kiện; nếu máy
  // trạng thái treo ở "generating" thì chỗ này hết giờ và đó đúng là lỗi cần bắt.
  await expect(
    page.getByText(/thử lại|báo lại|giới hạn|cấu trúc/i).first(),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Xem PDF" })).toHaveCount(0);

  // --- Bấm lại dòng Hoàn tất: quay về được, không kẹt ở trạng thái lỗi ---
  await page.getByRole("button", { name: /Hoàn tất/ }).first().click();
  await expect(page.getByRole("button", { name: "Xem PDF" })).toBeVisible({
    timeout: 30_000,
  });

  await page.screenshot({
    path: "test/visual/screenshots/08-doc-job-states.png",
    fullPage: true,
  });

  const real = errors.filter((e) => !e.includes("404"));
  expect(real, `lỗi console: ${real.join(" | ")}`).toEqual([]);
});
