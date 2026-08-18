import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/lib/query-client";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Career Agent — Hệ thống hỗ trợ tìm việc & tối ưu CV bằng AI",
  description:
    "Dashboard ứng dụng AI Career Agent: phân tích AI match, tối ưu CV, cover letter và theo dõi quy trình ứng tuyển.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      {/*
        QueryProvider bọc ở layout GỐC chứ không ở layout dashboard: trang đăng
        nhập và đăng ký cũng gọi API, và một ngày nào đó chúng cũng sẽ muốn
        cache. Nó là client component nên phần còn lại của cây vẫn render trên
        máy chủ như cũ.
      */}
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
