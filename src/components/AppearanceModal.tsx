import { useState, useEffect } from 'react';
import { X, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AtmospherePanel from './settings/AtmospherePanel';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaveIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M2 8c1-3 3-3 4 0s3 3 4 0 3-3 4 0" />
  </svg>
);

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button onClick={onToggle} className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
  </button>
);

export default function AppearanceModal({ isOpen, onClose }: AppearanceModalProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [atmosphereEnabled, setAtmosphereEnabled] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isOpen) return;
    supabase.from('profiles').select('atmosphere_enabled').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) setAtmosphereEnabled((data as any).atmosphere_enabled ?? true);
      });
  }, [user, isOpen]);

  const showSaved = (msg = 'Saved') => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const saveToProfile = async (fields: Record<string, any>) => {
    if (!user) return;
    await supabase.from('profiles').update(fields as any).eq('user_id', user.id);
    showSaved();
  };

  const handleToggleTheme = async () => {
    toggleTheme();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await saveToProfile({ theme_preference: newTheme });
  };

  const handleToggleAtmosphere = async () => {
    const next = !atmosphereEnabled;
    setAtmosphereEnabled(next);
    const shaderEl = document.querySelector('canvas[style*="position: fixed"]') as HTMLElement | null;
    if (shaderEl) shaderEl.style.display = next ? 'block' : 'none';
    document.body.style.background = next ? '' : (theme === 'dark' ? '#080808' : '#f5f5f3');
    await saveToProfile({ atmosphere_enabled: next });
  };

  if (!isOpen) return null;

  const bgColor = theme === 'light' ? 'bg-[rgba(255,255,255,0.55)]' : 'bg-[rgba(40,40,40,0.75)]';
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.7)]';
  const borderColor = theme === 'light' ? 'border-[rgba(200,200,200,0.4)]' : 'border-[rgba(255,255,255,0.2)]';
  const hoverBg = theme === 'light' ? 'hover:bg-[rgba(255,255,255,0.4)]' : 'hover:bg-[rgba(255,255,255,0.1)]';
  const inputBg = theme === 'light' ? 'bg-[rgba(255,255,255,0.3)]' : 'bg-[rgba(255,255,255,0.08)]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative ${bgColor} backdrop-blur-[64px] rounded-[32px] border ${borderColor} w-full max-w-[520px] max-h-[600px] flex flex-col overflow-hidden shadow-2xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
          <div className="flex items-center gap-3">
            <h2 className={`font-['Geist_Mono',_monospace] text-[16px] tracking-[-0.32px] uppercase ${textColor}`}>Appearance</h2>
            {saveMessage && (
              <span className={`text-[12px] ${textSecondary} flex items-center gap-1 animate-pulse`}>
                <Check className="w-3 h-3" /> {saveMessage}
              </span>
            )}
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${hoverBg} transition-colors`}>
            <X className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Theme toggle */}
          <div>
            <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Theme</h3>
            <div className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Sun className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} /> : <Moon className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />}
                <div>
                  <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Theme</p>
                  <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
                </div>
              </div>
              <Toggle enabled={theme === 'dark'} onToggle={handleToggleTheme} />
            </div>
          </div>

          {/* Atmosphere toggle */}
          <div>
            <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Atmosphere</h3>
            <div className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
              <div className="flex items-center gap-3">
                <WaveIcon className={`w-5 h-5 ${textColor}`} />
                <div>
                  <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Atmosphere</p>
                  <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>Animated background shader</p>
                </div>
              </div>
              <Toggle enabled={atmosphereEnabled} onToggle={handleToggleAtmosphere} />
            </div>
            {atmosphereEnabled && (
              <div style={{
                marginLeft: '1rem',
                paddingTop: '0.75rem',
                borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
              }}>
                <AtmospherePanel textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} inputBg={inputBg} theme={theme as 'light' | 'dark'} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
