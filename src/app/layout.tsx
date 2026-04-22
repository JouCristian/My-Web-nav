import type { Metadata } from "next";
// 🚀 引入 Space Grotesk 字体
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// 🚀 1. 引入我们刚刚创建的“曲率引擎”动态背景
import { ScrollBackground } from "@/components/scroll-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "西科星际导航站",
  description: "跨星际管理你的书签",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      // 🚀 将新的字体变量注入到全局
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-white">
        <ScrollBackground />
        <div className="relative z-0 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
