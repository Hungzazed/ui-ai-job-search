"use client";

import { History } from "lucide-react";
import type { AgentRunSummary } from "@/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { cn, formatDate } from "@/utils";
import { AgentStatusBadge } from "@/components/dashboard/agent-status-badge";

/** Các lượt chạy trước, bấm vào để mở lại. */
export function AgentHistory({
  runs,
  activeId,
  onSelect,
  page,
}: {
  runs: AgentRunSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  page: {
    offset: number;
    limit: number;
    total: number;
    onOffsetChange: (offset: number) => void;
  };
}) {
  return (
    <Card className="border-slate-200/90">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="size-4 text-slate-400" />
          Lượt chạy trước
        </CardTitle>
        <CardDescription className="text-xs">
          Bấm một dòng để xem lại các bước và kết quả
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3">
        {runs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
            Bạn chưa chạy lượt nào. Dán mô tả công việc ở trên rồi bấm “Bắt
            đầu”.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {runs.map((run) => (
              <li key={run.id}>
                <button
                  type="button"
                  onClick={() => onSelect(run.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-slate-50",
                    run.id === activeId && "bg-primary-50/60",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium text-slate-800">
                      /{run.workflow} · {run._count.steps} bước
                    </span>
                    <span className="block font-mono text-2xs text-slate-400">
                      {formatDate(run.createdAt)}
                      {run.modelId ? ` · ${run.modelId}` : ""}
                    </span>
                  </span>
                  <AgentStatusBadge status={run.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Pagination
        offset={page.offset}
        limit={page.limit}
        total={page.total}
        noun="lượt chạy"
        onOffsetChange={page.onOffsetChange}
      />
    </Card>
  );
}
