"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { dashboardService } from "@/services";
import { AISuggestionCard } from "@/components/dashboard/ai-suggestion-card";
import { useSession } from "@/components/dashboard/session";
import { PageError } from "@/components/ui/alert";
import { Skeleton, SkeletonGrid, SkeletonPage } from "@/components/ui/skeleton";
import { onboardingLevel } from "./onboarding-state";
import { FirstRun } from "./first-run";
import { QuickStrip } from "./quick-strip";
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

  if (onboardingLevel(data) === "takeover") {
    return <FirstRun firstName={firstName} data={data} />;
  }

  return (
    <div className="space-y-5">
      <QuickStrip data={data} />
      <TopMatches matches={data.topMatches} />

      <AISuggestionCard suggestions={data.suggestions} />
      <ScoreBreakdown todayScore={data.todayScore} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-8" />
      <SkeletonGrid
        count={3}
        className="grid gap-4 xl:grid-cols-3"
        itemClassName="h-52"
      />
    </SkeletonPage>
  );
}
