"use client";

import { useState } from "react";
import { MessageCircleQuestion, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { Markdown } from "@/components/ui/markdown";
import { SectionCard } from "@/components/ui/section-card";

/** Câu trả lời nhanh cho câu hỏi hay gặp nhất: có soạn hồ sơ hay không. */
const QUICK_ANSWERS = [
  "Có, soạn giúp tôi.",
  "Không, bỏ qua vị trí này.",
];

/**
 * Ô trả lời khi agent dừng lại hỏi.
 *
 * Phải nổi bật hơn mọi khối khác trên màn: đây là trạng thái duy nhất hệ thống
 * không tự thoát ra được — không ai trả lời thì lượt chạy nằm đó mãi mãi.
 *
 * Câu hỏi vẽ bằng `Markdown` chứ không phải `<p>`: agent kèm cả bảng chấm điểm
 * vào câu hỏi, mà `<p>` gộp mọi xuống dòng thành dấu cách nên bảng đổ nhoè
 * thành một dãy `| Kỹ thuật | 80/100 |` chạy dài.
 */
export function AgentQuestionCard({
  question,
  sending,
  onAnswer,
}: {
  question: string;
  sending: boolean;
  onAnswer: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const send = (answer: string) => {
    const trimmed = answer.trim();
    if (!trimmed || sending) return;
    onAnswer(trimmed);
    setText("");
  };

  return (
    <SectionCard
      compact
      icon={MessageCircleQuestion}
      iconClassName="size-4 text-amber-600"
      title="Agent đang hỏi bạn"
      description="Lượt chạy dừng ở đây cho tới khi bạn trả lời."
      className="border-amber-200 bg-amber-50/40"
    >
      <Markdown
        text={question}
        className="rounded-xl border border-amber-200 bg-white p-4 text-slate-800"
      />

      <div className="flex flex-wrap gap-2">
        {QUICK_ANSWERS.map((answer) => (
          <Button
            key={answer}
            variant="outline"
            size="sm"
            disabled={sending}
            onClick={() => send(answer)}
          >
            {answer}
          </Button>
        ))}
      </div>

      <Textarea
        id="agent-answer"
        rows={3}
        value={text}
        disabled={sending}
        onChange={(event) => setText(event.target.value)}
        placeholder="Hoặc trả lời chi tiết hơn…"
      />

      <div className="flex justify-end">
        <Button
          onClick={() => send(text)}
          loading={sending}
          disabled={!text.trim()}
        >
          <Send className="size-4" />
          Gửi câu trả lời
        </Button>
      </div>
    </SectionCard>
  );
}
