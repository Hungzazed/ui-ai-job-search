/**
 * Cắt Markdown do model sinh ra thành các khối để React vẽ.
 *
 * Vì sao tự viết thay vì thêm `react-markdown`: đây là chỗ DUY NHẤT trong app
 * có văn bản Markdown, và tập cú pháp mà model thật sự dùng thì hẹp — tiêu đề,
 * bảng, danh sách, chữ đậm. Dự án đang giữ 8 dependency và không có UI kit nào;
 * thêm hai gói cho một màn là một cái giá khó biện minh.
 *
 * Đổi lại, bộ này CỐ Ý không đầy đủ: không xử lý danh sách lồng nhau, trích
 * dẫn, ảnh hay liên kết. Thứ gì không nhận ra thì rơi xuống thành đoạn văn
 * thường — mất định dạng chứ không mất chữ. Nếu về sau cần Markdown đầy đủ thì
 * thay `parseMarkdown` bằng `react-markdown` là xong, vì mọi nơi vẽ đều đi qua
 * đúng một component.
 */

export type InlineToken = { text: string; bold: boolean };

export type MarkdownBlock =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; lines: InlineToken[][] }
  | { kind: "list"; ordered: boolean; items: InlineToken[][] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "code"; text: string }
  | { kind: "rule" };

/** Tách `**đậm**` khỏi chữ thường. Dấu sao lẻ được giữ nguyên như chữ. */
export function parseInline(line: string): InlineToken[] {
  const tokens: InlineToken[] = [];

  for (const part of line.split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue;
    const bold = part.startsWith("**") && part.endsWith("**");
    tokens.push({ text: bold ? part.slice(2, -2) : part, bold });
  }

  return tokens.length > 0 ? tokens : [{ text: line, bold: false }];
}

const cells = (line: string): string[] =>
  line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim().replace(/\*\*/g, ""));

/** Dòng phân cách của bảng: `|---|:---:|` và các biến thể. */
const isDivider = (line: string): boolean =>
  /^\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes("-");

const isTableRow = (line: string): boolean => line.trim().startsWith("|");

export function parseMarkdown(input: string): MarkdownBlock[] {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];

  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length === 0) return;
    /*
     * GIỮ xuống dòng đơn thay vì gộp thành một đoạn như Markdown chuẩn.
     *
     * Model hay viết nhiều dòng "**Nhãn:** giá trị" liền nhau mà không chừa
     * dòng trống. Gộp lại thì chúng dính thành một khối chữ dài không đọc nổi -
     * đã thấy trên màn thật ở mục "Kiểm tra chất lượng".
     */
    blocks.push({ kind: "paragraph", lines: paragraph.map(parseInline) });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flush();
      continue;
    }

    if (trimmed.startsWith("```")) {
      flush();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        body.push(lines[i]);
        i += 1;
      }
      blocks.push({ kind: "code", text: body.join("\n") });
      continue;
    }

    if (/^-{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed)) {
      flush();
      blocks.push({ kind: "rule" });
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flush();
      blocks.push({
        // Gộp mọi cấp về h2/h3: model rắc `#` khá tuỳ hứng, và một trang chỉ
        // nên có vài cỡ chữ.
        kind: "heading",
        level: heading[1].length <= 2 ? 2 : 3,
        text: heading[2].replace(/\*\*/g, "").trim(),
      });
      continue;
    }

    if (isTableRow(trimmed) && isDivider(lines[i + 1]?.trim() ?? "")) {
      flush();
      const header = cells(trimmed);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && isTableRow(lines[i].trim())) {
        rows.push(cells(lines[i].trim()));
        i += 1;
      }
      i -= 1;
      blocks.push({ kind: "table", header, rows });
      continue;
    }

    const bullet = /^([-*+]|\d+[.)])\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flush();
      const ordered = /\d/.test(bullet[1]);
      const items: InlineToken[][] = [parseInline(bullet[2])];

      while (i + 1 < lines.length) {
        const next = /^([-*+]|\d+[.)])\s+(.*)$/.exec(lines[i + 1].trim());
        if (!next || /\d/.test(next[1]) !== ordered) break;
        items.push(parseInline(next[2]));
        i += 1;
      }

      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    paragraph.push(trimmed);
  }

  flush();
  return blocks;
}

/**
 * Bỏ hết cú pháp, giữ lại chữ — dùng cho những chỗ chỉ có một dòng để hiện.
 *
 * Bảng bị rút thành các ô nối bằng " · " thay vì một hàng dấu `|`: bảng ép vào
 * ba dòng preview thì đằng nào cũng không đọc được, mà một dãy `|---|---|` thì
 * trông y như lỗi hiển thị.
 */
export function toPlainText(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .split("\n")
    .filter((line) => !isDivider(line.trim()))
    .map((line) => {
      const trimmed = line.trim();
      if (isTableRow(trimmed)) return cells(trimmed).filter(Boolean).join(" · ");
      return trimmed
        .replace(/^#{1,6}\s+/, "")
        .replace(/^([-*+]|\d+[.)])\s+/, "")
        .replace(/^-{3,}$/, "");
    })
    .join(" ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
