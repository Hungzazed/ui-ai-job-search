import { Gauge, Pulse, Robot, Timer } from "@phosphor-icons/react/ssr";
import type { AiHealth } from "@/services";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCount, formatDuration, successRateTone } from "@/utils";

/** Bốn con số đầu trang, kèm một dòng giải thích vì sao đọc phân vị chứ không đọc trung bình. */
export function HealthStats({ health }: { health: AiHealth }) {
  const failed = health.total - health.ok;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng lời gọi"
          icon={Robot}
          value={formatCount(health.total)}
          subtitle={`${formatCount(health.ok)} thành công · ${formatCount(failed)} hỏng`}
        />
        <StatCard
          title="Tỷ lệ thành công"
          icon={Pulse}
          // Backend đã làm tròn 1 chữ số thập phân: 97.3% và 97% là hai thông
          // điệp khác nhau khi đang cân nhắc đổi nhà cung cấp. Giữ nguyên.
          value={`${health.successRate}%`}
          subtitle={
            failed > 0
              ? `${formatCount(failed)} lời gọi không cho ra kết quả dùng được`
              : "Không có lời gọi nào hỏng"
          }
          className={successRateTone(health.successRate).border}
        />
        <StatCard
          title="Độ trễ p50"
          icon={Gauge}
          value={formatDuration(health.p50Ms)}
          subtitle="Một nửa số lời gọi nhanh hơn mức này"
        />
        <StatCard
          title="Độ trễ p95"
          icon={Timer}
          value={formatDuration(health.p95Ms)}
          subtitle="20 lời gọi thì 1 lần chậm hơn mức này"
        />
      </div>

      {/* Trung bình cố ý vắng mặt: đuôi độ trễ rất dài (đã đo được một lần 517
          giây) sẽ kéo trung bình lên và che mất việc phần lớn lần gọi đều nhanh. */}
      <p className="text-xs text-slate-500">
        Độ trễ đọc theo phân vị chứ không theo trung bình: đuôi thời gian gọi
        model rất dài, một lần chờ 517 giây đủ sức kéo trung bình lên và che mất
        thực tế là phần lớn lời gọi đều nhanh.
      </p>
    </>
  );
}
