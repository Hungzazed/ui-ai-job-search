import { AppLayout } from "@/components/dashboard/app-layout";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppLayout sidebar={<Sidebar />}>
      {children}
    </AppLayout>
  );
}
