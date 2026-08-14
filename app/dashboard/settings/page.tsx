"use client";

import Link from "next/link";
import { LogOut, Shield, UserCog } from "lucide-react";
import { useSession } from "@/components/dashboard/session";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Trang tài khoản.
 *
 * Bản trước của trang này hiển thị thông tin cá nhân BỊA — "Nguyễn Minh An",
 * "minhan.nguyen@gmail.com", "+84 90 123 4567" — như thể đó là tài khoản đang
 * đăng nhập, kèm một nút Lưu hiện "Đã lưu ✓" mà không gọi mạng lần nào. Nó lại
 * nằm ngay trên thanh điều hướng chính, nên là thứ đầu tiên một người thử hệ
 * thống bấm vào.
 *
 * Bản này chỉ hiện những gì backend thật sự có, và nói thẳng những gì chưa có.
 * Ba khối đã bị gỡ và lý do:
 *
 * - **Số điện thoại**: không có trường nào tương ứng ở `User` lẫn `Profile`.
 * - **Chọn ngôn ngữ giao diện**: không có i18n. Mọi chuỗi trong ứng dụng là chữ
 *   tiếng Việt viết thẳng trong JSX, nên một ô chọn "English" là lời hứa suông.
 * - **Tuỳ chọn thông báo**: không có hệ thống thông báo, cũng không có email.
 */
export default function SettingsPage() {
  const { user, loading, logout } = useSession();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tài khoản"
        subtitle="Thông tin đăng nhập và cách dữ liệu của bạn được dùng"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          icon={UserCog}
          title="Thông tin đăng nhập"
          description="Đọc từ phiên đang đăng nhập. Chưa đổi được từ giao diện — backend chưa có endpoint cập nhật tên hay email."
          className="h-fit lg:col-span-2"
        >
          {loading ? (
            <Skeleton className="h-24 animate-pulse" />
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-400">Họ và tên</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {user?.name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Email</dt>
                <dd className="mt-0.5 font-mono text-sm text-slate-900">
                  {user?.email ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Vai trò</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {user?.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                </dd>
              </div>
            </dl>
          )}

          <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
            Kỹ năng, kinh nghiệm và định hướng nghề nghiệp — những thứ hệ thống
            dùng để chấm điểm việc làm và viết CV — nằm ở{" "}
            <Link
              href="/dashboard/profile"
              className="font-medium text-slate-900 underline underline-offset-2"
            >
              Hồ sơ của tôi
            </Link>
            .
          </p>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard icon={Shield} title="Dữ liệu của bạn đi những đâu" compact>
            {/*
              Nói đúng sự thật thay vì một câu trấn an.

              Bản trước viết "hồ sơ chỉ hiển thị cho nhà tuyển dụng khi bạn chủ
              động ứng tuyển" — câu đó sai theo hai hướng: hệ thống KHÔNG gửi hồ
              sơ cho nhà tuyển dụng nào cả (bạn tự nộp), nhưng nó CÓ gửi nội dung
              hồ sơ tới nhà cung cấp model, điều mà câu kia không hề nhắc tới.
            */}
            <ul className="space-y-2.5 text-xs leading-relaxed text-slate-600">
              <li>
                Hồ sơ được gửi tới <strong>nhà cung cấp model</strong> mỗi lần
                chấm điểm việc làm hoặc sinh CV — đó là cách hệ thống hoạt động.
              </li>
              <li>
                Hệ thống <strong>không gửi hồ sơ cho nhà tuyển dụng nào</strong>.
                Việc nộp hồ sơ trên trang tuyển dụng vẫn do bạn tự làm.
              </li>
              <li>
                CV và thư xin việc đã sinh được lưu trên máy chủ của hệ thống, chỉ
                tài khoản của bạn đọc được.
              </li>
            </ul>
          </SectionCard>

          <Card className="p-5">
            <p className="text-sm font-medium text-slate-900">Đăng xuất</p>
            <p className="mt-1 text-xs text-slate-400">
              Xoá cookie đăng nhập trên thiết bị này.
            </p>
            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={() => void logout()}
            >
              <LogOut className="size-4" />
              Đăng xuất
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
