import { describe, expect, test } from "vitest";
import { VERDICT_LABELS, isBriefPending } from "@/lib/company-brief";

/// Máy trạng thái của nút "Tìm hiểu / Làm mới". Sai ở đây thì hoặc nút quay mãi
/// không dừng, hoặc báo xong ngay khi vừa bấm — cả hai đều không có lỗi nào.
describe("isBriefPending", () => {
  test("chưa bấm gì thì không chờ", () => {
    expect(isBriefPending(undefined, null)).toBe(false);
    expect(isBriefPending(undefined, "2026-08-24T00:00:00Z")).toBe(false);
  });

  test("tra lần đầu: chờ tới khi có bản đầu tiên", () => {
    expect(isBriefPending(null, null)).toBe(true);
    expect(isBriefPending(null, "2026-08-24T00:00:00Z")).toBe(false);
  });

  test("làm mới: bản cũ còn đó không được tính là xong", () => {
    const old = "2026-06-01T00:00:00Z";

    expect(isBriefPending(old, old)).toBe(true);
    expect(isBriefPending(old, "2026-08-24T00:00:00Z")).toBe(false);
  });
});

describe("VERDICT_LABELS", () => {
  test("phủ đủ năm kết luận backend có thể trả về", () => {
    expect(Object.keys(VERDICT_LABELS).sort()).toEqual([
      "MIXED",
      "NEGATIVE",
      "NO_REVIEWS_YET",
      "POSITIVE",
      "UNKNOWN",
    ]);
  });

  test("mỗi kết luận có nhãn tiếng Việt riêng", () => {
    const labels = Object.values(VERDICT_LABELS).map((v) => v.label);
    expect(new Set(labels).size).toBe(5);
  });

  /// Hai nhãn này rất dễ bị gộp lại thành một, mà chúng nói hai chuyện khác
  /// hẳn nhau: "có trang nhưng chưa ai viết" so với "không tra ra gì".
  test("phân biệt chưa-ai-đánh-giá với chưa-đủ-dữ-liệu", () => {
    expect(VERDICT_LABELS.NO_REVIEWS_YET.label).not.toBe(
      VERDICT_LABELS.UNKNOWN.label,
    );
    expect(VERDICT_LABELS.NO_REVIEWS_YET.variant).not.toBe(
      VERDICT_LABELS.UNKNOWN.variant,
    );
  });
});
