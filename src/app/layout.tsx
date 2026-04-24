// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// 🚀 引入“曲率引擎”动态背景，它将在此处获得超越所有页面的永久生命周期
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
      {/* 添加极暗底色兜底，防止跃迁瞬间白屏 */}
      <body className="min-h-full flex flex-col text-white bg-[#020205]">
        
        {/* 🚀 无论路由如何切换，ScrollBackground 永远不会被销毁，完美保存航线状态 */}
        <ScrollBackground />
        
        {/* 🚀 主内容区，提升 z-index 至 10 确保永远浮在星空之上 */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
        
      </body>
    </html>
  );
}