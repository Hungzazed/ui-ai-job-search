import { describe, expect, test } from "vitest";
import { parseInline, parseMarkdown, toPlainText } from "@/lib/markdown-blocks";

/**
 * Đầu vào ở đây là văn bản do MODEL viết, nên nguyên tắc giống hệt bộ đọc JSON
 * của tài liệu: không đầu vào nào được phép ném, và thứ gì không nhận ra thì
 * rơi xuống thành đoạn văn thường — mất định dạng chứ không mất chữ.
 */
const REAL_OUTPUT = [
  "## Đánh Giá Công Việc: Kế Toán Tổng Hợp",
  "",
  "| Chi Tiết | Điểm | Ghi Chú |",
  "|-----------|------|---------|",
  "| Kỹ Năng | 85/100 | MISA, Excel |",
  "| Địa Điểm | **KHÔNG ĐẠT** | HCM vs Hà Nội |",
  "",
  "### Kết Luận: Moderate Fit",
  "",
  "**Điểm Mạnh:**",
  "- Kinh nghiệm 5 năm, vượt yêu cầu",
  "- Thành thạo phần mềm yêu cầu",
  "",
  "---",
  "",
  "Bạn có muốn tôi soạn hồ sơ không?",
].join("\n");

describe("parseMarkdown", () => {
  test("đọc đúng bảng, tiêu đề, danh sách và đoạn văn", () => {
    const blocks = parseMarkdown(REAL_OUTPUT);
    const kinds = blocks.map((block) => block.kind);

    expect(kinds).toEqual([
      "heading",
      "table",
      "heading",
      "paragraph",
      "list",
      "rule",
      "paragraph",
    ]);
  });

  test("bảng giữ đủ header và mọi hàng, bỏ dấu sao trong ô", () => {
    const table = parseMarkdown(REAL_OUTPUT).find(
      (block) => block.kind === "table",
    );

    expect(table).toMatchObject({
      header: ["Chi Tiết", "Điểm", "Ghi Chú"],
      rows: [
        ["Kỹ Năng", "85/100", "MISA, Excel"],
        ["Địa Điểm", "KHÔNG ĐẠT", "HCM vs Hà Nội"],
      ],
    });
  });

  /// Một hàng bắt đầu bằng `|` mà KHÔNG có dòng gạch ngang bên dưới thì không
  /// phải bảng — vẽ nó thành bảng một hàng còn khó đọc hơn để nguyên.
  test("thiếu dòng phân cách thì không coi là bảng", () => {
    expect(parseMarkdown("| a | b |")[0].kind).toBe("paragraph");
  });

  test("danh sách đánh số tách khỏi danh sách gạch đầu dòng", () => {
    const blocks = parseMarkdown("1. Một\n2. Hai\n- Ba");

    expect(blocks.map((b) => b.kind)).toEqual(["list", "list"]);
    expect(blocks[0]).toMatchObject({ ordered: true });
    expect(blocks[1]).toMatchObject({ ordered: false });
  });

  test("khối mã giữ nguyên xuống dòng", () => {
    const blocks = parseMarkdown("```bash\ncd cv\nlualatex main.tex\n```");

    expect(blocks[0]).toEqual({ kind: "code", text: "cd cv\nlualatex main.tex" });
  });

  test.each(["", "   ", "chỉ một dòng chữ"])(
    "đầu vào %s không làm vỡ",
    (input) => {
      expect(() => parseMarkdown(input)).not.toThrow();
    },
  );

  /**
   * Markdown chuẩn gộp xuống dòng đơn thành một đoạn; ở đây thì KHÔNG.
   *
   * Model hay viết nhiều dòng "**Nhãn:** giá trị" liền nhau, và gộp lại thì
   * chúng dính thành một khối chữ dài — đã thấy trên màn thật ở mục "Kiểm tra
   * chất lượng".
   */
  test("giữ xuống dòng đơn trong cùng một đoạn", () => {
    const blocks = parseMarkdown(
      ["**Đúng ngôn ngữ:** tiếng Việt", "**Đúng định dạng:** moderncv"].join(
        "\n",
      ),
    );

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ kind: "paragraph" });
    expect(blocks[0].kind === "paragraph" && blocks[0].lines).toHaveLength(2);
  });
});

describe("parseInline", () => {
  test("tách chữ đậm khỏi chữ thường", () => {
    expect(parseInline("Điểm **85/100** rất tốt")).toEqual([
      { text: "Điểm ", bold: false },
      { text: "85/100", bold: true },
      { text: " rất tốt", bold: false },
    ]);
  });

  /// Dấu sao lẻ là chuyện thường trong văn bản model sinh; nó phải hiện ra như
  /// chữ chứ không được nuốt mất nửa câu.
  test("dấu sao lẻ giữ nguyên", () => {
    expect(parseInline("2 ** 3 = 8")).toEqual([{ text: "2 ** 3 = 8", bold: false }]);
  });
});

describe("toPlainText", () => {
  test("bỏ hết cú pháp, bảng thành các ô nối bằng dấu chấm giữa", () => {
    const plain = toPlainText(REAL_OUTPUT);

    expect(plain).not.toContain("|--");
    expect(plain).not.toContain("**");
    expect(plain).not.toContain("##");
    expect(plain).toContain("Kỹ Năng · 85/100 · MISA, Excel");
  });

  test("bỏ hẳn khối mã thay vì đổ nguyên lệnh vào một dòng", () => {
    expect(toPlainText("Chạy lệnh:\n```bash\ncd cv\n```\nxong.")).toBe(
      "Chạy lệnh: xong.",
    );
  });
});
