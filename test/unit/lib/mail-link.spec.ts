import { describe, expect, test } from "vitest";
import { gmailComposeUrl } from "@/lib/mail-link";

/**
 * Module này tồn tại vì một phép đo: lá mail hệ thống sinh ra dài 1.151 ký tự,
 * và `mailto:` của nó dài 3.364 — tiếng Việt có dấu nở gấp ba khi percent-encode.
 * Trình xử lý mail trên Windows cắt cụt ở khoảng 2.048 mà không báo gì.
 */
const VIETNAMESE_BODY = [
  "Kính gửi Bộ phận Tuyển dụng Công ty Cổ phần Thương mại Minh Long,",
  "Với 5 năm kinh nghiệm kế toán tổng hợp tại doanh nghiệp thương mại, tôi nắm vững nghiệp vụ cần cho vị trí này.",
  "Trân trọng,",
].join("\n\n");

describe("gmailComposeUrl", () => {
  test("ghép cả tiêu đề lẫn thân mail vào query", () => {
    const url = gmailComposeUrl({
      subject: "Ứng tuyển vị trí Kế toán tổng hợp",
      body: VIETNAMESE_BODY,
    });

    expect(url).toContain("https://mail.google.com/mail/?view=cm");
    expect(url).toContain(encodeURIComponent("Ứng tuyển vị trí"));
    expect(url).toContain(encodeURIComponent("Kính gửi Bộ phận Tuyển dụng"));
  });

  /// Chính là trường hợp bản `mailto:` cũ chết: URL nở gấp ba vì dấu tiếng Việt.
  test("một lá mail tiếng Việt cỡ thật vẫn mở được", () => {
    const body = VIETNAMESE_BODY.repeat(4);

    expect(body.length).toBeGreaterThan(700);
    expect(gmailComposeUrl({ subject: "Ứng tuyển", body })).not.toBeNull();
  });

  test("thiếu tiêu đề vẫn mở được, chỉ là ô chủ đề trống", () => {
    const url = gmailComposeUrl({ subject: null, body: "Xin chào" });

    expect(url).toContain("&su=&");
  });

  /// Trả null để nơi gọi ẩn nút đi. Một cái nút mở ra bản thiếu chữ tệ hơn một
  /// cái nút vắng mặt, vì không ai kiểm lại thứ máy đã điền sẵn.
  test("nội dung quá dài thì KHÔNG trả về URL cụt", () => {
    expect(
      gmailComposeUrl({ subject: "Dài", body: "Tôi ứng tuyển. ".repeat(2000) }),
    ).toBeNull();
  });

  test("thân mail rỗng thì không có gì để mở", () => {
    expect(gmailComposeUrl({ subject: "Có tiêu đề", body: "   " })).toBeNull();
  });
});
