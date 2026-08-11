import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton, SkeletonGrid, SkeletonPage } from "@/components/ui/skeleton";

/**
 * Không phải hỏng hóc, nên không dùng hộp lỗi đỏ.
 *
 * Người dùng thường vào đây do lần theo một liên kết; nói rõ trang dành cho ai
 * và mở sẵn đường về còn hữu ích hơn một mã lỗi 403.
 */
export function AccessDenied() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <ShieldAlert className="size-5" />
          </span>
          <p className="text-base font-semibold text-slate-900">
            Bạn không có quyền truy cập trang này
          </p>
          <p className="max-w-sm text-sm text-slate-500">
            Trang quản trị chỉ dành cho tài khoản có vai trò quản trị viên. Nếu
            bạn cho rằng đây là nhầm lẫn, hãy liên hệ người quản trị hệ thống.
          </p>
          <Link href="/dashboard" className="mt-1">
            <Button variant="outline">
              <ArrowLeft className="size-4" />
              Về trang chính
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

/** Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong. */
export function AdminSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-14 w-80" />
      <Skeleton className="h-10 max-w-sm" />
      <HealthSkeleton />
    </SkeletonPage>
  );
}

export function HealthSkeleton() {
  return (
    <SkeletonPage>
      <SkeletonGrid
        count={4}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        itemClassName="h-28"
      />
      <Skeleton className="h-44" />
      <Skeleton className="h-64" />
      <Skeleton className="h-52" />
    </SkeletonPage>
  );
}
