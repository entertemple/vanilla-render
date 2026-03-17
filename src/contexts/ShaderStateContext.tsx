import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

export type ShaderState = 'rest' | 'thinking' | 'responding' | 'deep';

interface ShaderStateConfig {
  opacity: number;
  speedMult: number;
  warmth: number;
}

const STATE_CONFIGS: Record<ShaderState, ShaderStateConfig> = {
  rest:       { opacity: 0.15, speedMult: 0.3, warmth: 0.5 },
  thinking:   { opacity: 0.6,  speedMult: 1.4, warmth: 0.7 },
  responding: { opacity: 0.45, speedMult: 0.8, warmth: 0.6 },
  deep:       { opacity: 0.35, speedMult: 0.4, warmth: 0.2 },
};

interface ShaderStateContextType {
  shaderState: ShaderState;
  setShaderState: (state: ShaderState) => void;
  currentConfig: ShaderStateConfig;
  // Smoothly interpolated values for the render loop
  interpolated: React.MutableRefObject<ShaderStateConfig>;
}

const ShaderStateContext = createContext<ShaderStateContextType | undefined>(undefined);

export function ShaderStateProvider({ children }: { children: ReactNode }) {
  const [shaderState, setShaderState] = useState<ShaderState>('rest');
  const currentConfig = STATE_CONFIGS[shaderState];
  
  // Interpolated values for smooth transitions
  const interpolated = useRef<ShaderStateConfig>({ ...STATE_CONFIGS.rest });
  const targetRef = useRef<ShaderStateConfig>({ ...STATE_CONFIGS.rest });

  useEffect(() => {
    targetRef.current = { ...STATE_CONFIGS[shaderState] };
  }, [shaderState]);

  // Smooth interpolation loop
  useEffect(() => {
    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      const t = 0.03; // smooth factor per frame (~1200ms transition)
      interpolated.current.opacity = lerp(interpolated.current.opacity, targetRef.current.opacity, t);
      interpolated.current.speedMult = lerp(interpolated.current.speedMult, targetRef.current.speedMult, t);
      interpolated.current.warmth = lerp(interpolated.current.warmth, targetRef.current.warmth, t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <ShaderStateContext.Provider value={{ shaderState, setShaderState, currentConfig, interpolated }}>
      {children}
    </ShaderStateContext.Provider>
  );
}

export function useShaderState() {
  const context = useContext(ShaderStateContext);
  if (!context) throw new Error('useShaderState must be used within ShaderStateProvider');
  return context;
}
