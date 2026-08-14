import { expect, test } from "@playwright/test";
import { waitForImages } from "./support";

/*
 * Assisted Apply, chạy THẬT: worker mở Chromium trong container, tải một form ứng
 * tuyển công khai, điền, chụp ảnh. Vì vậy test này cần Docker + ảnh `aijob-browser`
 * + Internet, và nó chậm (~15-20 giây).
 *
 * Nó trả lời câu mà e2e của backend KHÔNG trả lời được: người dùng bấm một nút trên
 * màn hình thì có nhận được ảnh chụp và danh sách trường đã điền hay không.
 *
 * Tin `gh-demo-1` trong DB dev trỏ tới một form Greenhouse công khai. Với 4 portal
 * Việt thì kết luận đúng là LOGIN_WALL, nên không dùng chúng cho test này.
 *
 * ĐÃ THẤY NÓ CHẬP CHỜN: một lượt chạy nó hết giờ ở bước chờ kết luận, lượt sau xong
 * trong 30 giây. Nó phụ thuộc ba thứ ngoài tầm kiểm soát — Docker khởi container lạnh,
 * mạng, và một trang web của người khác — nên đừng coi một lần đỏ là hồi quy trước khi
 * xem log backend. Phần logic thuần đã được ghim ở `server/test/unit/modules/apply/`
 * và `server/test/assisted-apply.e2e-spec.ts`, những chỗ không phụ thuộc gì bên ngoài.
 */
const JOB_ID = "gh-demo-1";

test("dien ho so tu dong roi chup anh, va KHONG co nut nop", async ({
  page,
}) => {
  test.setTimeout(180_000);

  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@aijob.local");
  await page.getByLabel("Mật khẩu").fill("MatKhauTest123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto(`/dashboard/jobs/${JOB_ID}`);

  const card = page.getByRole("heading", { name: "Điền hồ sơ tự động" });
  await card.waitFor({ timeout: 30_000 });

  await page.getByRole("button", { name: /Điền thử|Chạy lại/ }).click();

  // Chờ kết luận, không chờ theo thời gian cố định. Worker mất ~10 giây.
  const badge = page.getByText(/Đã điền sẵn|Trang đòi đăng nhập|Không thấy form/);
  await badge.waitFor({ timeout: 120_000 });

  const outcome = (await badge.first().textContent())?.trim();
  console.log("ket luan:", outcome);

  // Form Greenhouse là công khai nên phải điền được.
  expect(outcome).toBe("Đã điền sẵn");

  // Những trường lấy từ hồ sơ phải hiện ra để người dùng đối chiếu được.
  await expect(page.getByText("admin@aijob.local").first()).toBeVisible();
  await expect(page.getByText("0901234567").first()).toBeVisible();

  // Ảnh chụp phải tải được và có kích thước thật.
  const shot = page.getByAltText(/Ảnh chụp trang tuyển dụng/);
  await shot.waitFor({ timeout: 60_000 });
  const size = await shot.evaluate((el: HTMLImageElement) => ({
    w: el.naturalWidth,
    h: el.naturalHeight,
  }));
  console.log("anh chup:", size);
  expect(size.w).toBeGreaterThan(500);
  expect(size.h).toBeGreaterThan(500);

  /*
   * Phép khẳng định quan trọng nhất: KHÔNG có nút nào nộp hồ sơ.
   *
   * Nút duy nhất dẫn tới việc nộp là "Mở trang để nộp" — nó mở trang thật cho người
   * dùng tự bấm. "Tôi đã tự nộp" chỉ ghi lại lời khẳng định của họ.
   */
  const buttons = await page.getByRole("button").allInnerTexts();
  const nopHo = buttons.filter((text) => /^nộp|gửi hồ sơ|submit/i.test(text.trim()));
  expect(nopHo, `nút đáng ngờ: ${nopHo.join(", ")}`).toEqual([]);

  await expect(page.getByRole("button", { name: "Tôi đã tự nộp" })).toBeVisible();

  await waitForImages(page);
  await page.screenshot({
    path: "test/visual/screenshots/11-assisted-apply.png",
    fullPage: true,
  });

  // Xác nhận đã tự nộp: nhãn phải đổi, và nút xác nhận biến mất.
  await page.getByRole("button", { name: "Tôi đã tự nộp" }).click();
  await expect(page.getByText("Bạn đã xác nhận tự nộp")).toBeVisible({
    timeout: 15_000,
  });
});
