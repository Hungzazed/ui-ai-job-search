import type { AiFailureRecord, AiHealth } from "@/services";
import { FailureKindsCard } from "./failure-kinds";
import { HealthStats } from "./health-stats";
import {
  ModelTable,
  PurposeTable,
  RecentFailuresTable,
} from "./health-tables";

/**
 * Thứ tự đọc từ tổng quan xuống chi tiết: bốn con số → phân loại nguyên nhân →
 * cắt theo tác vụ → cắt theo model → nhật ký từng lần hỏng.
 */
export function HealthReport({
  health,
  failures,
}: {
  health: AiHealth;
  failures: AiFailureRecord[];
}) {
  return (
    <div className="space-y-6">
      <HealthStats health={health} />
      <FailureKindsCard health={health} />
      <PurposeTable rows={health.byPurpose} />
      <ModelTable rows={health.byModel} />
      <RecentFailuresTable failures={failures} />
    </div>
  );
}
