"use client";

import { Check, ClipboardCheck, Copy, FileCode2 } from "lucide-react";
import type { AgentRunRecord } from "@/services";
import { useCopy } from "@/hooks/use-copy";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { SectionCard } from "@/components/ui/section-card";

const kb = (bytes: number): string => `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Kết luận của agent, kèm danh sách file nó đã ghi.
 *
 * File hiện dưới dạng TÊN và cỡ chứ chưa tải về được: chúng nằm trong Storage
 * theo khoá của lượt chạy, và một đường tải cần thêm route đọc có kiểm quyền sở
 * hữu. Nói rõ điều đó ra còn hơn để một cái nút tải về hỏng.
 */
export function AgentResultCard({ run }: { run: AgentRunRecord }) {
  const { copied, copy } = useCopy();

  const text = run.result?.text ?? "";
  const artifacts = run.result?.artifacts ?? [];

  return (
    <SectionCard
      compact
      icon={ClipboardCheck}
      iconClassName="size-4 text-emerald-600"
      title="Kết quả"
      description={
        run.finishedAt ? `Xong · ${artifacts.length} file` : "Đang cập nhật"
      }
      className="border-slate-200/90"
      actions={
        text ? (
          <Button variant="outline" size="sm" onClick={() => copy("result", text)}>
            {copied === "result" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied === "result" ? "Đã sao chép" : "Sao chép"}
          </Button>
        ) : undefined
      }
    >
      {text ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Markdown text={text} />
        </div>
      ) : (
        <Alert tone="warning">
          Lượt chạy kết thúc nhưng agent không viết câu kết luận nào. Xem bảng
          các bước ở trên để biết nó đã đi tới đâu.
        </Alert>
      )}

      {artifacts.length > 0 && (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {artifacts.map((file) => (
            <li
              key={file.key}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs"
            >
              <FileCode2 className="size-4 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate font-mono text-slate-700">
                {file.name}
              </span>
              <span className="shrink-0 text-slate-400">{kb(file.bytes)}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-slate-400">
        Nội dung do AI sinh — đọc lại trước khi gửi cho nhà tuyển dụng.
      </p>
    </SectionCard>
  );
}
