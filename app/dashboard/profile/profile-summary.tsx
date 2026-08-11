import type { AuthUser } from "@/types";
import type { ProfileRecord } from "@/services";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { personInitials } from "@/utils";

/** Một dòng "nhãn: giá trị"; thiếu dữ liệu thì nói thẳng là chưa điền. */
function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="text-slate-400">{label}: </span>
      {value || "chưa điền"}
    </p>
  );
}

/** Thẻ danh thiếp và vòng tròn mức hoàn thiện, đặt trên các tab chỉnh sửa. */
export function ProfileSummary({
  profile,
  user,
}: {
  profile: ProfileRecord;
  user: AuthUser | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2">
        <div className="flex items-center gap-3">
          <div className="from-primary-600 flex size-12 items-center justify-center rounded-full bg-gradient-to-br to-indigo-500 text-sm font-bold text-white">
            {personInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-900">
                {user?.name ?? "—"}
              </p>
              {user?.role === "ADMIN" && (
                <Badge variant="primary">Quản trị</Badge>
              )}
            </div>
            <p className="truncate text-xs text-slate-400">
              {user?.email ?? "—"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <SummaryLine label="Chức danh" value={profile.headline ?? ""} />
          <SummaryLine
            label="Địa điểm"
            value={[profile.location, profile.country].filter(Boolean).join(", ")}
          />
          <SummaryLine
            label="Tình trạng"
            value={profile.employmentStatus ?? ""}
          />
          <SummaryLine
            label="Kỹ năng chính"
            value={
              profile.primarySkills.length > 0
                ? `${profile.primarySkills.length} kỹ năng`
                : ""
            }
          />
        </div>
      </Card>

      <Card className="flex flex-col items-center gap-3 p-5">
        <ProgressCircle value={profile.completion} size={110} strokeWidth={9}>
          <span className="font-mono text-xl font-bold text-slate-900">
            {profile.completion}%
          </span>
          <span className="text-[10px] text-slate-400">hoàn thiện</span>
        </ProgressCircle>
        <Progress value={profile.completion} className="w-full" />
        <p className="text-center text-xs leading-relaxed text-slate-400">
          Hồ sơ chưa đủ dữ liệu sẽ bị bỏ qua khi hệ thống chấm điểm tự động.
        </p>
      </Card>
    </div>
  );
}

/** Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong. */
export function ProfileSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-14 w-72" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-44 lg:col-span-2" />
        <Skeleton className="h-44" />
      </div>
      <Skeleton className="h-11" />
      <Skeleton className="h-96" />
    </SkeletonPage>
  );
}
