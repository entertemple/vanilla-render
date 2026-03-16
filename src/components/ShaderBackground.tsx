import { useEffect, useRef } from 'react';
import type { ShaderConfig } from '@/contexts/ThemeContext';

interface ShaderBackgroundProps {
  config: ShaderConfig;
  theme: 'light' | 'dark';
  width: number;
  height: number;
  inline?: boolean;
}

const hexToHsl = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0.5, 0.5, 0.5];
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
};

const VERTEX_SRC = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAGMENT_SRC = `
  precision mediump float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform float uHueShift;
  uniform float uSaturation;
  uniform float uBrightness;
  uniform float u_intensity;
  uniform float u_speed;

  vec3 spectral_colour(float l) {
    float r=0.0,g=0.0,b=0.0;
    if ((l>=400.0)&&(l<410.0)) { float t=(l-400.0)/(410.0-400.0); r=+(0.33*t)-(0.20*t*t); }
    else if ((l>=410.0)&&(l<475.0)) { float t=(l-410.0)/(475.0-410.0); r=0.14-(0.13*t*t); }
    else if ((l>=545.0)&&(l<595.0)) { float t=(l-545.0)/(595.0-545.0); r=+(1.98*t)-(t*t); }
    else if ((l>=595.0)&&(l<650.0)) { float t=(l-595.0)/(650.0-595.0); r=0.98+(0.06*t)-(0.40*t*t); }
    else if ((l>=650.0)&&(l<700.0)) { float t=(l-650.0)/(700.0-650.0); r=0.65-(0.84*t)+(0.20*t*t); }
    if ((l>=415.0)&&(l<475.0)) { float t=(l-415.0)/(475.0-415.0); g=+(0.80*t*t); }
    else if ((l>=475.0)&&(l<590.0)) { float t=(l-475.0)/(590.0-475.0); g=0.8+(0.76*t)-(0.80*t*t); }
    else if ((l>=585.0)&&(l<639.0)) { float t=(l-585.0)/(639.0-585.0); g=0.82-(0.80*t); }
    if ((l>=400.0)&&(l<475.0)) { float t=(l-400.0)/(475.0-400.0); b=+(2.20*t)-(1.50*t*t); }
    else if ((l>=475.0)&&(l<560.0)) { float t=(l-475.0)/(560.0-475.0); b=0.7-(t)+(0.30*t*t); }
    return vec3(r,g,b);
  }

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 p = (2.0*fragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
    p *= 1.0 + u_intensity * 1.5;

    float t = iTime * (0.3 + u_speed * 1.4);

    for(int i=0; i<8; i++) {
      vec2 newp = vec2(
        p.y + cos(p.x + t) - sin(p.y * cos(t * 0.2)),
        p.x - sin(p.y - t) - cos(p.x * sin(t * 0.3))
      );
      p = newp;
    }

    vec3 spectralColor = spectral_colour(p.y * 50.0 + 500.0 + sin(t * 0.6));
    vec3 hsv = rgb2hsv(spectralColor);
    hsv.x = fract(hsv.x + uHueShift);
    hsv.y = clamp(hsv.y * uSaturation, 0.0, 1.0);
    hsv.z = clamp(hsv.z * uBrightness, 0.0, 1.0);
    vec3 finalColor = hsv2rgb(hsv);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const ShaderBackground = ({ config, theme, width, height, inline }: ShaderBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const configRef = useRef(config);
  const themeRef = useRef(theme);

  // Update refs without remounting
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false, antialias: false, depth: false, stencil: false,
      preserveDrawingBuffer: false, failIfMajorPerformanceCaveat: false,
    });
    if (!gl) return;

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }, false);

    const createShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const resLoc = gl.getUniformLocation(program, 'iResolution');
    const timeLoc = gl.getUniformLocation(program, 'iTime');
    const hueLoc = gl.getUniformLocation(program, 'uHueShift');
    const satLoc = gl.getUniformLocation(program, 'uSaturation');
    const briLoc = gl.getUniformLocation(program, 'uBrightness');
    const intLoc = gl.getUniformLocation(program, 'u_intensity');
    const spdLoc = gl.getUniformLocation(program, 'u_speed');

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      const cfg = configRef.current;
      const th = themeRef.current;

      const hsl1 = hexToHsl(cfg.color1);
      const hsl2 = hexToHsl(cfg.color2);
      const hsl3 = hexToHsl(cfg.color3);
      const hueShift = hsl1[0];
      const saturation = th === 'light' ? hsl2[1] * 0.4 : hsl2[1] * 0.6;
      const brightness = th === 'light' ? hsl3[2] + 1.2 : hsl3[2] + 0.8;

      if (th === 'light') gl.clearColor(1, 1, 1, 1);
      else gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resLoc, width, height);
      gl.uniform1f(timeLoc, elapsed * 0.00005);
      gl.uniform1f(hueLoc, hueShift);
      gl.uniform1f(satLoc, saturation);
      gl.uniform1f(briLoc, brightness);
      gl.uniform1f(intLoc, cfg.intensity);
      gl.uniform1f(spdLoc, cfg.speed);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (buf) gl.deleteBuffer(buf);
      if (program) gl.deleteProgram(program);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    };
  }, [width, height]);

  const style: React.CSSProperties = inline
    ? { display: 'block', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }
    : { display: 'block', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' };

  return <canvas ref={canvasRef} style={style} />;
};

export default ShaderBackground;
