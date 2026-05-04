"use client";

import React, { useEffect, useRef, useState, useId, useCallback } from 'react';
import './GlassSurface.css';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  className?: string;
  style?: React.CSSProperties;
}

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0.5,
  backgroundOpacity = 0.1,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  className = '',
  style = {}
}) => {
  const id = useId();
  const filterId = `glass-filter-${id.replace(/:/g, '')}`;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 80 });

  // 生成位移贴图
  const generateDisplacementMap = useCallback(() => {
    const actualWidth = dimensions.width;
    const actualHeight = dimensions.height;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    return `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="redGrad-${filterId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="blueGrad-${filterId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"/>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#redGrad-${filterId})"/>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#blueGrad-${filterId})" style="mix-blend-mode: difference"/>
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)"/>
      </svg>
    `;
  }, [dimensions, borderWidth, borderRadius, brightness, opacity, blur, filterId]);

  // 应用位移效果到 Canvas
  const applyDisplacementEffect = useCallback(async () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // 加载位移贴图
    const mapSvg = generateDisplacementMap();
    const mapImg = new Image();
    mapImg.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve) => {
      mapImg.onload = () => resolve();
      mapImg.onerror = () => resolve();
      mapImg.src = `data:image/svg+xml,${encodeURIComponent(mapSvg)}`;
    });

    // 绘制位移贴图到临时 canvas 获取像素数据
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = rect.width;
    mapCanvas.height = rect.height;
    const mapCtx = mapCanvas.getContext('2d');
    if (!mapCtx) return;
    
    mapCtx.drawImage(mapImg, 0, 0, rect.width, rect.height);
    const mapData = mapCtx.getImageData(0, 0, rect.width, rect.height);

    // 使用 html2canvas 或直接截取背景（这里用简化方案 - 模拟背景）
    // 由于无法直接截取背景，我们创建一个模拟的玻璃效果
    
    // 清除画布
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // 绘制边缘折射效果
    const scale = Math.abs(distortionScale) / 100;
    
    // 红色通道偏移
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(255, 50, 50, ${0.15 * scale})`;
    ctx.translate(redOffset * 0.1, 0);
    roundRect(ctx, -2, -2, rect.width + 4, rect.height + 4, borderRadius);
    ctx.fill();
    ctx.restore();
    
    // 绿色通道偏移
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(50, 255, 50, ${0.1 * scale})`;
    ctx.translate(greenOffset * 0.05, greenOffset * 0.05);
    roundRect(ctx, -1, -1, rect.width + 2, rect.height + 2, borderRadius);
    ctx.fill();
    ctx.restore();
    
    // 蓝色通道偏移
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(50, 50, 255, ${0.15 * scale})`;
    ctx.translate(-blueOffset * 0.1, blueOffset * 0.05);
    roundRect(ctx, -3, -3, rect.width + 6, rect.height + 6, borderRadius);
    ctx.fill();
    ctx.restore();

  }, [generateDisplacementMap, distortionScale, redOffset, greenOffset, blueOffset, borderRadius]);

  // 绘制圆角矩形
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // 监听尺寸变化
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // 应用效果
  useEffect(() => {
    applyDisplacementEffect();
  }, [applyDisplacementEffect]);

  // 处理 width/height 为 "auto" 的情况
  const resolvedWidth = width === 'auto' ? 'fit-content' : (typeof width === 'number' ? `${width}px` : width);
  const resolvedHeight = height === 'auto' ? 'fit-content' : (typeof height === 'number' ? `${height}px` : height);

  const containerStyle: React.CSSProperties = {
    ...style,
    width: resolvedWidth,
    height: resolvedHeight,
    borderRadius: `${borderRadius}px`,
    '--glass-frost': backgroundOpacity,
    '--glass-saturation': saturation,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`glass-surface glass-surface--active ${className}`}
      style={containerStyle}
    >
      {/* Canvas 层 - 边缘折射效果 */}
      <canvas 
        ref={canvasRef} 
        className="glass-surface__canvas"
        style={{
          position: 'absolute',
          inset: '-4px',
          width: 'calc(100% + 8px)',
          height: 'calc(100% + 8px)',
          pointerEvents: 'none',
          zIndex: 0,
          borderRadius: `${borderRadius + 4}px`,
        }}
      />
      
      {/* 玻璃背景层 */}
      <div 
        className="glass-surface__glass"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${borderRadius}px`,
          background: `rgba(10, 15, 30, ${backgroundOpacity})`,
          backdropFilter: `blur(${blur}px) saturate(${saturation})`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation})`,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `
            inset 0 1px 2px rgba(255, 255, 255, 0.1),
            inset 0 -1px 2px rgba(0, 0, 0, 0.1),
            0 8px 32px rgba(0, 0, 0, 0.3)
          `,
          zIndex: 1,
        }}
      />
      
      {/* 内容层 */}
      <div className="glass-surface__content" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
