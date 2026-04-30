// src/components/dock.tsx
'use client';

import { motion, MotionValue, useMotionValue, useSpring, useTransform, type SpringOptions, AnimatePresence } from 'framer-motion';
import React, { Children, cloneElement, useEffect, useRef, useState } from 'react';
import GlassSurface from './GlassSurface';

import './dock.css';

export type DockItemData = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
};

function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, child =>
        React.isValidElement(child) ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered }) : child
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = '', isHovered }: { className?: string, children: React.ReactNode, isHovered?: MotionValue<number> }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', latest => { setIsVisible(latest === 1); });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className={`dock-label ${className}`} role="tooltip">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }: { className?: string, children: React.ReactNode, isHovered?: MotionValue<number> }) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 65,
  distance = 150,
  panelHeight = 58,
  baseItemSize = 42
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  useEffect(() => {
    const handleScroll = () => mouseX.set(Infinity);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mouseX]);

  return (
    <div className="dock-outer">
      <div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={`dock-panel ${className}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: -10, pointerEvents: 'none', borderRadius: 'inherit' }}>
          {/* 🚀 严格按照截图参数复原：极高清晰度的边缘色散光学玻璃 */}
          <GlassSurface
            width="100%"
            height="100%"
            borderRadius={50}
            backgroundOpacity={0.37}
            saturation={1}
            borderWidth={0.07}
            brightness={50}
            opacity={0.93}
            blur={11}
            displace={0.5} 
            distortionScale={-180}
            redOffset={0}
            greenOffset={10}
            blueOffset={20}
          />
        </div>

        {items.map((item, index) => (
          <DockItem key={index} onClick={item.onClick} className={item.className} mouseX={mouseX} spring={spring} distance={distance} magnification={magnification} baseItemSize={baseItemSize}>
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </div>
    </div>
  );
}