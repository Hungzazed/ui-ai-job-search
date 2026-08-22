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

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
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
