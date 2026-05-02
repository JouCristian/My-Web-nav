// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// 🚀 引入背景包装组件（内部动态导入脉冲极光背景）
import { BackgroundWrapper } from "@/components/background-wrapper";

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

// 🚀 移动端关键：必须的视口配置，确保所有手机屏幕正确缩放和适配
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#020205",
  viewportFit: "cover",
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
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased bg-[#020205]`}
    >
      {/* 添加极暗底色兜底，防止跃迁瞬间白屏；移动端禁用横向滚动 */}
      <body className="min-h-full flex flex-col text-white bg-[#020205] overflow-x-hidden">
        
        {/* 🚀 脉冲极光背景：轻量级 WebGL + CSS 渐变，loading 时触发极光爆发效果 */}
        <BackgroundWrapper />
        
        {/* 🚀 主内容区，提升 z-index 至 10 确保永远浮在星空之上 */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
        
      </body>
    </html>
  );
}
