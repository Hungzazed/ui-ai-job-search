import { Briefcase, History, Percent, User } from "lucide-react";
import type { DashboardOverview } from "@/types";
import { StatCard } from "@/components/dashboard/stat-card";

/** Bốn ô số liệu dưới dải chào mừng. */
export function DashboardStats({ data }: { data: DashboardOverview }) {
  const { matchingJobs, applications, todayScore } = data;
  const hasScores = todayScore.sampleSize > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Hồ sơ của bạn"
        icon={User}
        value={`${data.profileCompletion}%`}
        subtitle="Hoàn thiện hồ sơ để tăng độ chính xác khi chấm điểm"
        actionLabel="Cập nhật thông tin"
        progress={data.profileCompletion}
      />
      <StatCard
        title="Việc làm phù hợp"
        icon={Briefcase}
        value={matchingJobs.total.toString()}
        subtitle={
          matchingJobs.newThisWeek > 0
            ? `+${matchingJobs.newThisWeek} việc làm mới tuần này`
            : "Chưa có việc mới trong tuần"
        }
        actionLabel="Xem việc phù hợp"
      />
      <StatCard
        title="Đơn ứng tuyển"
        icon={History}
        value={applications.total.toString()}
        subtitle={
          applications.active > 0
            ? `${applications.active} đơn đang chờ kết quả`
            : "Chưa có đơn nào đang mở"
        }
        actionLabel="Lịch sử ứng tuyển"
      />
      <StatCard
        title="Tỷ lệ match TB"
        icon={Percent}
        // Chưa có lần chấm nào thì hiện gạch ngang. Hiện "0%" sẽ bị đọc thành
        // "hồ sơ của bạn không hợp với việc nào", một kết luận sai hẳn.
        value={
          data.averageMatchScore === null ? "—" : `${data.averageMatchScore}%`
        }
        subtitle={
          hasScores
            ? `Tính trên ${matchingJobs.total} việc đã chấm`
            : "Chưa có dữ liệu chấm điểm"
        }
        actionLabel="Chi tiết phân tích"
      />
    </div>
  );
}
