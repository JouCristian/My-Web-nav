import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

import './Iridescence.css';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;
varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

// 数学平滑插值函数
const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

interface IridescenceProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReact?: boolean;
}

export default function Iridescence({
  color = [0.125, 0.145, 0.165],
  speed = 0.3,
  amplitude = 0.1,
  mouseReact = false,
}: IridescenceProps) {
  const ctnDom = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  
  // 记录目标值 (从 Props 获取)
  const targetProps = useRef({ color, speed, amplitude });
  
  // 记录当前帧渲染的过渡值
  const currentProps = useRef({
    color: [...color],
    speed: speed,
    amplitude: amplitude
  });

  // 当外部参数变化时，只更新目标值，不直接修改 Shader
  useEffect(() => {
    targetProps.current = { color, speed, amplitude };
  }, [color, speed, amplitude]);

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    const renderer = new Renderer();
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    let program: Program;

    function resize() {
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      if (program) {
        program.uniforms.uResolution.value = new Float32Array([
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        ]);
      }
    }
    window.addEventListener('resize', resize, false);

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(...currentProps.current.color) },
        uResolution: {
          value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height])
        },
        uMouse: { value: new Float32Array([mousePos.current.x, mousePos.current.y]) },
        uAmplitude: { value: currentProps.current.amplitude },
        uSpeed: { value: currentProps.current.speed }
      }
    });

    resize(); // 立即调用一次修正分辨率
    const mesh = new Mesh(gl, { geometry, program });
    let animateId: number;

    function update(t: number) {
      animateId = requestAnimationFrame(update);
      
      // 平滑因子：数值越小，过渡越丝滑（0.05 约等于 Apple 的 easeOut 感觉）
      const ease = 0.015;
      
      // 帧级平滑插值 (Lerp)
      currentProps.current.speed = lerp(currentProps.current.speed, targetProps.current.speed, ease);
      currentProps.current.amplitude = lerp(currentProps.current.amplitude, targetProps.current.amplitude, ease);
      currentProps.current.color[0] = lerp(currentProps.current.color[0], targetProps.current.color[0], ease);
      currentProps.current.color[1] = lerp(currentProps.current.color[1], targetProps.current.color[1], ease);
      currentProps.current.color[2] = lerp(currentProps.current.color[2], targetProps.current.color[2], ease);

      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uSpeed.value = currentProps.current.speed;
      program.uniforms.uAmplitude.value = currentProps.current.amplitude;
      // 使用 .set() 复用内存，避免每帧 new Color
      program.uniforms.uColor.value.set(currentProps.current.color); 

      renderer.render({ scene: mesh });
    }
    animateId = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    // ... 鼠标事件代码保持不变 ...
    function handleMouseMove(e: MouseEvent) {
      const rect = ctn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mousePos.current = { x, y };
      program.uniforms.uMouse.value[0] = x;
      program.uniforms.uMouse.value[1] = y;
    }
    if (mouseReact) {
      ctn.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('resize', resize);
      if (mouseReact) {
        ctn.removeEventListener('mousemove', handleMouseMove);
      }
      if (ctn.contains(gl.canvas)) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <div ref={ctnDom} className="iridescence-container" style={{ backgroundColor: "transparent" }} />;
}