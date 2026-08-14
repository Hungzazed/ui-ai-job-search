import { describe, expect, test } from "vitest";
import {
  coverLetterPlainText,
  isCoverLetterEmpty,
  isCvContentEmpty,
  parseCoverLetterContent,
  parseCvContent,
} from "@/lib/document-content";

/**
 * Đây là lớp phòng thủ giữa giao diện và JSON do model sinh ra.
 *
 * Mọi test dưới đây kiểm đúng một tính chất: **không đầu vào nào làm nó ném lỗi**,
 * và dữ liệu hỏng thì mất đúng khối bị hỏng chứ không làm trắng cả trang. Đó là
 * lý do tệp nguồn không dùng `as CvContent` ở đâu cả.
 */
describe("parseCvContent", () => {
  test.each([
    ["null", null],
    ["undefined", undefined],
    ["chuỗi", "chỉ là chữ"],
    ["số", 42],
    ["mảng", [1, 2, 3]],
    ["object rỗng", {}],
  ])("đầu vào %s vẫn trả về hình dạng hợp lệ", (_label, input) => {
    const cv = parseCvContent(input);

    expect(cv).toEqual({
      profileStatement: null,
      coreCompetencies: [],
      experiences: [],
      educations: [],
      skillGroups: [],
    });
    expect(isCvContentEmpty(cv)).toBe(true);
  });

  /// Trường hợp docblock của tệp nguồn nêu tên trực tiếp: một lượt sinh hỏng nửa
  /// đường có thể để lại `bullets` là chuỗi thay vì mảng. Trước đây `.map` trên đó
  /// là nguyên nhân của trang trắng.
  test("bullets là chuỗi thì thành mảng rỗng, không phải lỗi", () => {
    const cv = parseCvContent({
      experiences: [{ position: "Dev", bullets: "một dòng duy nhất" }],
    });

    expect(cv.experiences).toHaveLength(1);
    expect(cv.experiences[0].bullets).toEqual([]);
  });

  test("bỏ phần tử không phải chuỗi lẫn trong mảng", () => {
    const cv = parseCvContent({
      coreCompetencies: ["React", 42, null, "NestJS", { a: 1 }, "  "],
    });

    expect(cv.coreCompetencies).toEqual(["React", "NestJS"]);
  });

  test("chuỗi rỗng và chuỗi chỉ có khoảng trắng coi như thiếu", () => {
    const cv = parseCvContent({ profileStatement: "   " });

    expect(cv.profileStatement).toBeNull();
  });

  test("cắt khoảng trắng hai đầu", () => {
    const cv = parseCvContent({ profileStatement: "  Fullstack developer  " });

    expect(cv.profileStatement).toBe("Fullstack developer");
  });

  describe("kinh nghiệm", () => {
    /// Không có cả chức danh lẫn công ty thì khối đó không nói lên điều gì - hiện
    /// một ô trống với vài dấu gạch đầu dòng còn tệ hơn là không hiện.
    test("bỏ khối không có cả chức danh lẫn công ty", () => {
      const cv = parseCvContent({
        experiences: [
          { period: "2024", bullets: ["làm gì đó"] },
          { position: "Dev" },
        ],
      });

      expect(cv.experiences).toHaveLength(1);
      expect(cv.experiences[0].position).toBe("Dev");
    });

    test("giữ khối chỉ có công ty", () => {
      const cv = parseCvContent({ experiences: [{ company: "FPT" }] });

      expect(cv.experiences).toHaveLength(1);
      expect(cv.experiences[0].company).toBe("FPT");
    });

    test("bỏ phần tử không phải object", () => {
      const cv = parseCvContent({ experiences: ["chuỗi", null, 7] });

      expect(cv.experiences).toEqual([]);
    });
  });

  describe("nhóm kỹ năng", () => {
    /// Nhóm rỗng thì chỉ còn cái nhãn treo lơ lửng, không đáng một khối riêng.
    test("bỏ nhóm không có mục nào dù có nhãn", () => {
      const cv = parseCvContent({
        skillGroups: [
          { label: "Ngôn ngữ", items: [] },
          { label: "Framework", items: ["NestJS"] },
        ],
      });

      expect(cv.skillGroups).toHaveLength(1);
      expect(cv.skillGroups[0].label).toBe("Framework");
    });

    test("giữ nhóm có mục nhưng thiếu nhãn", () => {
      const cv = parseCvContent({ skillGroups: [{ items: ["Docker"] }] });

      expect(cv.skillGroups).toEqual([{ label: null, items: ["Docker"] }]);
    });
  });

  /// Phân biệt "DONE nhưng nội dung vô dụng" với "đang chạy" - hai trạng thái đó
  /// cần hai thông báo khác nhau trên giao diện.
  test("isCvContentEmpty false ngay khi có đúng một trường dùng được", () => {
    expect(isCvContentEmpty(parseCvContent({ profileStatement: "Xin chào" })))
      .toBe(false);
    expect(isCvContentEmpty(parseCvContent({ coreCompetencies: ["React"] })))
      .toBe(false);
  });
});

describe("parseCoverLetterContent", () => {
  test.each([
    ["null", null],
    ["chuỗi", "chữ"],
    ["mảng", []],
  ])("đầu vào %s vẫn trả về hình dạng hợp lệ", (_label, input) => {
    const letter = parseCoverLetterContent(input);

    expect(isCoverLetterEmpty(letter)).toBe(true);
    expect(letter.bodyParagraphs).toEqual([]);
  });

  test("bodyParagraphs không phải mảng thì thành mảng rỗng", () => {
    const letter = parseCoverLetterContent({ bodyParagraphs: "một đoạn" });

    expect(letter.bodyParagraphs).toEqual([]);
  });
});

describe("coverLetterPlainText", () => {
  /// Thứ tự PHẢI khớp thứ tự hiển thị trên màn hình: người dùng sao chép xong mà
  /// thấy bố cục khác trên trang thì sẽ không tin bản vừa sao chép.
  test("ghép theo đúng thứ tự hiển thị", () => {
    const text = coverLetterPlainText(
      parseCoverLetterContent({
        salutation: "Kính gửi anh Nam,",
        opening: "Tôi viết thư này để ứng tuyển vị trí Backend Developer.",
        bodyParagraphs: ["Đoạn một.", "Đoạn hai."],
        motivation: "Tôi muốn làm việc tại đây vì...",
        closing: "Trân trọng,",
      }),
    );

    expect(text.split("\n\n")).toEqual([
      "Kính gửi anh Nam,",
      "Tôi viết thư này để ứng tuyển vị trí Backend Developer.",
      "Đoạn một.",
      "Đoạn hai.",
      "Tôi muốn làm việc tại đây vì...",
      "Trân trọng,",
    ]);
  });

  /// Phần thiếu bị bỏ hẳn, không để lại dòng trống kép - dán sang email thì
  /// khoảng trắng thừa nhìn thấy ngay.
  test("bỏ hẳn phần thiếu, không để lại dòng trống", () => {
    const text = coverLetterPlainText(
      parseCoverLetterContent({
        salutation: "Kính gửi,",
        closing: "Trân trọng,",
      }),
    );

    expect(text).toBe("Kính gửi,\n\nTrân trọng,");
  });

  test("nội dung rỗng cho chuỗi rỗng", () => {
    expect(coverLetterPlainText(parseCoverLetterContent(null))).toBe("");
  });
});
