"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardOverview } from "@/types";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { dashboardService } from "@/services";
import { AISuggestionCard } from "@/components/dashboard/ai-suggestion-card";
import { useSession } from "@/components/dashboard/session";
import { PageError } from "@/components/ui/alert";
import { Skeleton, SkeletonGrid, SkeletonPage } from "@/components/ui/skeleton";
import { DashboardHero } from "./dashboard-hero";
import { DashboardStats } from "./dashboard-stats";
import { ScoreBreakdown } from "./score-breakdown";
import { TopMatches } from "./top-matches";

export default function DashboardPage() {
  const router = useRouter();
  // Người dùng đã được SessionProvider của layout tải sẵn — gọi lại `/auth/me`
  // ở đây là một request thứ hai cho đúng dữ liệu đang nằm sẵn trong context.
  const { user, loading: loadingUser } = useSession();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const overview = await dashboardService.overview();
        if (cancelled) return;
        setData(overview);
      } catch (err) {
        if (cancelled) return;
        // Cookie hết hạn giữa chừng: đưa về đăng nhập thay vì hiện lỗi mà người
        // dùng không làm gì được.
        if (apiErrorStatus(err) === 401) {
          router.replace("/login?next=/dashboard");
          return;
        }
        setError(apiErrorMessage(err, "Không tải được dữ liệu tổng quan"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) return <PageError title="Không tải được dữ liệu" message={error} />;

  // Chờ cả tên người dùng, không chỉ dữ liệu: hiện "Xin chào, bạn" rồi vài
  // trăm mili giây sau đổi thành tên thật là một cú nháy không cần thiết.
  if (!data || loadingUser) return <DashboardSkeleton />;

  // Hai từ cuối của họ tên: tiếng Việt đặt tên riêng ở cuối, nên gọi bằng hai
  // từ đầu sẽ ra "Nguyễn Văn" — nghe như đang gọi họ chứ không gọi tên.
  const firstName = user?.name.split(" ").slice(-2).join(" ") ?? "bạn";

  return (
    <div className="space-y-6">
      <DashboardHero firstName={firstName} data={data} />
      <DashboardStats data={data} />
      <TopMatches matches={data.topMatches} />

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AISuggestionCard suggestions={data.suggestions} />
        </div>
        <ScoreBreakdown todayScore={data.todayScore} />
      </section>
    </div>
  );
}

/** Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong. */
function DashboardSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-36" />
      <SkeletonGrid
        count={4}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        itemClassName="h-28"
      />
      <SkeletonGrid
        count={3}
        className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3"
        itemClassName="h-52"
      />
    </SkeletonPage>
  );
}
