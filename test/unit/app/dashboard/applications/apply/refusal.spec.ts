import { describe, expect, test } from "vitest";
import { refusalKind } from "@/app/dashboard/applications/apply/refusal";

/**
 * Bốn cách một lần tạo đơn không thành, và chỉ MỘT trong bốn là sự cố.
 *
 * Ba trường hợp còn lại là kết luận của backend về tình trạng hồ sơ, mỗi cái dẫn
 * người dùng đi một hướng khác nhau. Gộp chung thành một hộp đỏ "có lỗi" thì người
 * dùng không biết làm gì tiếp — nên phân loại sai ở đây là lỗi trải nghiệm, không
 * chỉ là lỗi kỹ thuật.
 */
describe("refusalKind", () => {
  test("409 là trùng đơn, bất kể thông báo hay cờ eligibility", () => {
    expect(refusalKind(409, "", null)).toBe("duplicate");
    expect(refusalKind(409, "không đủ điều kiện", "FAIL")).toBe("duplicate");
  });

  test("mã khác 400 và 409 đều là sự cố", () => {
    expect(refusalKind(500, "Internal Server Error", "PASS")).toBe("failed");
    expect(refusalKind(403, "Forbidden", "PASS")).toBe("failed");
  });

  /// Không có mã trạng thái nghĩa là request không tới được máy chủ. Đó là sự cố,
  /// không phải kết luận về hồ sơ - và người dùng cần được bảo "thử lại", không
  /// phải "bạn không đủ điều kiện".
  test("thiếu mã trạng thái (mất mạng) là sự cố", () => {
    expect(refusalKind(undefined, "Network Error", null)).toBe("failed");
  });

  describe("400 — backend dùng CHUNG một mã cho hai tình huống khác nhau", () => {
    test("cờ eligibility FAIL thì là không đủ điều kiện", () => {
      expect(refusalKind(400, "Không tạo được đơn", "FAIL")).toBe("ineligible");
    });

    /// Bản ghi cũ chưa có cờ eligibility: lúc đó chỉ còn câu chữ để dò.
    test("cờ trống nhưng thông báo nói không đủ điều kiện", () => {
      expect(
        refusalKind(400, "Công việc này không đủ điều kiện ứng tuyển", null),
      ).toBe("ineligible");
    });

    test("cờ PASS và thông báo không liên quan thì là chưa chấm điểm", () => {
      expect(refusalKind(400, "Chưa chấm điểm công việc này", "PASS")).toBe(
        "not-scored",
      );
    });

    test("cờ UNVERIFIED vẫn là chưa chấm điểm", () => {
      expect(refusalKind(400, "Chưa chấm điểm công việc này", "UNVERIFIED")).toBe(
        "not-scored",
      );
    });

    /// Ghim lại một hành vi mà docblock của tệp nguồn nói KHÔNG chính xác. Ở đó
    /// viết "chỉ khi cờ không nói gì mới phải dò trong thông báo", nhưng code dò
    /// thông báo trong mọi trường hợp, nên câu chữ THẮNG cả khi cờ nói PASS.
    ///
    /// Và như vậy mới đúng: cờ `eligibility` là dữ liệu client tải từ trước, còn
    /// thông báo đến từ chính lần gọi vừa rồi. Nếu tin đã được chấm lại thành FAIL
    /// ở phía máy chủ sau khi client tải danh sách, thông báo mới là thứ đúng.
    /// Đừng "sửa" thứ tự này cho khớp docblock — sửa docblock thì đúng hơn.
    test("thông báo thắng cờ PASS đã lạc hậu", () => {
      expect(refusalKind(400, "không đủ điều kiện", "PASS")).toBe("ineligible");
    });
  });
});
