"use client"

import Link from "next/link"

interface TransitionLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

/**
 * 简洁的导航链接。
 * 历史上这里会反向触发隐藏的"切换时空"按钮以实现背景同步切换。
 * 现在背景已统一为全局 DotField + Aurora，不再需要这个副作用，恢复为纯链接。
 */
export function TransitionLink({ href, children, className }: TransitionLinkProps) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
