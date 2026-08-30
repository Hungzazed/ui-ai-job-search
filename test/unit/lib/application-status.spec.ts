import { describe, expect, test } from "vitest";
import type { ApplicationStatus } from "@/types";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_VARIANTS,
  NEXT_STATUSES,
} from "@/lib/application-status";

const ALL_STATUSES = Object.keys(
  APPLICATION_STATUS_LABELS,
) as ApplicationStatus[];

/**
 * Sao lại từ `FINAL_STATUSES` và `OPEN_STATUSES` của backend
 * (`modules/applications/transitions.ts`).
 *
 * Chép lại chứ không import được vì hai repo tách rời. Nếu backend đổi danh sách
 * này thì test dưới đây không tự biết - nhưng nó vẫn có giá trị: nó khoá lại lời
 * hứa "đơn đã đóng luôn có đường quay lại", thứ mà bảng gợi ý dễ vô tình đánh mất.
 */
const FINAL_STATUSES: ApplicationStatus[] = ["WITHDRAWN"];

const OPEN_STATUSES: ApplicationStatus[] = ["VIEWED", "APPLIED"];

describe("NEXT_STATUSES", () => {
  test("phủ đủ ba trạng thái, không thiếu cái nào", () => {
    expect(Object.keys(NEXT_STATUSES).sort()).toEqual([...ALL_STATUSES].sort());
  });

  /// Không trạng thái nào được là ngõ cụt: người dùng đánh dấu nhầm là chuyện
  /// thường, và một giao diện không cho sửa sẽ đẩy họ sang tự tạo đơn mới cho
  /// cùng một công việc - thứ mà ràng buộc trùng đơn ở backend sẽ chặn.
  test("mọi trạng thái đều có ít nhất một bước đi tiếp", () => {
    for (const status of ALL_STATUSES) {
      expect(NEXT_STATUSES[status].length).toBeGreaterThan(0);
    }
  });

  /// Backend từ chối thẳng khi `from === to` ("Đơn đã ở trạng thái X"), nên chào
  /// mời lựa chọn đó chỉ tạo ra một lỗi chắc chắn xảy ra.
  test("không trạng thái nào gợi ý chính nó", () => {
    for (const status of ALL_STATUSES) {
      expect(NEXT_STATUSES[status]).not.toContain(status);
    }
  });

  test("mọi lựa chọn đều là trạng thái có thật", () => {
    for (const status of ALL_STATUSES) {
      for (const next of NEXT_STATUSES[status]) {
        expect(ALL_STATUSES).toContain(next);
      }
    }
  });

  test("không lặp lựa chọn trong cùng một danh sách", () => {
    for (const status of ALL_STATUSES) {
      const options = NEXT_STATUSES[status];
      expect(new Set(options).size).toBe(options.length);
    }
  });

  /// Lời hứa "đơn đã đóng vẫn mở lại được". Nhà tuyển dụng gọi lại sau khi đã từ
  /// chối là chuyện có thật, và backend cho phép người dùng mở lại.
  test("mọi trạng thái đã đóng đều có đường quay về một trạng thái đang mở", () => {
    for (const status of FINAL_STATUSES) {
      const reopens = NEXT_STATUSES[status].filter((next) =>
        OPEN_STATUSES.includes(next),
      );
      expect(reopens.length).toBeGreaterThan(0);
    }
  });
});

describe("bảng nhãn và màu", () => {
  test("mỗi trạng thái đều có nhãn tiếng Việt và một biến thể màu", () => {
    for (const status of ALL_STATUSES) {
      expect(APPLICATION_STATUS_LABELS[status]).toBeTruthy();
      expect(APPLICATION_STATUS_VARIANTS[status]).toBeTruthy();
    }
  });

  /// Nhãn trùng nhau nghĩa là hai trạng thái khác nhau hiện y hệt trên màn hình,
  /// và người dùng không có cách nào phân biệt.
  test("không hai trạng thái nào dùng chung một nhãn", () => {
    const labels = ALL_STATUSES.map((s) => APPLICATION_STATUS_LABELS[s]);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
