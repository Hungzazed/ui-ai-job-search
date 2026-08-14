import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Chụp ảnh từng màn hình để xem BỐ CỤC.
 *
 * Vì sao cần: bảy màn hình đã được dựng và tất cả đều xanh ở typecheck, lint,
 * unit test và build — nhưng không một kiểm tra nào trong số đó thấy được khoảng
 * cách sai, chữ tràn, hay một khối trống ở giữa trang.
 *
 * Yêu cầu trước khi chạy: backend ở :4000 và frontend ở :3000 đã lên, và có sẵn
 * tài khoản dưới đây. Xem README mục "Kiểm bố cục".
 */

/*
 * Mặc định là một tài khoản trong DB **dev** (`aijob`), không phải DB test.
 *
 * Lần chạy đầu tiên dùng một tài khoản chỉ có trong `aijob_test` — một DB gần như
 * trống — nên mọi ảnh chụp đều là trạng thái RỖNG, và bộ kiểm báo xanh mà chưa
 * từng xem bố cục lúc có dữ liệu. Trạng thái rỗng đáng xem, nhưng nó không phải
 * thứ cần xem. Tài khoản này có 48 việc đã chấm điểm, 6 đơn ứng tuyển ở 6 trạng
 * thái khác nhau, và 20 lượt quét cho màn quản trị.
 *
 * Vai ADMIN là bắt buộc: `/admin` chặn theo vai.
 */
const EMAIL = process.env.VISUAL_EMAIL ?? "admin@aijob.local";
const PASSWORD = process.env.VISUAL_PASSWORD ?? "MatKhauTest123!";
const SHOTS = "test/visual/screenshots";

/** Chuỗi cho thấy trang đã vỡ, chứ không phải đang tải. */
const BROKEN = [
  "Application error",
  "Unhandled Runtime Error",
  "This page could not be found",
];

/**
 * Dữ liệu bịa đã bị gỡ. Nếu chúng quay lại, ảnh chụp là chỗ thấy đầu tiên.
 *
 * CỐ Ý không canh tên hiển thị "Nguyễn Minh An" của hồ sơ mock cũ: DB dev có một
 * user seed thật trùng đúng tên đó, nên canh theo tên sẽ đỏ vì dữ liệu thật. Địa
 * chỉ email "minhan.nguyen" thì chỉ tồn tại trong bản mock, nên nó mới là dấu vết
 * nhận diện đúng.
 */
const REMOVED_MOCKS = [
  "minhan.nguyen",
  "Agent Engine",
  "Nâng cấp Pro",
  // Nhãn chấm-xanh trên thẻ gợi ý. Chữ cứng nên không bao giờ phản ánh trạng
  // thái thật, và những gợi ý đó do SQL suy ra chứ không do model sinh.
  "Real-time Engine",
];

const SCREENS = [
  { path: "/dashboard", name: "01-dashboard" },
  { path: "/dashboard/jobs", name: "01b-jobs-matched" },
  { path: "/dashboard/jobs/all", name: "01c-jobs-all" },
  { path: "/dashboard/applications", name: "02-applications" },
  { path: "/dashboard/interview", name: "03-interview" },
  { path: "/dashboard/upskill", name: "04-upskill" },
  { path: "/dashboard/profile/upload", name: "04b-doc-cv" },
  { path: "/dashboard/settings", name: "05-settings" },
  { path: "/admin", name: "06-admin" },
];

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

test("chụp các trang công khai", async ({ page }) => {
  for (const { path, name } of [
    { path: "/login", name: "00-login" },
    { path: "/register", name: "00-register" },
  ]) {
    await page.goto(path);
    await expect(page.locator("form")).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
  }
});

test("chụp các màn sau khi đăng nhập", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  // "Failed to load resource: 404" trên console KHÔNG nói request nào hỏng, nên
  // một mình nó không dò được. Bắt ở tầng response mới có URL.
  page.on("response", (response) => {
    if (response.status() >= 400) {
      consoleErrors.push(`HTTP ${response.status()} ${response.url()}`);
    }
  });

  await login(page);

  for (const { path, name } of SCREENS) {
    await page.goto(path);

    // Đợi skeleton biến mất chứ không đợi theo thời gian cố định: ảnh chụp đúng
    // lúc skeleton còn đó thì vô dụng cho việc xem bố cục. Có `.catch` vì vài
    // màn không có skeleton nào.
    await page
      .locator(".animate-pulse")
      .first()
      .waitFor({ state: "detached", timeout: 15_000 })
      .catch(() => undefined);

    // `innerText` chứ không `textContent`: textContent đọc cả nội dung thẻ
    // <script>, và Next nhúng RSC payload vào mọi trang dev — trong đó có định
    // nghĩa trang 404 với chuỗi "This page could not be found". Dùng textContent
    // thì mọi trang đều trông như đã vỡ.
    const body = await page.evaluate(() => document.body.innerText);
    for (const broken of BROKEN) expect(body).not.toContain(broken);
    for (const mock of REMOVED_MOCKS) expect(body).not.toContain(mock);

    await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
  }

  // Lỗi console không làm test đỏ nhưng phải hiện ra: chúng là nơi lỗi hydration
  // và request hỏng lộ diện, mà cả hai đều không thấy được trên ảnh chụp.
  if (consoleErrors.length) {
    console.log("\n--- Lỗi console ---");
    for (const error of consoleErrors.slice(0, 10)) console.log("  ", error);
  }
});

test("ô đổi trạng thái với tới được ở cỡ desktop", async ({ page }) => {
  /*
   * Bảng Lịch sử ứng tuyển có cột cuối là <select> đổi trạng thái — control duy
   * nhất trên màn hình đó. Khi cột Địa điểm còn in nguyên địa chỉ thô, bảng rộng
   * quá khung và cột này bị đẩy ra ngoài vùng thấy được.
   *
   * Không kiểm "có tràn ngang hay không": vùng cuộn của bảng CÓ QUYỀN cuộn, đó là
   * thiết kế. Điều phải đúng là control quan trọng nhất nằm trong vùng thấy được
   * ngay khi mở, không phải sau khi người dùng đoán ra là có thể cuộn ngang.
   */
  await login(page);
  await page.goto("/dashboard/applications");
  await page.locator("table select").first().waitFor();

  const reach = await page.evaluate(() => {
    const select = document.querySelector("table select");
    if (!select) return null;
    const box = select.getBoundingClientRect();
    return { right: Math.round(box.right), viewport: window.innerWidth };
  });

  expect(reach).not.toBeNull();
  expect(
    reach!.right,
    `ô đổi trạng thái kết thúc ở ${reach!.right}px, khung rộng ${reach!.viewport}px`,
  ).toBeLessThanOrEqual(reach!.viewport);
});

test("chụp bố cục điện thoại", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);

  /*
   * Không dùng `slice(0, 4)` nữa: màn "Đọc hồ sơ từ CV" là bố cục hai cột dày (đề
   * xuất cạnh giá trị hiện tại) nên nó chính là màn dễ vỡ nhất trên điện thoại —
   * đúng thứ cần kiểm mà lại nằm ngoài 4 màn đầu.
   *
   * Vẫn không chụp hết mọi màn ở cỡ điện thoại: lượt chụp dài thêm mỗi màn, và
   * những màn còn lại dùng chung một khung bảng đã được kiểm ở đây.
   */
  const MOBILE = [
    "01-dashboard",
    "01b-jobs-matched",
    "02-applications",
    "04b-doc-cv",
  ];

  for (const { path, name } of SCREENS.filter((screen) =>
    MOBILE.includes(screen.name),
  )) {
    await page.goto(path);
    await page
      .locator(".animate-pulse")
      .first()
      .waitFor({ state: "detached", timeout: 15_000 })
      .catch(() => undefined);

    // Không được có thanh cuộn ngang: `globals.css` đặt `overflow-x: clip` theo
    // đúng một tiêu chí của hệ thống thiết kế, và đây là chỗ kiểm nó thật.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `${path} tràn ngang ${overflow}px`).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: `${SHOTS}/${name}-mobile.png`,
      fullPage: true,
    });
  }
});
