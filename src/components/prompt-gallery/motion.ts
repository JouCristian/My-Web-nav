// 提示词工坊统一的非线性动画缓动曲线
// 入场用强减速（快进慢停，吸引视线），退场用快收（慢起快走，干净利落）

// expo-out：强烈减速，适合元素入场
export const easeOutExpo = [0.22, 1, 0.36, 1] as const
// expo/quint-in：先慢后快，适合元素退场
export const easeInQuint = [0.64, 0, 0.78, 0] as const
// 一笔画描边专用：更顺滑的收尾
export const easeStroke = [0.16, 1, 0.3, 1] as const
// 带轻微回弹，适合强调态
export const easeOutBack = [0.34, 1.4, 0.64, 1] as const

// 卡片网格错峰入场容器
export const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.02, staggerDirection: -1 },
  },
}

// 单张卡片：入场强减速、退场快收
export const gridItemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.98,
    transition: { duration: 0.22, ease: easeInQuint },
  },
}
