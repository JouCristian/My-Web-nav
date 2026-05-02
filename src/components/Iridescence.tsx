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

// 核心修改：反转亮暗关系，让背景纯黑，波纹纯白
const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime; 
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime;
  
  // 计算原始波纹
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
  
  // 提取原始亮度
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  
  // 核心：反转亮度！让原本暗的地方亮，亮的地方暗
  // 然后通过 pow() 函数极大地压暗背景，只保留最亮的光晕线条
  float invertedLuma = 1.0 - luma;
  float sharpLuma = pow(invertedLuma, 3.0); // 3.0 是对比度系数，越大线条越细越暗
  
  // 最终输出：纯白色，并用 sharpLuma 作为 Alpha 透明度
  // 这样在 mix-blend-mode: screen 下，黑色的地方就完全透明，只有白光透出来
  gl_FragColor = vec4(uColor, sharpLuma);
}
`;

// 极其丝滑的数学线性插值
const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

interface IridescenceProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReact?: boolean;
}

export default function Iridescence({
  color = [1.0, 1.0, 1.0], // 保持纯白
  speed = 0.5,
  amplitude = 0.035, // 保持较低的振幅，让光晕更紧致
  mouseReact = false,
}: IridescenceProps) {
  const ctnDom = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  
  const targetProps = useRef({ color, speed, amplitude });
  const currentProps = useRef({
    color: [...color],
    speed: speed,
    amplitude: amplitude
  });

  useEffect(() => {
    targetProps.current = { color, speed, amplitude };
  }, [color, speed, amplitude]);

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    const renderer = new Renderer({ alpha: true }); // 确保开启透明度支持
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
      transparent: true, // 告知 OGL 这个材质是透明的
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(...currentProps.current.color) },
        uResolution: {
          value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height])
        },
        uMouse: { value: new Float32Array([mousePos.current.x, mousePos.current.y]) },
        uAmplitude: { value: currentProps.current.amplitude }
      }
    });

    resize();
    const mesh = new Mesh(gl, { geometry, program });
    
    let animateId: number;
    let lastTime = performance.now();
    let accumulatedPhase = 0; 

    function update() {
      animateId = requestAnimationFrame(update);
      
      const t = performance.now();
      const dt = t - lastTime;
      lastTime = t;

      const ease = 0.03; 
      
      currentProps.current.speed = lerp(currentProps.current.speed, targetProps.current.speed, ease);
      currentProps.current.amplitude = lerp(currentProps.current.amplitude, targetProps.current.amplitude, ease);
      currentProps.current.color[0] = lerp(currentProps.current.color[0], targetProps.current.color[0], ease);
      currentProps.current.color[1] = lerp(currentProps.current.color[1], targetProps.current.color[1], ease);
      currentProps.current.color[2] = lerp(currentProps.current.color[2], targetProps.current.color[2], ease);

      accumulatedPhase += dt * currentProps.current.speed * 0.0005;

      program.uniforms.uTime.value = accumulatedPhase;
      program.uniforms.uAmplitude.value = currentProps.current.amplitude;
      program.uniforms.uColor.value.set(currentProps.current.color); 

      renderer.render({ scene: mesh });
    }
    
    animateId = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

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