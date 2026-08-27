import { Fragment } from "react";
import { parseMarkdown, type InlineToken } from "@/lib/markdown-blocks";
import { cn } from "@/utils";

/**
 * Vẽ Markdown do model sinh ra.
 *
 * Mọi nơi hiện văn bản Markdown đều đi qua đây, nên đổi cách vẽ — kể cả đổi
 * sang một thư viện thật — chỉ phải sửa một file.
 */
export function Markdown({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const blocks = parseMarkdown(text);

  return (
    <div className={cn("space-y-3 text-sm leading-relaxed text-slate-700", className)}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading":
            return block.level === 2 ? (
              <h3
                key={index}
                className="pt-1 text-sm font-semibold text-slate-900"
              >
                {block.text}
              </h3>
            ) : (
              <h4 key={index} className="text-xs font-semibold text-slate-700">
                {block.text}
              </h4>
            );

          case "paragraph":
            return (
              <p key={index}>
                {block.lines.map((tokens, line) => (
                  <Fragment key={line}>
                    {line > 0 && <br />}
                    <Inline tokens={tokens} />
                  </Fragment>
                ))}
              </p>
            );

          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag
                key={index}
                className={cn(
                  "space-y-1 pl-5",
                  block.ordered ? "list-decimal" : "list-disc",
                )}
              >
                {block.items.map((tokens, item) => (
                  <li key={item}>
                    <Inline tokens={tokens} />
                  </li>
                ))}
              </Tag>
            );
          }

          case "table":
            return (
              // Bảng điểm của model thường 4-5 cột; trên điện thoại nó phải
              // cuộn NGANG trong khung của chính nó, không được đẩy cả trang.
              <div key={index} className="overflow-x-auto">
                <table className="w-full min-w-md border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {block.header.map((cell, column) => (
                        <th
                          key={column}
                          className="px-2 py-1.5 text-left font-semibold text-slate-600"
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, line) => (
                      <tr key={line} className="border-b border-slate-100">
                        {row.map((cell, column) => (
                          <td key={column} className="px-2 py-1.5 align-top">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "code":
            return (
              <pre
                key={index}
                className="overflow-x-auto rounded-lg bg-slab text-slab-muted p-3 font-mono text-2xs"
              >
                {block.text}
              </pre>
            );

          case "rule":
            return <hr key={index} className="border-slate-200" />;
        }
      })}
    </div>
  );
}

function Inline({ tokens }: { tokens: InlineToken[] }) {
  return (
    <>
      {tokens.map((token, index) => (
        <Fragment key={index}>
          {token.bold ? (
            <strong className="font-semibold text-slate-900">
              {token.text}
            </strong>
          ) : (
            token.text
          )}
        </Fragment>
      ))}
    </>
  );
}
