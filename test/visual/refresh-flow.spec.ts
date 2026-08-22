import { expect, test, type Page } from "@playwright/test";

/**
 * Luồng làm mới token, kiểm trên trình duyệt thật.
 *
 * Đây KHÔNG phải test bố cục như các file còn lại trong thư mục này; nó ở đây
 * vì cần một trình duyệt thật, và ba điều nó kiểm không có chỗ nào khác kiểm
 * được:
 *
 * 1. Bộ e2e của backend gọi HTTP trực tiếp nên không có kho cookie — nó không
 *    thấy được việc trình duyệt vứt cookie hết hạn.
 * 2. `middleware.ts` chỉ chạy trong runtime của Next, không nằm trong tầm với
 *    của jest.
 * 3. Việc gom lời gọi refresh chỉ lộ ra khi có NHIỀU request song song cùng
 *    hỏng — đúng thứ mà một lời gọi curl không dựng lại được.
 *
 * Không chờ 15 phút: xoá cookie `aijob_token` khỏi context chính là điều trình
 * duyệt làm khi access token hết hạn. Hai cookie kia còn nguyên, đúng trạng
 * thái của người dùng đang đăng nhập hợp lệ sau 15 phút không thao tác.
 *
 * Cần cả hai server đang chạy và `pnpm db:seed` đã chạy — xem README.
 */

const login = async (page: Page) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("admin@aijob.local");
  await page.getByLabel(/mật khẩu/i).fill("Demo@12345");
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 60_000 });
  await page.waitForLoadState("networkidle");
};

/** Ghi lại mọi lời gọi API và mọi lần chuyển trang, kèm mốc thời gian. */
const watch = (page: Page) => {
  const api: { status: number; path: string }[] = [];
  const navigations: string[] = [];

  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/api/")) {
      api.push({
        status: response.status(),
        path: new URL(url).pathname.replace("/api", ""),
      });
    }
  });
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) navigations.push(frame.url());
  });

  return {
    navigations,
    of: (path: string) => api.filter((c) => c.path === path),
    unauthorized: () => api.filter((c) => c.status === 401),
  };
};

test.describe("access token hết hạn", () => {
  test.beforeEach(async ({ page, context }) => {
    await login(page);

    const cookies = await context.cookies();
    expect(cookies.map((c) => c.name)).toEqual(
      expect.arrayContaining(["aijob_token", "aijob_refresh", "aijob_session"]),
    );

    // Giả lập hết hạn: trình duyệt tự vứt cookie khi quá maxAge.
    await context.clearCookies();
    await context.addCookies(cookies.filter((c) => c.name !== "aijob_token"));
  });

  /**
   * Tải lại cả trang là kịch bản KHẮT KHE NHẤT, vì chỉ ở đây `SessionProvider`
   * mới chạy lại và gọi `/auth/me`.
   *
   * Bản đầu của interceptor loại `/auth/me` khỏi danh sách thử lại, nên lời gọi
   * đó nhận 401 rồi `SessionProvider` đá thẳng về `/login` — trong khi những
   * request khác trên cùng trang đã làm mới token xong xuôi và trả 200. Cú
   * chuyển trang xảy ra SAU `networkidle` khoảng nửa giây, nên một bài test
   * assert ngay sau `networkidle` vẫn xanh. Đó là lý do có `waitForTimeout`
   * bên dưới và lý do phải soi cả `navigations`.
   */
  test("tải lại trang thì tự làm mới, KHÔNG bị đá về /login", async ({
    page,
  }) => {
    const seen = watch(page);

    await page.reload();
    await page.waitForLoadState("networkidle", { timeout: 60_000 });
    await page.waitForTimeout(3000);

    expect(seen.navigations.filter((url) => url.includes("/login"))).toEqual(
      [],
    );
    expect(page.url()).toContain("/dashboard");

    // `/auth/me` phải KẾT THÚC ở 200: nó là lời gọi khôi phục phiên, và nó
    // phải được thử lại sau khi token được làm mới.
    const me = seen.of("/auth/me");
    expect(me.length).toBeGreaterThan(0);
    expect(me.at(-1)?.status).toBe(200);
  });

  test("mở thẳng một trang khác cũng không bị đá ra", async ({ page }) => {
    const seen = watch(page);

    await page.goto("/dashboard/profile");
    await page.waitForLoadState("networkidle", { timeout: 60_000 });
    await page.waitForTimeout(3000);

    expect(seen.navigations.filter((url) => url.includes("/login"))).toEqual(
      [],
    );
    expect(page.url()).toContain("/dashboard/profile");
    expect(seen.of("/auth/me").at(-1)?.status).toBe(200);
  });

  /**
   * Điểm sống còn: khung dashboard bắn nhiều request song song nên NHIỀU cái
   * cùng nhận 401, nhưng chỉ được có ĐÚNG MỘT lượt gọi refresh. Không gom lại
   * thì mỗi request hỏng lại kéo theo một lượt refresh riêng.
   */
  test("nhiều request cùng 401 chỉ sinh ĐÚNG MỘT lượt refresh", async ({
    page,
    context,
  }) => {
    const seen = watch(page);

    await page.reload();
    await page.waitForLoadState("networkidle", { timeout: 60_000 });
    await page.waitForTimeout(3000);

    expect(seen.unauthorized().length).toBeGreaterThan(1);
    expect(seen.of("/auth/refresh")).toEqual([
      { status: 200, path: "/auth/refresh" },
    ]);

    const renewed = await context.cookies();
    expect(renewed.find((c) => c.name === "aijob_token")).toBeTruthy();
  });
});
