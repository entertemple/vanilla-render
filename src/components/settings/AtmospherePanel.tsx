import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OrbConfig {
  color: string;
  opacity: number;
}

interface OrbSettings {
  dark: { orb1: OrbConfig; orb2: OrbConfig };
  light: { orb1: OrbConfig; orb2: OrbConfig };
}

const DEFAULT_DARK_ORBS = {
  orb1: { color: '#1a1a2e', opacity: 0.6 },
  orb2: { color: '#16213e', opacity: 0.4 },
};
const DEFAULT_LIGHT_ORBS = {
  orb1: { color: '#e8e0f0', opacity: 0.5 },
  orb2: { color: '#f0e8e0', opacity: 0.4 },
};

const DARK_PRESETS = ['#1a1a2e', '#0d1b2a', '#1a0a2e', '#0a1628', '#1a2e1a', '#2e1a0a', '#2e0a1a', '#1a1a1a'];
const LIGHT_PRESETS = ['#e8e0f0', '#e0eaf0', '#f0e8e0', '#e0f0e8', '#f0e0e8', '#f5f0e8', '#e8f0e0', '#f0f0f0'];

interface AtmospherePanelProps {
  textColor: string;
  textSecondary: string;
  borderColor: string;
  inputBg: string;
  theme: 'light' | 'dark';
}

export default function AtmospherePanel({ textColor, textSecondary, borderColor, inputBg, theme }: AtmospherePanelProps) {
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const presets = isDark ? DARK_PRESETS : LIGHT_PRESETS;
  const defaults = isDark ? DEFAULT_DARK_ORBS : DEFAULT_LIGHT_ORBS;

  const [orbSettings, setOrbSettings] = useState<OrbSettings>({
    dark: DEFAULT_DARK_ORBS,
    light: DEFAULT_LIGHT_ORBS,
  });

  const currentOrbs = isDark ? orbSettings.dark : orbSettings.light;

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('orb_settings').eq('user_id', user.id).single()
      .then(({ data }) => {
        const settings = (data as any)?.orb_settings;
        if (settings && typeof settings === 'object' && settings.dark && settings.light) {
          setOrbSettings(settings);
        }
      });
  }, [user]);

  const updateOrb = (orbKey: 'orb1' | 'orb2', field: 'color' | 'opacity', value: string | number) => {
    const modeKey = isDark ? 'dark' : 'light';
    const next = {
      ...orbSettings,
      [modeKey]: {
        ...orbSettings[modeKey],
        [orbKey]: { ...orbSettings[modeKey][orbKey], [field]: value },
      },
    };
    setOrbSettings(next);
    // Persist
    if (user) {
      supabase.from('profiles').update({ orb_settings: next } as any).eq('user_id', user.id).then();
    }
  };

  const resetDefaults = () => {
    const modeKey = isDark ? 'dark' : 'light';
    const next = { ...orbSettings, [modeKey]: isDark ? DEFAULT_DARK_ORBS : DEFAULT_LIGHT_ORBS };
    setOrbSettings(next);
    if (user) {
      supabase.from('profiles').update({ orb_settings: next } as any).eq('user_id', user.id).then();
    }
  };

  const dimColor = isDark ? '#fff' : '#000';

  const OrbColumn = ({ label, orbKey }: { label: string; orbKey: 'orb1' | 'orb2' }) => {
    const orb = currentOrbs[orbKey];
    const [showPicker, setShowPicker] = useState(false);

    return (
      <div className="flex-1">
        <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.08em] opacity-35 mb-2" style={{ color: dimColor }}>
          {label}
        </p>

        {/* Color swatch */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-8 h-8 rounded-full border transition-transform hover:scale-105"
          style={{ background: orb.color, borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}
        />

        {/* Preset swatches */}
        {showPicker && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {presets.map(c => (
              <button
                key={c}
                onClick={() => updateOrb(orbKey, 'color', c)}
                className="w-3 h-3 rounded-full border transition-transform hover:scale-125"
                style={{
                  background: c,
                  borderColor: orb.color === c ? (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)') : 'transparent',
                }}
              />
            ))}
            {/* Custom color */}
            <label className="w-3 h-3 rounded-full flex items-center justify-center cursor-pointer border transition-transform hover:scale-125"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', fontSize: '8px', color: dimColor, opacity: 0.4 }}>
              +
              <input
                type="color"
                value={orb.color}
                onChange={e => updateOrb(orbKey, 'color', e.target.value)}
                className="sr-only"
              />
            </label>
          </div>
        )}

        {/* Opacity slider */}
        <div className="mt-3">
          <p className="font-['Geist_Mono',_monospace] text-[0.6rem] opacity-30 mb-1.5" style={{ color: dimColor }}>
            Intensity
          </p>
          <input
            type="range"
            min="0.05"
            max="0.4"
            step="0.01"
            value={orb.opacity}
            onChange={e => updateOrb(orbKey, 'opacity', parseFloat(e.target.value))}
            className="w-full orb-slider"
            style={{
              WebkitAppearance: 'none',
              appearance: 'none' as any,
              height: 3,
              borderRadius: 2,
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              outline: 'none',
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Atmosphere</h3>
      <div className={`rounded-[12px] border ${borderColor} ${inputBg} p-5`}>
        {/* Live preview */}
        <div
          className="w-full rounded-[8px] overflow-hidden mb-5 relative"
          style={{
            height: 140,
            background: isDark ? '#0a0a0a' : '#f5f5f5',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div
            className="absolute rounded-full blur-[60px]"
            style={{
              width: 160,
              height: 160,
              top: -20,
              left: '20%',
              background: currentOrbs.orb1.color,
              opacity: currentOrbs.orb1.opacity,
            }}
          />
          <div
            className="absolute rounded-full blur-[60px]"
            style={{
              width: 140,
              height: 140,
              bottom: -30,
              right: '15%',
              background: currentOrbs.orb2.color,
              opacity: currentOrbs.orb2.opacity,
            }}
          />
        </div>

        {/* Two columns */}
        <div className="flex gap-6">
          <OrbColumn label="Orb 1" orbKey="orb1" />
          <OrbColumn label="Orb 2" orbKey="orb2" />
        </div>

        {/* Reset */}
        <div className="flex justify-end mt-4">
          <button
            onClick={resetDefaults}
            className="font-['Geist_Mono',_monospace] text-[0.7rem] opacity-30 hover:opacity-50 transition-opacity"
            style={{ color: dimColor }}
          >
            Reset to defaults
          </button>
        </div>
      </div>

      {/* Slider thumb styling */}
      <style>{`
        .orb-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)'};
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .orb-slider::-moz-range-thumb {
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
