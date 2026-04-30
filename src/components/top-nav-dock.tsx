// src/components/top-nav-dock.tsx
"use client"

import { useRouter } from "next/navigation"
import Dock, { DockItemData } from "./dock"

export function TopNavDock({ session, dbUser, isCaptain, onSignOut }: any) {
  const router = useRouter();

  const isAuthorized = isCaptain || (dbUser && (dbUser.role === "ADMIN" || dbUser.role === "OWNER" || dbUser.role === "MEMBER"));

  // 头像渲染逻辑 (支持 Gitee/GitHub 及自定义头像)
  const avatarImage = dbUser?.customAvatar || session?.user?.image;

  const items: DockItemData[] = [
    {
      label: '星际导航站',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
      onClick: () => router.push('/')
    },
    ...(isAuthorized ? [{
      label: '舰队中枢',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>,
      onClick: () => router.push('/dashboard')
    }] : []),
    ...(!isCaptain ? [{
      label: '联系舰长',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
      onClick: () => router.push('/contact')
    }] : []),
    
    // 🚀 新增：GitHub 源码仓库跃迁通道 (原生 SVG)
    {
      label: 'GitHub 核心仓库',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>,
      onClick: () => window.open("https://github.com/JouCristian/YSYX-Single-Cycle-CPU", "_blank", "noopener,noreferrer")
    },
    
    // 🚀 新增：一生一芯官网档案库 (原生 SVG CPU 芯片图标)
    {
      label: '一生一芯官网',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>,
      onClick: () => window.open("https://ysyx.oscc.cc/", "_blank", "noopener,noreferrer")
    },

    ...(session ? [
      {
        label: '宇航员档案',
        icon: avatarImage 
          ? <img src={avatarImage} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> 
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        onClick: () => router.push('/profile')
      },
      {
        label: '退出登入',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
        onClick: onSignOut,
        className: 'hover:!bg-red-500/20 hover:!border-red-500/50 hover:!text-red-400 hover:!shadow-[0_0_15px_rgba(239,68,68,0.5)]'
      }
    ] : [
      {
        label: '授权登入',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
        onClick: () => router.push('/login'),
        className: 'hover:!bg-blue-500/20 hover:!border-blue-500/50 hover:!text-blue-400 hover:!shadow-[0_0_15px_rgba(59,130,246,0.5)]'
      }
    ])
  ];

  return <Dock items={items} />;
}