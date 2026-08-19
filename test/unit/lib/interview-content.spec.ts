import { describe, expect, test } from "vitest";
import type { InterviewPrepRecord } from "@/services";
import {
  interviewQuestions,
  isInterviewPrepEmpty,
  parseStarAnswers,
  parseToughQuestions,
} from "@/lib/interview-content";

const prep = (
  overrides: Partial<InterviewPrepRecord> = {},
): InterviewPrepRecord => ({
  id: "prep-1",
  jobId: "job-1",
  job: {
    id: "job-1",
    title: "Backend Developer",
    company: "Công ty A",
    companyLogo: null,
  },
  status: "DONE",
  starAnswers: null,
  toughQuestions: null,
  questionsToAsk: [],
  talkingPoints: [],
  likelyProbes: [],
  modelId: "model-x",
  generatedAt: "2026-08-12T00:00:00.000Z",
  failureKind: null,
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
  ...overrides,
});

describe("parseStarAnswers", () => {
  test.each([
    ["null", null],
    ["chuỗi", "một câu chuyện"],
    ["object thay vì mảng", { competency: "Giao tiếp" }],
    ["số", 7],
  ])("đầu vào %s cho mảng rỗng, không ném lỗi", (_label, input) => {
    expect(parseStarAnswers(input)).toEqual([]);
  });

  test("đọc đủ sáu phần của một câu chuyện", () => {
    const [answer] = parseStarAnswers([
      {
        competency: "Xử lý sự cố",
        question: "Kể về một lần bạn xử lý sự cố production.",
        situation: "Hệ thống thanh toán lỗi lúc cao điểm.",
        task: "Tôi phụ trách khôi phục dịch vụ.",
        action: "Tôi khoanh vùng lỗi ở tầng cache rồi rollback.",
        result: "Dịch vụ trở lại sau 12 phút.",
      },
    ]);

    expect(answer).toEqual({
      competency: "Xử lý sự cố",
      question: "Kể về một lần bạn xử lý sự cố production.",
      situation: "Hệ thống thanh toán lỗi lúc cao điểm.",
      task: "Tôi phụ trách khôi phục dịch vụ.",
      action: "Tôi khoanh vùng lỗi ở tầng cache rồi rollback.",
      result: "Dịch vụ trở lại sau 12 phút.",
    });
  });

  /// Thiếu vài phần STAR vẫn giữ: ba đoạn có thật còn hơn không có gì.
  test("giữ khối thiếu một số phần", () => {
    const [answer] = parseStarAnswers([
      { question: "Kể về một xung đột trong nhóm.", situation: "Hai bên bất đồng về kiến trúc." },
    ]);

    expect(answer.situation).toBe("Hai bên bất đồng về kiến trúc.");
    expect(answer.action).toBeNull();
  });

  /// Không có tiêu đề nào để hiện thì bốn đoạn STAR bên dưới thành mấy khối văn
  /// không rõ đang trả lời cho cái gì.
  test("bỏ khối không có cả câu hỏi lẫn tên năng lực", () => {
    const answers = parseStarAnswers([
      { situation: "Có chuyện xảy ra.", action: "Tôi đã làm gì đó." },
      { competency: "Lãnh đạo" },
    ]);

    expect(answers).toHaveLength(1);
    expect(answers[0].competency).toBe("Lãnh đạo");
  });

  test("bỏ phần tử không phải object", () => {
    expect(parseStarAnswers(["chuỗi", null, 3])).toEqual([]);
  });
});

describe("parseToughQuestions", () => {
  /// Khác STAR: thiếu câu hỏi là mất tất cả. Một "hướng trả lời" không gắn với
  /// câu hỏi nào thì người đọc không biết nó trả lời cho điều gì.
  test("bỏ khối thiếu câu hỏi dù có hướng trả lời", () => {
    const questions = parseToughQuestions([
      { why: "Họ muốn kiểm tra chiều sâu.", suggestedAnswer: "Hãy thừa nhận thật." },
      { question: "Vì sao bạn nghỉ việc cũ?" },
    ]);

    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe("Vì sao bạn nghỉ việc cũ?");
  });

  test("giữ nguyên why và suggestedAnswer khi có", () => {
    const [item] = parseToughQuestions([
      {
        question: "Bạn chưa có kinh nghiệm Docker, xử lý thế nào?",
        why: "Tin tuyển dụng nêu Docker là điểm cộng.",
        suggestedAnswer: "Thừa nhận rồi bắc cầu sang kinh nghiệm CI đã có.",
      },
    ]);

    expect(item.why).toContain("Docker");
    expect(item.suggestedAnswer).toContain("bắc cầu");
  });

  test("chuỗi rỗng coi như thiếu", () => {
    expect(parseToughQuestions([{ question: "   " }])).toEqual([]);
  });
});

describe("interviewQuestions", () => {
  /// Đây là danh sách mà chế độ luyện tập bằng giọng nói sẽ dùng sau này, nên nó
  /// phải gộp được cả hai nguồn và không lặp.
  test("gộp câu hỏi từ cả hai khối", () => {
    const questions = interviewQuestions(
      prep({
        starAnswers: [{ question: "Kể về một dự án khó." }],
        toughQuestions: [{ question: "Điểm yếu lớn nhất của bạn?" }],
      }),
    );

    expect(questions).toEqual([
      "Kể về một dự án khó.",
      "Điểm yếu lớn nhất của bạn?",
    ]);
  });

  test("bỏ câu trùng giữa hai khối", () => {
    const questions = interviewQuestions(
      prep({
        starAnswers: [{ question: "Vì sao chọn công ty này?" }],
        toughQuestions: [{ question: "Vì sao chọn công ty này?" }],
      }),
    );

    expect(questions).toEqual(["Vì sao chọn công ty này?"]);
  });

  test("bỏ qua khối STAR không có câu hỏi", () => {
    const questions = interviewQuestions(
      prep({ starAnswers: [{ competency: "Lãnh đạo" }] }),
    );

    expect(questions).toEqual([]);
  });

  test("bản ghi rỗng cho danh sách rỗng", () => {
    expect(interviewQuestions(prep())).toEqual([]);
  });
});

describe("isInterviewPrepEmpty", () => {
  /// Phân biệt "DONE nhưng không dùng được" với "đang soạn". Cả hai đều trống
  /// trên màn hình nếu không nói rõ, mà chúng cần hai thông báo khác nhau.
  test("true khi không đọc được gì", () => {
    expect(isInterviewPrepEmpty(prep())).toBe(true);
  });

  test("true khi JSON hỏng hoàn toàn", () => {
    expect(
      isInterviewPrepEmpty(
        prep({ starAnswers: "hỏng", toughQuestions: { a: 1 } }),
      ),
    ).toBe(true);
  });

  test.each([
    ["starAnswers", { starAnswers: [{ question: "Một câu hỏi." }] }],
    ["toughQuestions", { toughQuestions: [{ question: "Một câu khó." }] }],
    ["questionsToAsk", { questionsToAsk: ["Đội ngũ bao nhiêu người?"] }],
    ["talkingPoints", { talkingPoints: ["Kinh nghiệm NestJS."] }],
    ["likelyProbes", { likelyProbes: ["Thiếu kinh nghiệm Docker."] }],
  ])("false khi chỉ có %s", (_label, overrides) => {
    expect(isInterviewPrepEmpty(prep(overrides))).toBe(false);
  });
});
