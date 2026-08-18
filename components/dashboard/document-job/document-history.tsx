import { FileText } from "lucide-react";
import type { DocumentRecord } from "@/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { cn, formatDate } from "@/utils";
import { DocumentStatusBadge } from "./document-status-badge";

/** Danh sách tài liệu đã tạo trước đó, bấm vào để mở lại. */
export function DocumentHistory({
  documents,
  activeId,
  onSelect,
  emptyLabel,
  page,
}: {
  documents: DocumentRecord[];
  activeId: string | null;
  onSelect: (id: string) => void;
  emptyLabel: string;
  /** Bỏ trống thì không vẽ thanh lật trang - dùng cho danh sách ngắn cố định. */
  page?: {
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
          <FileText className="size-4 text-slate-400" />
          Tài liệu đã tạo
        </CardTitle>
        <CardDescription className="text-xs">
          Bấm vào một dòng để mở lại nội dung đã sinh trước đó
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        {documents.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
            {emptyLabel}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {documents.map((record) => (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => onSelect(record.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-slate-50",
                    record.id === activeId && "bg-primary-50/60",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium text-slate-800">
                      {record.title}
                    </span>
                    <span className="block font-mono text-[11px] text-slate-400">
                      {formatDate(record.createdAt)}
                      {record.modelId ? ` · ${record.modelId}` : ""}
                    </span>
                  </span>
                  <DocumentStatusBadge status={record.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {page && (
        <Pagination
          offset={page.offset}
          limit={page.limit}
          total={page.total}
          noun="tài liệu"
          onOffsetChange={page.onOffsetChange}
        />
      )}
    </Card>
  );
}
