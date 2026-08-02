import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body>{children}</body>
    </html>
  );
}
