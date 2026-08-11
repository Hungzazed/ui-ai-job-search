import { TriangleAlert } from "lucide-react";
import type { AiFailureKind, AiHealth } from "@/services";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FAILURE_KINDS } from "./admin-constants";

export function FailureKindsCard({ health }: { health: AiHealth }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TriangleAlert className="size-4.5 text-amber-500" />
          Nguyên nhân hỏng
        </CardTitle>
        <CardDescription>
          Bốn loại này dẫn tới bốn hành động khác nhau, nên chúng được đếm tách
          bạch thay vì gộp thành một con số &ldquo;lỗi&rdquo;.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {FAILURE_KINDS.map((entry) => {
          const count = health.failures[entry.kind] ?? 0;
          return (
            <div
              key={entry.kind}
              className="flex flex-col gap-2 rounded-xl border border-slate-200/80 p-4"
            >
              <div className="flex items-center justify-between">
                <Badge variant={entry.variant} dot>
                  {entry.label}
                </Badge>
                <span
                  className={`font-mono text-2xl font-bold ${count > 0 ? entry.accent : "text-slate-300"}`}
                >
                  {count}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                {entry.meaning}
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                {entry.action}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/** Giữ đúng thứ tự SCHEMA → TIMEOUT → UPSTREAM → OTHER để mắt so sánh được giữa các hàng. */
export function FailureChips({
  failures,
}: {
  failures: Partial<Record<AiFailureKind, number>>;
}) {
  const present = FAILURE_KINDS.filter(
    (entry) => (failures[entry.kind] ?? 0) > 0,
  );

  if (present.length === 0) {
    return <span className="text-xs text-slate-400">Không có</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {present.map((entry) => (
        <Badge key={entry.kind} variant={entry.variant}>
          {entry.label} {failures[entry.kind]}
        </Badge>
      ))}
    </div>
  );
}
