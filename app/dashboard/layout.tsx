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
      <AppLayout sidebar={<Sidebar />}>{children}</AppLayout>
    </SessionProvider>
  );
}
