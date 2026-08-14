import { describe, expect, test } from "vitest";
import {
  failureMessage,
  isWorthRetrying,
  type AiFailureKind,
} from "@/lib/failure-message";

const ALL_KINDS: AiFailureKind[] = ["SCHEMA", "TIMEOUT", "UPSTREAM", "OTHER"];

describe("failureMessage", () => {
  test("mỗi phân loại có một câu riêng, không câu nào trùng nhau", () => {
    // Bốn phân loại dẫn tới ba hành động khác nhau. Nếu hai câu trùng nhau thì
    // việc backend phân loại trở thành vô nghĩa ở phía người dùng.
    const messages = ALL_KINDS.map(failureMessage);
    expect(new Set(messages).size).toBe(ALL_KINDS.length);
  });

  test("không câu nào lộ chi tiết nội bộ", () => {
    // Đây chính là thứ đã hiện cho người dùng trước khi có bảng này.
    const forbidden = [
      "AI_",
      "APICallError",
      "provider",
      "Console",
      "attempts",
      "schema",
    ];
    for (const kind of ALL_KINDS) {
      const message = failureMessage(kind);
      for (const word of forbidden) {
        expect(
          message.toLowerCase().includes(word.toLowerCase()),
          `câu của ${kind} chứa "${word}": ${message}`,
        ).toBe(false);
      }
    }
  });

  test("mỗi câu đều nói bước tiếp theo", () => {
    for (const kind of ALL_KINDS) {
      const message = failureMessage(kind);
      expect(
        /thử lại|báo lại/i.test(message),
        `câu của ${kind} không nói người dùng nên làm gì: ${message}`,
      ).toBe(true);
    }
  });

  test("không có phân loại thì nói thẳng là không rõ, không đoán", () => {
    const message = failureMessage(null);
    expect(message).toContain("không ghi được lý do");
    expect(failureMessage(undefined)).toBe(message);
  });
});

describe("isWorthRetrying", () => {
  test("lỗi cấu trúc thì bấm lại cũng hỏng tiếp, nên không mời thử lại", () => {
    expect(isWorthRetrying("SCHEMA")).toBe(false);
  });

  test("các lỗi tạm thời thì nên mời thử lại", () => {
    expect(isWorthRetrying("TIMEOUT")).toBe(true);
    expect(isWorthRetrying("UPSTREAM")).toBe(true);
    expect(isWorthRetrying("OTHER")).toBe(true);
    expect(isWorthRetrying(null)).toBe(true);
  });
});
