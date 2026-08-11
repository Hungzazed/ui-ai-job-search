import type { LucideIcon } from "lucide-react";
import { ArrowRight, FileText, Handshake, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import type { AiSuggestion } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">Gợi ý tối ưu từ AI Agent</h3>
        </div>
        <Badge variant="success" dot className="font-mono text-[11px]">
          Real-time Engine
        </Badge>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {suggestions.map((suggestion) => {
          const meta = typeMeta[suggestion.type];
          const Icon = meta.icon;
          return (
            <div
              key={suggestion.id}
              className="flex gap-3 rounded-lg border border-slate-200/70 bg-slate-50/50 p-3.5 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs group cursor-pointer"
            >
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-200/60", meta.bg, meta.text)}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{suggestion.title}</p>
                  <ArrowRight className="size-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{suggestion.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
