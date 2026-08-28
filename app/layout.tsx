import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import { QueryProvider } from "@/lib/query-client";
import { FONT_SCALE_BOOTSTRAP } from "@/lib/font-scale";
import { SIDEBAR_BOOTSTRAP } from "@/lib/sidebar";
import { THEME_BOOTSTRAP } from "@/lib/theme";
import "./globals.css";

const googleSans = Google_Sans_Flex({
  subsets: ["latin", "vietnamese"],
  axes: ["opsz"],
  variable: "--font-google-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Careelot",
  description:
    "Dashboard ứng dụng Careelot: phân tích AI match, tối ưu CV, cover letter và theo dõi quy trình ứng tuyển.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={googleSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <script dangerouslySetInnerHTML={{ __html: FONT_SCALE_BOOTSTRAP }} />
        <script dangerouslySetInnerHTML={{ __html: SIDEBAR_BOOTSTRAP }} />
      </head>
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
