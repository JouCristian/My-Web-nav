// src/components/hide-spacetime.tsx
"use client"

import { useEffect } from "react"

export function HideSpacetime() {
  useEffect(() => {
    // 隐身协议
    const toggleSpacetimeBtn = (display: string) => {
      const btns = Array.from(document.querySelectorAll('button'));
      btns.forEach(btn => {
        const text = btn.textContent || "";
        // 精准狙击包含这几个关键词的全局按钮
        if (text.includes('时空') || text.includes('SPACETIME') || text.includes('航线')) {
          btn.style.setProperty('display', display, 'important');
        }
      });
    };

    // 挂载时启动隐形
    toggleSpacetimeBtn('none');
    // 维持 1 秒的轮询，确保哪怕全局组件渲染较慢也能被成功狙击
    const timer = setInterval(() => toggleSpacetimeBtn('none'), 100);
    setTimeout(() => clearInterval(timer), 1000);

    // 离开登录页时解除隐形
    return () => {
      clearInterval(timer);
      toggleSpacetimeBtn(''); // 恢复原样
    }
  }, [])

  return null
}