"use client";

import { useApiQuery } from "@/hooks/use-api-query";
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
  const { user, loading: loadingUser } = useSession();
  const { data, error } = useApiQuery(
    ["dashboard", "overview"],
    () => dashboardService.overview(),
    { errorMessage: "Không tải được dữ liệu tổng quan" },
  );

  if (error) return <PageError title="Không tải được dữ liệu" message={error} />;
  if (!data || loadingUser) return <DashboardSkeleton />;
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
