import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

// 🚀 2. 顺手帮你把浏览器的默认标签页标题和描述改了
export const metadata: Metadata = {
  title: "我的星际导航站",
  description: "跨星际管理你的书签",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN" // 🚀 3. 既然是中文站，把语言标识改为 zh-CN 对 SEO 更好
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* 删掉了 bg-black，让 body 背景变透明，露出底下的动态星云 */}
        <body className="min-h-full flex flex-col text-white">
        
        {/* 🚀 5. 植入动态星云背景！它在组件内部自带了 z-[-1] 不会挡住内容 */}
        <ScrollBackground />
        
        {/* 🚀 6. 把你的页面主体内容包一层 relative，确保它永远浮在背景上面 */}
        <div className="relative z-0 flex-1 flex flex-col">
          {children}
        </div>
        
      </body>
    </html>
  );
}