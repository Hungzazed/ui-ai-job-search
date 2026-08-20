import { Suspense } from "react";
import { AppLayout } from "@/components/dashboard/app-layout";
import { SessionProvider } from "@/components/dashboard/session";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      {/*
        Sidebar đọc useSearchParams để phân biệt "Việc làm" với "Đã chấm" (cùng
        /dashboard/jobs, khác ?scored=1). Không bọc Suspense thì MỌI trang
        dashboard đều hỏng ở bước prerender của `next build`, chứ không riêng
        trang nào.
      */}
      <AppLayout
        sidebar={
          <Suspense>
            <Sidebar />
          </Suspense>
        }
      >
        {children}
      </AppLayout>
    </SessionProvider>
  );
}
