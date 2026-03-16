import { useState, useRef, useEffect } from 'react';
import { useTheme, DARK_DEFAULT, LIGHT_DEFAULT, type ShaderConfig } from '@/contexts/ThemeContext';
import ShaderBackground from '@/components/ShaderBackground';

const DARK_PRESETS: { name: string; colors: [string, string, string]; intensity: number; speed: number }[] = [
  { name: 'Default',  colors: ['#B8A4C9', '#A5C4D4', '#FFD4B8'], intensity: 0.6, speed: 0.4 },
  { name: 'Obsidian', colors: ['#1a1a2e', '#16213e', '#0f3460'], intensity: 0.8, speed: 0.2 },
  { name: 'Aurora',   colors: ['#00C9A7', '#845EC2', '#D65DB1'], intensity: 0.7, speed: 0.5 },
  { name: 'Ember',    colors: ['#FF6B6B', '#FFE66D', '#FF8E53'], intensity: 0.65, speed: 0.35 },
  { name: 'Midnight', colors: ['#2C3E50', '#3498DB', '#8E44AD'], intensity: 0.75, speed: 0.25 },
  { name: 'Sage',     colors: ['#A8C5A0', '#7FB3D3', '#C8A8C5'], intensity: 0.5, speed: 0.3 },
  { name: 'Void',     colors: ['#0a0a0a', '#111111', '#1a1a1a'], intensity: 0.3, speed: 0.15 },
  { name: 'Plasma',   colors: ['#FF0080', '#7928CA', '#0070F3'], intensity: 0.9, speed: 0.6 },
];

const LIGHT_PRESETS: { name: string; colors: [string, string, string]; intensity: number; speed: number }[] = [
  { name: 'Default',  colors: ['#E6D9F0', '#D4E6EE', '#FFF0E6'], intensity: 0.5, speed: 0.3 },
  { name: 'Mist',     colors: ['#e0eaf0', '#d4e6ee', '#e8e0f0'], intensity: 0.4, speed: 0.2 },
  { name: 'Blossom',  colors: ['#f0e0e8', '#e8d0e0', '#f5e8f0'], intensity: 0.5, speed: 0.35 },
  { name: 'Sunrise',  colors: ['#fff0e6', '#ffe8d4', '#f5e0d0'], intensity: 0.55, speed: 0.3 },
  { name: 'Ocean',    colors: ['#d4e6ee', '#c0dce8', '#e0eaf0'], intensity: 0.45, speed: 0.25 },
  { name: 'Garden',   colors: ['#e0f0e8', '#d4e8d4', '#e8f0e0'], intensity: 0.4, speed: 0.25 },
  { name: 'Cloud',    colors: ['#f0f0f0', '#e8e8e8', '#f5f5f5'], intensity: 0.3, speed: 0.15 },
  { name: 'Warmth',   colors: ['#f5f0e8', '#f0e8d4', '#f5efe0'], intensity: 0.5, speed: 0.35 },
];

interface AtmospherePanelProps {
  textColor: string;
  textSecondary: string;
  borderColor: string;
  inputBg: string;
  theme: 'light' | 'dark';
}

export default function AtmospherePanel({ textColor, textSecondary, borderColor, inputBg, theme }: AtmospherePanelProps) {
  const { shaderConfig, setShaderConfig } = useTheme();
  const isDark = theme === 'dark';
  const presets = isDark ? DARK_PRESETS : LIGHT_PRESETS;
  const dimColor = isDark ? '#fff' : '#000';

  const [previewSize, setPreviewSize] = useState({ width: 400, height: 225 });
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [screenAspect, setScreenAspect] = useState(window.innerWidth / window.innerHeight);

  useEffect(() => {
    const handleResize = () => setScreenAspect(window.innerWidth / window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(w / screenAspect);
        setPreviewSize({ width: w, height: h });
      }
    });
    obs.observe(previewContainerRef.current);
    return () => obs.disconnect();
  }, [screenAspect]);

  const applyPreset = (preset: typeof presets[0]) => {
    setShaderConfig({
      color1: preset.colors[0],
      color2: preset.colors[1],
      color3: preset.colors[2],
      intensity: preset.intensity,
      speed: preset.speed,
      preset: preset.name.toLowerCase(),
    });
  };

  const resetDefaults = () => {
    const def = isDark ? DARK_DEFAULT : LIGHT_DEFAULT;
    setShaderConfig(def);
  };

  const updateColor = (key: 'color1' | 'color2' | 'color3', value: string) => {
    setShaderConfig({ [key]: value, preset: 'custom' });
  };

  // Build mini gradient for preset swatch
  const presetGradient = (colors: [string, string, string]) =>
    `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;

  return (
    <div>
      <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Atmosphere</h3>
      <div className={`rounded-[12px] border ${borderColor} ${inputBg} p-5`}>

        {/* Live preview */}
        <div
          ref={previewContainerRef}
          className="w-full rounded-[10px] overflow-hidden mb-5 relative"
          style={{
            aspectRatio: screenAspect,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <ShaderBackground
            config={shaderConfig}
            theme={theme}
            width={previewSize.width}
            height={previewSize.height}
            inline
          />
        </div>

        {/* Presets */}
        <div className="mb-5">
          <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.08em] opacity-35 mb-2.5" style={{ color: dimColor }}>
            Presets
          </p>
          <div className="flex gap-2 flex-wrap">
            {presets.map(preset => {
              const isActive = shaderConfig.preset === preset.name.toLowerCase();
              return (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="group relative"
                  title={preset.name}
                >
                  <div
                    className="w-9 h-9 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: presetGradient(preset.colors),
                      border: isActive
                        ? `2px solid ${isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'}`
                        : `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Colors */}
        <div className="mb-5">
          <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.08em] opacity-35 mb-2.5" style={{ color: dimColor }}>
            Colors
          </p>
          <div className="flex gap-3">
            {(['color1', 'color2', 'color3'] as const).map((key) => (
              <label key={key} className="relative cursor-pointer group">
                    <div
                    className="w-8 h-8 rounded-full transition-transform group-hover:scale-110"
                    style={{
                      background: shaderConfig[key],
                      border: `2px solid ${
                        isNearBlack(shaderConfig[key])
                          ? (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)')
                          : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')
                      }`,
                    }}
                  />
                <input
                  type="color"
                  value={shaderConfig[key]}
                  onInput={(e) => updateColor(key, (e.target as HTMLInputElement).value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Intensity slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.08em] opacity-35" style={{ color: dimColor }}>
              Intensity
            </p>
            <p className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-50" style={{ color: dimColor }}>
              {Math.round(shaderConfig.intensity * 100)}
            </p>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(shaderConfig.intensity * 100)}
            onChange={(e) => setShaderConfig({ intensity: parseInt(e.target.value) / 100, preset: 'custom' })}
            className="shader-slider w-full"
          />
        </div>

        {/* Speed slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.08em] opacity-35" style={{ color: dimColor }}>
              Speed
            </p>
            <p className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-50" style={{ color: dimColor }}>
              {Math.round(shaderConfig.speed * 100)}
            </p>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(shaderConfig.speed * 100)}
            onChange={(e) => setShaderConfig({ speed: parseInt(e.target.value) / 100, preset: 'custom' })}
            className="shader-slider w-full"
          />
        </div>

        {/* Reset */}
        <div className="flex justify-end">
          <button
            onClick={resetDefaults}
            className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-40 hover:opacity-80 transition-opacity"
            style={{ color: dimColor }}
          >
            Reset to default
          </button>
        </div>
      </div>

      {/* Slider styling */}
      <style>{`
        .shader-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 2px;
          background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
          outline: none;
        }
        .shader-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)'};
          cursor: pointer;
          transition: transform 150ms;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .shader-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .shader-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)'};
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
