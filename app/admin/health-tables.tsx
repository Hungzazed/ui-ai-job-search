import type { ReactNode } from "react";
import type { AiFailureRecord, AiHealth } from "@/services";
import { SuccessRateCell } from "@/components/dashboard/score-row";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCount, formatDateTime, formatDuration } from "@/utils";
import {
  FAILURE_KINDS,
  FAILURE_LIMIT,
  purposeLabel,
} from "./admin-constants";
import { FailureChips } from "./failure-kinds";

/** Khung chung của ba bảng: tiêu đề, mô tả, rồi bảng tràn sát mép thẻ. */
function TableCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">{children}</CardContent>
    </Card>
  );
}

export function PurposeTable({ rows }: { rows: AiHealth["byPurpose"] }) {
  return (
    <TableCard
      title="Theo tác vụ"
      description="Tác vụ có tỷ lệ thành công thấp nhất đứng đầu — đó là chỗ cần sửa trước."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tác vụ</TableHead>
            <TableHead className="text-right">Lời gọi</TableHead>
            <TableHead>Tỷ lệ thành công</TableHead>
            <TableHead className="text-right">p50</TableHead>
            <TableHead className="text-right">p95</TableHead>
            <TableHead>Nguyên nhân hỏng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.purpose}>
              <TableCell>
                <p className="font-medium text-slate-900">
                  {purposeLabel(row.purpose)}
                </p>
                <p className="font-mono text-[11px] text-slate-400">
                  {row.purpose}
                </p>
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCount(row.total)}
              </TableCell>
              <TableCell className="min-w-36">
                <SuccessRateCell rate={row.successRate} />
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatDuration(row.p50Ms)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatDuration(row.p95Ms)}
              </TableCell>
              <TableCell>
                <FailureChips failures={row.failures} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}

export function ModelTable({ rows }: { rows: AiHealth["byModel"] }) {
  return (
    <TableCard
      title="Theo model"
      description="Backend chỉ trả p50 ở mức này; muốn xem đuôi chậm thì đọc p95 ở bảng tác vụ phía trên."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Lời gọi</TableHead>
            <TableHead>Tỷ lệ thành công</TableHead>
            <TableHead className="text-right">p50</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.modelId}>
              <TableCell className="font-mono text-xs text-slate-900">
                {row.modelId}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCount(row.total)}
              </TableCell>
              <TableCell className="min-w-36">
                <SuccessRateCell rate={row.successRate} />
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatDuration(row.p50Ms)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}

export function RecentFailuresTable({
  failures,
}: {
  failures: AiFailureRecord[];
}) {
  return (
    <TableCard
      title="Lần hỏng gần nhất"
      description={`Tối đa ${FAILURE_LIMIT} bản ghi mới nhất, không phụ thuộc khoảng thời gian đang chọn.`}
    >
      {failures.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-slate-500">
          Chưa ghi nhận lần hỏng nào.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời điểm</TableHead>
              <TableHead>Tác vụ</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-right">Kéo dài</TableHead>
              <TableHead>Thông báo lỗi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {failures.map((record) => {
              const meta = FAILURE_KINDS.find(
                (entry) => entry.kind === (record.failureKind ?? "OTHER"),
              );
              return (
                <TableRow key={record.id}>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {formatDateTime(record.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {purposeLabel(record.purpose)}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-slate-500">
                    {record.provider} · {record.modelId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={meta?.variant ?? "neutral"}>
                      {meta?.label ?? "OTHER"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatDuration(record.durationMs)}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-xs text-slate-500">
                    {record.errorMessage ?? "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </TableCard>
  );
}
