"use client"

import Link from "next/link"

interface TransitionLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function TransitionLink({ href, children, className }: TransitionLinkProps) {
  const handleClick = () => {
    // 🚀 核心：寻找并触发隐藏的时空切换按钮
    const buttons = Array.from(document.querySelectorAll('button'));
    const shiftBtn = buttons.find(btn => {
      const text = btn.textContent || "";
      return text.includes('SPACETIME') || 
             text.includes('时空') || 
             text.includes('航线') || 
             text.includes('星际') || 
             text.includes('轨道') || 
             text.includes('深空') || 
             text.includes('默认');
    });
    
    if (shiftBtn) {
      shiftBtn.click();
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}