// src/components/hide-spacetime.tsx
"use client"

import { useEffect } from "react"

export function HideSpacetime() {
  useEffect(() => {
    // 🚀 终极光学迷彩：精准狙击
    const sniperHide = () => {
      // 扩大搜索雷达：把 a 标签（Link）和自定义的 role="button" 全部纳入扫描
      const targets = document.querySelectorAll('button, a, [role="button"]');
      
      targets.forEach(el => {
        const text = el.textContent?.toUpperCase() || "";
        // 锁定特征码 (确保只隐藏短文本按钮，长度 < 50 防止误伤页面的大段文字)
        if (text.length < 50 && (
          text.includes('时空') || 
          text.includes('SPACETIME') || 
          text.includes('航线')
        )) {
          // 如果按钮外部有 fixed 悬浮包裹层，连同外壳一起隐藏
          const parent = el.parentElement;
          if (parent && parent.className.includes('fixed')) {
            parent.style.setProperty('display', 'none', 'important');
          } else {
            (el as HTMLElement).style.setProperty('display', 'none', 'important');
          }
        }
      });
    };

    // 1. 落地瞬间执行首次打击
    sniperHide();

    // 2. 部署「量子监听网」(MutationObserver)：只要 React 敢把它重绘出来，立刻按死
    const observer = new MutationObserver(() => {
      sniperHide();
    });

    observer.observe(document.body, {
      childList: true, // 监听子节点的添加或删除
      subtree: true,   // 监听整个 DOM 树
    });

    // 3. 离开登录页时，解除隐形，把按钮还给系统
    return () => {
      observer.disconnect();
      const targets = document.querySelectorAll('button, a, [role="button"]');
      targets.forEach(el => {
        const text = el.textContent?.toUpperCase() || "";
        if (text.length < 50 && (
          text.includes('时空') || 
          text.includes('SPACETIME') || 
          text.includes('航线')
        )) {
          const parent = el.parentElement;
          if (parent && parent.className.includes('fixed')) {
            parent.style.removeProperty('display');
          } else {
            (el as HTMLElement).style.removeProperty('display');
          }
        }
      });
    };
  }, []);

  return null;
}