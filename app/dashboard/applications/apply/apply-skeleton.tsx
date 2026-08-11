import { Skeleton, SkeletonGrid, SkeletonPage } from "@/components/ui/skeleton";

/**
 * Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong.
 *
 * Dùng ở hai chỗ: ranh giới Suspense của `page.tsx` (lúc đọc `?job=`) và lúc
 * `ApplyView` còn đang chờ hai lời gọi API. Cùng một màn hình chờ, nên chỉ có
 * một chỗ mô tả nó.
 */
export function ApplySkeleton({ withGrid = true }: { withGrid?: boolean }) {
  return (
    <SkeletonPage>
      <Skeleton className="h-14 w-72" />
      <Skeleton className="h-20" />
      {withGrid && (
        <SkeletonGrid
          count={4}
          className="grid gap-3 lg:grid-cols-2"
          itemClassName="h-28 rounded-2xl"
        />
      )}
    </SkeletonPage>
  );
}
