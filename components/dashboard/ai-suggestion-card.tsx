import type { LucideIcon } from "lucide-react";
import { FileText, Handshake, Lightbulb, TrendingUp } from "lucide-react";
import type { AiSuggestion } from "@/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const typeMeta: Record<
  AiSuggestion["type"],
  { icon: LucideIcon; bg: string; text: string }
> = {
  cv: { icon: FileText, bg: "bg-primary-50", text: "text-primary-600" },
  skill: { icon: Lightbulb, bg: "bg-amber-50", text: "text-amber-600" },
  network: { icon: Handshake, bg: "bg-sky-50", text: "text-sky-600" },
  apply: { icon: TrendingUp, bg: "bg-emerald-50", text: "text-emerald-600" },
};

interface AISuggestionCardProps {
  suggestions: AiSuggestion[];
}

export function AISuggestionCard({ suggestions }: AISuggestionCardProps) {
  return (
    <Card className="overflow-hidden border-primary-100 bg-gradient-to-br from-primary-50/60 to-white">
      <div className="flex items-center gap-2 px-5 pt-5">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary-500" />
        </span>
        <h3 className="text-base font-semibold text-slate-900">Gợi ý từ AI</h3>
        <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
          Cập nhật hôm nay
        </span>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {suggestions.map((suggestion) => {
          const meta = typeMeta[suggestion.type];
          const Icon = meta.icon;
          return (
            <div
              key={suggestion.id}
              className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", meta.bg, meta.text)}>
                <Icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{suggestion.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{suggestion.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
