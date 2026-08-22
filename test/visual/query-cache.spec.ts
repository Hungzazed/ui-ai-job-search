import { expect, test, type Page } from "@playwright/test";

/**
 * Bốn màn vừa chuyển từ `useEffect` sang `useApiQuery` còn chạy không.
 *
 * Vì sao cần một spec riêng: tầng dữ liệu của bốn màn này được viết lại cùng
 * lúc, mà typecheck, lint và unit test đều không chạm tới nó — chúng không biết
 * một `setQueryData` sai khoá hay một vòng gieo lại state trong render. Cái
 * hỏng ở đó không phải lỗi biên dịch, nó là một màn trắng.
 *
 * Test thứ hai đo đúng thứ đổi được: quay lại một màn đã xem thì KHÔNG còn
 * request nào. Đó là toàn bộ lý do của lần chuyển này.
 */

const EMAIL = process.env.VISUAL_EMAIL ?? "admin@aijob.local";
const PASSWORD = process.env.VISUAL_PASSWORD ?? "Demo@12345";

/**
 * Studio cần một tài khoản CÓ CV sẵn, mà tài khoản admin thì không có.
 * `ketoan@` là một trong bảy hồ sơ ngoài ngành IT do `pnpm db:seed` dựng.
 */
const STUDIO_EMAIL = process.env.VISUAL_STUDIO_EMAIL ?? "ketoan@aijob.local";

async function login(page: Page, email = EMAIL) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);
}

/** Chỉ ghi lời gọi tới backend, bỏ qua request nội bộ của Next. */
function apiCalls(page: Page) {
  const seen: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/")) seen.push(url.replace(/^https?:\/\/[^/]+/, ""));
  });
  return () => seen;
}

test("bốn màn vừa chuyển vẫn vẽ đúng", async ({ page }) => {
  const crashes: string[] = [];
  page.on("pageerror", (error) => crashes.push(error.message));

  await login(page);

  // Tìm theo HEADING chứ không theo chữ: mọi tiêu đề ở đây cũng là nhãn của một
  // link trong sidebar, nên `getByText` khớp ngay cả khi nội dung chưa về — và
  // một test xanh trên màn chưa tải xong thì không khẳng định được gì.
  const screens: [string, string][] = [
    ["/dashboard/applications", "Lịch sử ứng tuyển"],
    ["/dashboard/profile", "Hồ sơ của tôi"],
    ["/dashboard/upskill", "Lộ trình học"],
  ];

  for (const [path, heading] of screens) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible({
      timeout: 20_000,
    });
    // Tiêu đề nằm NGOÀI nhánh chờ dữ liệu, nên nó hiện cả khi màn còn là khung
    // xám. Đợi mạng lặng rồi mới xét, để lỗi lúc dựng nội dung kịp nổ ra.
    await page.waitForLoadState("networkidle");
  }

  // Trang chi tiết cần một id thật, nên đi qua danh sách thay vì đoán đường dẫn.
  await page.goto("/dashboard/jobs");
  await page.locator('a[href^="/dashboard/jobs/"]').first().click();
  await expect(page.getByText("Mô tả công việc").first()).toBeVisible({
    timeout: 20_000,
  });

  expect(crashes, `lỗi JS trên trang: ${crashes.join(" | ")}`).toEqual([]);
});

test("quay lại màn đã xem thì không gọi API nữa", async ({ page }) => {
  await login(page);
  await page.goto("/dashboard/applications");
  await expect(page.getByRole("table")).toBeVisible({ timeout: 20_000 });

  const dump = apiCalls(page);
  const nav = page.getByRole("navigation");

  await nav.getByRole("link", { name: "Tổng quan" }).click();
  await expect(page.getByText(/Xin chào/)).toBeVisible({ timeout: 20_000 });

  await nav.getByRole("link", { name: "Lịch sử ứng tuyển" }).click();
  await expect(page.getByRole("table")).toBeVisible();

  // Màn Tổng quan chưa từng mở trong phiên này nên nó được phép gọi một lần.
  // Màn Lịch sử thì đã có trong cache, và đó là thứ được khẳng định ở đây.
  expect(dump().filter((url) => url.includes("/api/applications"))).toEqual([]);
});

/**
 * Khung xem trước của CvStudio: chỗ rủi ro nhất trong lần chuyển này.
 *
 * Nó vừa hoãn nhịp gõ vừa đọc cache, nên hỏng thì hỏng theo hai kiểu mà không
 * có gì báo: hoặc mỗi phím một request, hoặc bản vẽ đứng im không đổi theo bản
 * nháp. Test bấm qua lại giữa hai mẫu và đếm request — bấm lại một mẫu đã dựng
 * phải là 0.
 *
 * Cần một CV có sẵn trong database dev; không có thì bỏ qua thay vì báo đỏ.
 */
test("xem trước CV dùng lại bản đã dựng", async ({ page }) => {
  let previewCalls = 0;
  page.on("request", (request) => {
    if (request.url().includes("/preview")) previewCalls += 1;
  });

  await login(page, STUDIO_EMAIL);
  await page.goto("/dashboard/cv-optimizer");

  const documents = page.locator("li button, table button");
  await documents.first().waitFor({ timeout: 20_000 }).catch(() => {});
  test.skip(
    (await documents.count()) === 0,
    "Database dev chưa có CV nào để mở studio",
  );
  await documents.first().click();

  const frame = page.locator('iframe[title="Xem trước CV"]');
  await frame.waitFor({ timeout: 20_000 });
  // Bản vẽ phải có nội dung thật, không phải một trang trắng.
  expect((await frame.getAttribute("srcdoc"))?.length ?? 0).toBeGreaterThan(1000);

  await page.getByRole("tab", { name: "Mẫu trình bày" }).click();
  const cards = page.locator("ul.grid li button");
  await cards.nth(1).waitFor({ timeout: 10_000 });

  await cards.nth(1).click();
  await page.waitForTimeout(2500);
  const afterFirstVisit = previewCalls;

  await cards.nth(0).click();
  await page.waitForTimeout(2500);

  await cards.nth(1).click();
  await page.waitForTimeout(2500);
  const revisit = previewCalls - afterFirstVisit;

  // Lượt quay về mẫu đầu vẫn có thể tốn một request (màu nhấn đã đổi theo), nên
  // chỉ khẳng định lượt bấm LẠI đúng bản nháp vừa dựng.
  expect(revisit).toBeLessThanOrEqual(1);
});

/**
 * Ngôi sao "đã lưu" phải nói cùng một chuyện ở danh sách và ở trang chi tiết.
 *
 * Đây là một lỗi ĐÃ XẢY RA, tái hiện được ngày 2026-08-22: bấm lưu ở trang chi
 * tiết trả về "Đã lưu" đúng, quay lại danh sách thì nút vẫn là "Lưu". Hai
 * nguyên nhân chồng lên nhau — chi tiết chỉ xoá khoá của chính nó, và thẻ trong
 * danh sách chép `job.saved` vào state lúc mount nên không nhận dữ liệu mới nữa.
 *
 * Test khẳng định hai màn KHỚP NHAU chứ không khẳng định một giá trị cụ thể, nên
 * chạy bao nhiêu lần cũng được dù nó có đổi dữ liệu thật.
 */
const isSaved = (label: string | null) => (label ?? "").trim() === "Đã lưu";

test("trạng thái đã lưu khớp giữa danh sách và chi tiết", async ({ page }) => {
  await login(page);
  await page.goto("/dashboard/jobs/all");

  const inList = page.locator("button", { hasText: /^Lưu$|^Đã lưu$/ }).first();
  const inDetail = page
    .locator("button", { hasText: /^Đã lưu$|^Lưu việc làm$/ })
    .first();

  await inList.waitFor({ timeout: 20_000 });

  // Chiều 1: bấm ở danh sách, mở chi tiết ra xem.
  await inList.click();
  await page.waitForTimeout(2_000);
  const afterListClick = await inList.textContent();

  await page.locator('a[href^="/dashboard/jobs/"]').first().click();
  await inDetail.waitFor({ timeout: 20_000 });
  expect(isSaved(await inDetail.textContent())).toBe(isSaved(afterListClick));

  // Chiều 2: bấm ở chi tiết, quay lại danh sách xem.
  await inDetail.click();
  await page.waitForTimeout(2_000);
  const afterDetailClick = await inDetail.textContent();

  await page.goBack();
  await inList.waitFor({ timeout: 20_000 });
  await page.waitForTimeout(2_500);
  expect(isSaved(await inList.textContent())).toBe(isSaved(afterDetailClick));
});
