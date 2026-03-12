import { useRef, useCallback, ReactNode } from 'react';

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export default function LiquidGlass({ children, className = '', borderRadius = '32px', style }: LiquidGlassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const specularRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!specularRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    specularRef.current.style.background = `radial-gradient(circle 300px at ${x}px ${y}px, rgba(255,255,255,0.12), rgba(255,255,255,0.03) 40%, transparent 70%)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (specularRef.current) {
      specularRef.current.style.background = 'none';
    }
  }, []);

  const layerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius,
    pointerEvents: 'none',
  };

  return (
    <div
      ref={containerRef}
      className={`glass-panel ${className}`}
      style={{ position: 'relative', borderRadius, overflow: 'hidden', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glass filter layer */}
      <div
        style={{
          ...layerStyle,
          zIndex: 1,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          filter: 'url(#glass-distortion) saturate(120%) brightness(1.15)',
        }}
      />
      {/* Glass overlay */}
      <div
        className="glass-panel-overlay"
        style={{
          ...layerStyle,
          zIndex: 2,
        }}
      />
      {/* Specular highlight */}
      <div
        ref={specularRef}
        style={{
          ...layerStyle,
          zIndex: 3,
          boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.15)',
        }}
      />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 4, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
