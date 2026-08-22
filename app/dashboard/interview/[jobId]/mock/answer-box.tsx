"use client";

import { useState } from "react";
import { CornerDownLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";

/** Đủ dài cho một câu chuyện STAR mà không phải kéo thanh cuộn ngay từ đầu. */
const ROWS = 5;

/**
 * Ô trả lời cho một câu phỏng vấn.
 *
 * Cố ý KHÔNG dùng lại `AgentQuestionCard` của màn Ứng tuyển tự động, dù hai cái
 * cùng gọi một endpoint: bên đó là quyết định có/không với hai nút bấm sẵn, bên
 * này là văn dài và không có câu trả lời nhanh nào đúng cho một câu phỏng vấn.
 * Gộp lại sẽ thành một component toàn tham số cấu hình, và mỗi lần sửa một màn
 * phải nghĩ về màn kia.
 */
export function AnswerBox({
  sending,
  onSend,
}: {
  sending: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="space-y-2">
      <Textarea
        id="interview-answer"
        rows={ROWS}
        value={text}
        disabled={sending}
        onChange={(event) => setText(event.target.value)}
        // Ctrl/Cmd + Enter gửi: người dùng đang gõ một đoạn dài nhiều dòng, nên
        // Enter một mình phải là xuống dòng.
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) send();
        }}
        placeholder="Trả lời như đang nói chuyện thật với người phỏng vấn. Kể theo khung STAR: bối cảnh, việc bạn phụ trách, bạn đã làm gì, kết quả đo được."
        aria-label="Câu trả lời của bạn"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[0.6875rem]">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[0.6875rem]">
            <CornerDownLeft className="size-3" />
          </kbd>
          <span>để gửi</span>
        </p>

        <Button
          onClick={send}
          disabled={sending || !text.trim()}
          className="ml-auto"
        >
          <Send className="size-3.5" />
          {sending ? "Đang gửi" : "Gửi câu trả lời"}
        </Button>
      </div>
    </div>
  );
}
