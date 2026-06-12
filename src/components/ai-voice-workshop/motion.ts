import type { Transition, Variants } from "framer-motion"

export const voiceSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.72,
}

export const voiceFastSpring: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 38,
  mass: 0.62,
}

export const voiceLayoutSpring: Transition = {
  type: "spring",
  stiffness: 360,
  damping: 36,
  mass: 0.78,
}

export const voiceErrorTransition: Transition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
}

export const voicePopoverVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.965,
    y: -8,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    scale: 0.975,
    y: -5,
    filter: "blur(3px)",
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
}

export const voiceFadeScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.985, y: 5 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: {
    opacity: 0,
    scale: 0.99,
    y: -3,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
  },
}

export const voiceHover = { y: -1 }
export const voiceTap = { scale: 0.975 }

// 页面整体入场：stagger 容器
export const voicePageContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
}

// 每个区块的入场动画（从下方淡入 + 轻微上升）
export const voicePageItem: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 30,
      mass: 0.8,
    },
  },
}
