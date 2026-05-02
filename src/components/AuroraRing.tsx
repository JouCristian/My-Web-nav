// src/components/AuroraRing.tsx
"use client";

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// 环形极光 Fragment Shader
const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uScale;        // 呼吸缩放
uniform float uRingRadius;   // 环的基础半径
uniform float uRingWidth;    // 环的宽度

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  // 将坐标中心移到屏幕底部中央
  vec2 center = vec2(0.5, 0.0);
  vec2 pos = uv - center;
  
  // 调整纵横比
  float aspect = uResolution.x / uResolution.y;
  pos.x *= aspect;
  
  // 计算极坐标
  float dist = length(pos);
  float angle = atan(pos.y, pos.x);
  
  // 环的半径（应用呼吸缩放）
  float scaledRadius = uRingRadius * uScale;
  float ringWidth = uRingWidth * uScale;
  
  // 沿环的角度采样噪声，创造波动效果
  float noiseFreq = 3.0;
  float noiseAmp = uAmplitude * 0.08;
  float noise1 = snoise(vec2(angle * noiseFreq + uTime * 0.15, uTime * 0.1)) * noiseAmp;
  float noise2 = snoise(vec2(angle * noiseFreq * 2.0 - uTime * 0.12, uTime * 0.08)) * noiseAmp * 0.5;
  float noise3 = snoise(vec2(angle * noiseFreq * 0.5 + uTime * 0.05, uTime * 0.15)) * noiseAmp * 0.3;
  
  float totalNoise = noise1 + noise2 + noise3;
  
  // 环形距离场（带波动）
  float ringDist = abs(dist - scaledRadius - totalNoise);
  
  // 柔和的环边缘
  float ringAlpha = 1.0 - smoothstep(0.0, ringWidth * uBlend, ringDist);
  
  // 内部发光
  float innerGlow = exp(-ringDist * 8.0 / ringWidth) * 0.6;
  
  // 外部光晕
  float outerGlow = exp(-ringDist * 3.0 / ringWidth) * 0.3;
  
  // 基于角度的颜色渐变
  float colorT = (angle + 3.14159) / (2.0 * 3.14159); // 0-1
  colorT = fract(colorT + uTime * 0.02); // 缓慢旋转颜色
  
  // 三色渐变
  vec3 color;
  if (colorT < 0.33) {
    color = mix(uColorStops[0], uColorStops[1], colorT * 3.0);
  } else if (colorT < 0.66) {
    color = mix(uColorStops[1], uColorStops[2], (colorT - 0.33) * 3.0);
  } else {
    color = mix(uColorStops[2], uColorStops[0], (colorT - 0.66) * 3.0);
  }
  
  // 组合所有效果
  float totalAlpha = ringAlpha + innerGlow + outerGlow;
  totalAlpha *= smoothstep(0.0, 0.15, uv.y); // 底部渐隐
  
  // 添加闪烁效果
  float sparkle = snoise(vec2(angle * 20.0, uTime * 0.5)) * 0.5 + 0.5;
  sparkle = pow(sparkle, 8.0) * 0.4;
  
  vec3 finalColor = color * (1.0 + sparkle * ringAlpha);
  
  fragColor = vec4(finalColor * totalAlpha, totalAlpha);
}
`;

interface AuroraRingProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  scale?: number;      // 呼吸缩放
  ringRadius?: number; // 环的半径
  ringWidth?: number;  // 环的宽度
}

export default function AuroraRing(props: AuroraRingProps) {
  const { 
    colorStops = ['#0ea5e9', '#8b5cf6', '#0ea5e9'], 
    amplitude = 1.0, 
    blend = 0.5,
    scale = 1.0,
    ringRadius = 0.35,
    ringWidth = 0.08
  } = props;
  
  const propsRef = useRef<AuroraRingProps>(props);
  propsRef.current = props;

  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = 'transparent';

    let program: Program | undefined;

    function resize() {
      if (!ctn) return;
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      renderer.setSize(width, height);
      if (program) {
        program.uniforms.uResolution.value = [width, height];
      }
    }
    window.addEventListener('resize', resize);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv;
    }

    const colorStopsArray = colorStops.map(hex => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    });

    program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend },
        uScale: { value: scale },
        uRingRadius: { value: ringRadius },
        uRingWidth: { value: ringWidth }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    let animateId = 0;
    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      const { speed = 1.0 } = propsRef.current;
      if (program) {
        program.uniforms.uTime.value = t * 0.001 * speed;
        program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? amplitude;
        program.uniforms.uBlend.value = propsRef.current.blend ?? blend;
        program.uniforms.uScale.value = propsRef.current.scale ?? scale;
        program.uniforms.uRingRadius.value = propsRef.current.ringRadius ?? ringRadius;
        program.uniforms.uRingWidth.value = propsRef.current.ringWidth ?? ringWidth;
        
        const stops = propsRef.current.colorStops ?? colorStops;
        program.uniforms.uColorStops.value = stops.map((hex: string) => {
          const c = new Color(hex);
          return [c.r, c.g, c.b];
        });
        renderer.render({ scene: mesh });
      }
    };
    animateId = requestAnimationFrame(update);

    resize();

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('resize', resize);
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div 
      ref={ctnDom} 
      className="w-full h-full" 
      style={{ backgroundColor: "transparent" }} 
    />
  );
}
