import type { LucideIcon } from "lucide-react";
import { ArrowRight, FileText, Handshake, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { AiSuggestion } from "@/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils";

const typeMeta: Record<
  AiSuggestion["type"],
  { icon: LucideIcon; bg: string; text: string }
> = {
  cv: { icon: FileText, bg: "bg-primary-50", text: "text-primary-700" },
  skill: { icon: Lightbulb, bg: "bg-amber-50", text: "text-amber-700" },
  network: { icon: Handshake, bg: "bg-sky-50", text: "text-sky-700" },
  apply: { icon: TrendingUp, bg: "bg-emerald-50", text: "text-emerald-700" },
};

interface AISuggestionCardProps {
  suggestions: AiSuggestion[];
}

export function AISuggestionCard({ suggestions }: AISuggestionCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200/90 bg-white">
      <div className="flex items-center justify-between px-5 pt-5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <Sparkles className="size-4" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">
            Gợi ý tối ưu
          </h3>
        </div>
        {/*
          Đã gỡ nhãn "Real-time Engine" (chấm xanh, chữ mono) ở đây.

          Nó sai theo hai hướng cùng lúc: chữ cứng nên không bao giờ phản ánh
          trạng thái thật, và những gợi ý này KHÔNG do model sinh ra — chúng được
          suy ra bằng SQL từ hồ sơ và kết quả chấm điểm đã có (xem `suggestions.ts`
          phía backend). Dán nhãn "real-time engine" lên một truy vấn SQL là hứa
          một thứ hệ thống không làm.

          Tiêu đề cũng bỏ chữ "từ AI Agent" vì cùng lý do đó.
        */}
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {suggestions.map((suggestion) => {
          const meta = typeMeta[suggestion.type];
          const Icon = meta.icon;

          const body = (
            <>
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-200/60", meta.bg, meta.text)}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn(
                    "text-xs font-semibold text-slate-900 transition-colors",
                    suggestion.href && "group-hover:text-primary-600",
                  )}>
                    {suggestion.title}
                  </p>
                  {/* Mũi tên chỉ xuất hiện khi có chỗ để đi tới. Trước đây nó hiện
                      trên mọi thẻ, kể cả thẻ không dẫn đi đâu. */}
                  {suggestion.href && (
                    <ArrowRight className="size-3 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{suggestion.description}</p>
              </div>
            </>
          );

          const base = "flex gap-3 rounded-lg border border-slate-200/70 bg-slate-50/50 p-3.5";

          /*
           * Backend đã tính sẵn `href` cho từng gợi ý (xem `suggestions.ts`:
           * thiếu hồ sơ -> /dashboard/profile, thiếu kỹ năng -> /dashboard/upskill,
           * điểm cao -> trang chi tiết việc đó). Frontend trước đây bỏ hẳn trường
           * này mà vẫn để `cursor-pointer` cùng mũi tên hover — người dùng bấm vào
           * một thẻ trông như link rồi không có gì xảy ra.
           *
           * `href` vẫn là optional trong kiểu, nên nhánh không-link phải tồn tại;
           * điều quan trọng là nó KHÔNG giả vờ bấm được.
           */
          return suggestion.href ? (
            <Link
              key={suggestion.id}
              href={suggestion.href}
              className={cn(base, "group transition-all hover:border-slate-300 hover:bg-white hover:shadow-xs")}
            >
              {body}
            </Link>
          ) : (
            <div key={suggestion.id} className={base}>
              {body}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
