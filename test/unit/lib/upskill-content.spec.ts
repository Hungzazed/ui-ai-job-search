import { describe, expect, test } from "vitest";
import {
  isUpskillReportEmpty,
  parseHardGaps,
  parseLearningPlan,
  parseSynthesisedGaps,
} from "@/lib/upskill-content";

describe("parseHardGaps", () => {
  test.each([
    ["null", null],
    ["chuỗi", "Docker"],
    ["object thay vì mảng", { skill: "Docker" }],
  ])("đầu vào %s cho mảng rỗng", (_label, input) => {
    expect(parseHardGaps(input)).toEqual([]);
  });

  test("bỏ khối không có tên kỹ năng", () => {
    const gaps = parseHardGaps([
      { demandCount: 5, priority: 90, evidence: "Nhiều tin yêu cầu." },
      { skill: "Docker" },
    ]);

    expect(gaps).toHaveLength(1);
    expect(gaps[0].skill).toBe("Docker");
  });

  /// Sắp ở client chứ không tin thứ tự model trả về: `priority` là con số nó tự
  /// chấm, còn thứ tự trong mảng thì không có gì bảo đảm.
  test("sắp theo độ ưu tiên giảm dần", () => {
    const gaps = parseHardGaps([
      { skill: "Kubernetes", priority: 40 },
      { skill: "Docker", priority: 95 },
      { skill: "Redis", priority: 70 },
    ]);

    expect(gaps.map((g) => g.skill)).toEqual(["Docker", "Redis", "Kubernetes"]);
  });

  test("mục thiếu độ ưu tiên xuống cuối", () => {
    const gaps = parseHardGaps([
      { skill: "Không rõ mức" },
      { skill: "Docker", priority: 10 },
    ]);

    expect(gaps.map((g) => g.skill)).toEqual(["Docker", "Không rõ mức"]);
  });

  /// Model chấm sai thang là chuyện đã gặp thật ở backend (chấm 0-5 rồi trả 4
  /// trong khi schema đòi 0-100). Một thanh 100% dựng từ số 4 còn tệ hơn không
  /// có thanh nào, nên ngoài thang thì bỏ hẳn chứ không kẹp về biên.
  test.each([
    ["âm", -5],
    ["quá 100", 140],
    ["số thực", 62.5],
    ["chuỗi", "90"],
  ])("độ ưu tiên %s bị bỏ, không kẹp về biên", (_label, priority) => {
    const [gap] = parseHardGaps([{ skill: "Docker", priority }]);

    expect(gap.priority).toBeNull();
  });

  test("giữ độ ưu tiên hợp lệ ở hai biên", () => {
    expect(parseHardGaps([{ skill: "A", priority: 0 }])[0].priority).toBe(0);
    expect(parseHardGaps([{ skill: "B", priority: 100 }])[0].priority).toBe(100);
  });
});

describe("parseSynthesisedGaps", () => {
  test("đọc đủ ba trường", () => {
    const [gap] = parseSynthesisedGaps([
      {
        category: "tooling",
        gap: "Chưa quen quy trình CI/CD.",
        why: "Mọi tin đều yêu cầu tự chạy pipeline.",
      },
    ]);

    expect(gap).toEqual({
      category: "tooling",
      gap: "Chưa quen quy trình CI/CD.",
      why: "Mọi tin đều yêu cầu tự chạy pipeline.",
    });
  });

  /// Nhãn ngoài bốn nhãn đã định thì bỏ nhãn, GIỮ nội dung: khoảng trống vẫn có
  /// thật kể cả khi model phân loại sai.
  test("nhãn lạ thành null nhưng vẫn giữ nội dung", () => {
    const [gap] = parseSynthesisedGaps([
      { category: "khac", gap: "Thiếu kinh nghiệm fintech." },
    ]);

    expect(gap.category).toBeNull();
    expect(gap.gap).toBe("Thiếu kinh nghiệm fintech.");
  });

  test("bỏ khối không có nội dung khoảng trống", () => {
    expect(
      parseSynthesisedGaps([{ category: "soft", why: "Quan trọng." }]),
    ).toEqual([]);
  });
});

describe("parseLearningPlan", () => {
  test("sắp theo order của model", () => {
    const plan = parseLearningPlan([
      { order: 3, topic: "Kubernetes" },
      { order: 1, topic: "Docker" },
      { order: 2, topic: "CI/CD" },
    ]);

    expect(plan.map((s) => s.topic)).toEqual(["Docker", "CI/CD", "Kubernetes"]);
  });

  /// Order trùng thì giữ nguyên thứ tự model trả về, không đảo ngẫu nhiên.
  test("order trùng giữ nguyên thứ tự gốc", () => {
    const plan = parseLearningPlan([
      { order: 1, topic: "Trước" },
      { order: 1, topic: "Sau" },
    ]);

    expect(plan.map((s) => s.topic)).toEqual(["Trước", "Sau"]);
  });

  test("bước thiếu order xuống cuối", () => {
    const plan = parseLearningPlan([
      { topic: "Không số" },
      { order: 2, topic: "Có số" },
    ]);

    expect(plan.map((s) => s.topic)).toEqual(["Có số", "Không số"]);
  });

  test("bỏ bước không có chủ đề", () => {
    expect(
      parseLearningPlan([{ order: 1, rationale: "Vì nó quan trọng." }]),
    ).toEqual([]);
  });

  test("số tuần ngoài khoảng 1-52 bị bỏ", () => {
    expect(
      parseLearningPlan([{ topic: "A", estimatedWeeks: 0 }])[0].estimatedWeeks,
    ).toBeNull();
    expect(
      parseLearningPlan([{ topic: "B", estimatedWeeks: 60 }])[0].estimatedWeeks,
    ).toBeNull();
    expect(
      parseLearningPlan([{ topic: "C", estimatedWeeks: 4 }])[0].estimatedWeeks,
    ).toBe(4);
  });

  test("resources không phải mảng thì thành mảng rỗng", () => {
    const [step] = parseLearningPlan([
      { topic: "Docker", resources: "một khoá học" },
    ]);

    expect(step.resources).toEqual([]);
  });

  test("lọc phần tử không phải chuỗi trong resources", () => {
    const [step] = parseLearningPlan([
      { topic: "Docker", resources: ["Khoá A", 42, null, "  ", "Sách B"] },
    ]);

    expect(step.resources).toEqual(["Khoá A", "Sách B"]);
  });
});

describe("isUpskillReportEmpty", () => {
  const report = (overrides = {}) => ({
    hardGaps: null,
    synthesisedGaps: null,
    learningPlan: null,
    ...overrides,
  });

  test("true khi không đọc được gì", () => {
    expect(isUpskillReportEmpty(report())).toBe(true);
  });

  test("true khi cả ba khối đều hỏng kiểu", () => {
    expect(
      isUpskillReportEmpty(
        report({ hardGaps: "x", synthesisedGaps: 1, learningPlan: {} }),
      ),
    ).toBe(true);
  });

  test.each([
    ["hardGaps", { hardGaps: [{ skill: "Docker" }] }],
    ["synthesisedGaps", { synthesisedGaps: [{ gap: "Thiếu domain." }] }],
    ["learningPlan", { learningPlan: [{ topic: "Docker" }] }],
  ])("false khi chỉ có %s", (_label, overrides) => {
    expect(isUpskillReportEmpty(report(overrides))).toBe(false);
  });
});
