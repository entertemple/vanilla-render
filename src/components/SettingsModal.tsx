import { useState, useEffect, useRef } from 'react';
import { X, Sun, Moon, Bell, Globe, Key, HelpCircle, FileText, Zap, Sliders, Palette, Check, User, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PrivacyTab from './settings/PrivacyTab';
import BillingTab from './settings/BillingTab';
import UsageTab from './settings/UsageTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

const DEFAULT_SHADER_COLORS: [string, string, string] = ['#0000ff', '#ff00ff', '#ffffff'];
const DEFAULT_MODEL_SETTINGS = { model: 'gpt-4', temperature: 0.7, maxTokens: 2048, topP: 1.0 };

// Inline SVG icons for new tabs
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M8 2L3 4.5v4C3 11.5 5.5 14 8 14s5-2.5 5-5.5v-4L8 2z" />
  </svg>
);
const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <rect x="2" y="4" width="12" height="8" rx="1.5" />
    <line x1="2" y1="7" x2="14" y2="7" />
    <line x1="4.5" y1="10" x2="7" y2="10" />
  </svg>
);
const BarChartIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <rect x="2" y="9" width="3" height="5" rx="0.5" />
    <rect x="6.5" y="6" width="3" height="8" rx="0.5" />
    <rect x="11" y="3" width="3" height="11" rx="0.5" />
  </svg>
);

function getInitials(name: string, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

type TabId = 'general' | 'model' | 'account' | 'privacy' | 'billing' | 'usage';

export default function SettingsModal({ isOpen, onClose, initialTab }: SettingsModalProps) {
  const { theme, toggleTheme, shaderColors, setShaderColors } = useTheme();
  const { display_name, avatar_url, email, refresh: refreshProfile, updateProfile } = useProfile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [modelSettings, setModelSettings] = useState(DEFAULT_MODEL_SETTINGS);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColors, setTempColors] = useState<[string, string, string]>(shaderColors);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Account tab state
  const [displayName, setDisplayName] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialTab && isOpen) setActiveTab(initialTab as TabId);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!isOpen || !user) return;
    const load = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (data) {
        setNotifications((data as any).notifications_enabled ?? true);
        setLanguage((data as any).language ?? 'en');
        setDisplayName((data as any).display_name || '');
        const colors = (data as any).shader_colors;
        if (colors && Array.isArray(colors) && colors.length === 3) {
          setTempColors(colors as [string, string, string]);
          setShaderColors(colors as [string, string, string]);
        }
        const model = (data as any).model_settings;
        if (model) setModelSettings(model);
      }
    };
    load();
  }, [isOpen, user]);

  useEffect(() => { setTempColors(shaderColors); }, [shaderColors]);

  const showSaved = (msg = 'Saved') => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const saveToProfile = async (fields: Record<string, any>) => {
    if (!user) return;
    setLoading(true);
    await supabase.from('profiles').update(fields as any).eq('user_id', user.id);
    setLoading(false);
    showSaved();
  };

  if (!isOpen) return null;

  const bgColor = theme === 'light' ? 'bg-[rgba(255,255,255,0.55)]' : 'bg-[rgba(40,40,40,0.75)]';
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.7)]';
  const borderColor = theme === 'light' ? 'border-[rgba(200,200,200,0.4)]' : 'border-[rgba(255,255,255,0.2)]';
  const hoverBg = theme === 'light' ? 'hover:bg-[rgba(255,255,255,0.4)]' : 'hover:bg-[rgba(255,255,255,0.1)]';
  const inputBg = theme === 'light' ? 'bg-[rgba(255,255,255,0.3)]' : 'bg-[rgba(255,255,255,0.08)]';
  const activeBg = theme === 'light' ? 'bg-[rgba(255,255,255,0.5)]' : 'bg-[rgba(255,255,255,0.2)]';

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'model', label: 'Model', icon: Zap },
    { id: 'account', label: 'Account', icon: User },
    { id: 'privacy', label: 'Privacy', icon: ShieldIcon },
    { id: 'billing', label: 'Billing', icon: CreditCardIcon },
    { id: 'usage', label: 'Usage', icon: BarChartIcon },
  ];

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );

  const handleToggleTheme = async () => {
    toggleTheme();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await saveToProfile({ theme_preference: newTheme });
  };

  const handleToggleNotifications = async () => {
    const next = !notifications;
    setNotifications(next);
    await saveToProfile({ notifications_enabled: next });
  };

  const handleLanguageChange = async (val: string) => {
    setLanguage(val);
    await saveToProfile({ language: val });
  };

  const handleApplyColors = async () => {
    setShaderColors(tempColors);
    setShowColorPicker(false);
    await saveToProfile({ shader_colors: tempColors });
  };

  const handleResetColors = async () => {
    setTempColors(DEFAULT_SHADER_COLORS);
    setShaderColors(DEFAULT_SHADER_COLORS);
    await saveToProfile({ shader_colors: DEFAULT_SHADER_COLORS });
  };

  const handleSaveModelSettings = async () => {
    await saveToProfile({ model_settings: modelSettings });
  };

  const handleNameBlur = () => {
    if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current);
    nameTimeoutRef.current = window.setTimeout(async () => {
      if (!user) return;
      await supabase.from('profiles').update({ display_name: displayName.trim() } as any).eq('user_id', user.id);
      updateProfile({ display_name: displayName.trim() });
      showSaved();
    }, 800);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl } as any).eq('user_id', user.id);
      updateProfile({ avatar_url: publicUrl });
      showSaved('Avatar updated');
    } catch (err) {
      console.error('Avatar upload error:', err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleClearConversations = async () => {
    if (!user) return;
    await supabase.from('conversations').delete().eq('user_id', user.id);
    showSaved('Conversations cleared');
  };

  const initials = getInitials(display_name, email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative ${bgColor} backdrop-blur-[64px] rounded-[32px] border ${borderColor} w-full max-w-[700px] max-h-[600px] flex overflow-hidden shadow-2xl`}>
        {/* Sidebar */}
        <div className={`w-48 border-r ${borderColor} p-4`}>
          <div className="space-y-1">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-colors ${activeTab === tab.id ? activeBg : hoverBg}`}
                >
                  <IconComp className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                  <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
            <div className="flex items-center gap-3">
              <h2 className={`font-['Geist_Mono',_monospace] text-[16px] tracking-[-0.32px] uppercase ${textColor}`}>Settings</h2>
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

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <>
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Appearance</h3>
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
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Notifications</h3>
                  <div className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
                    <div className="flex items-center gap-3">
                      <Bell className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      <div>
                        <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Enable Notifications</p>
                        <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>Get notified about updates</p>
                      </div>
                    </div>
                    <Toggle enabled={notifications} onToggle={handleToggleNotifications} />
                  </div>
                </div>
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Language</h3>
                  <div className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
                    <div className="flex items-center gap-3">
                      <Globe className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Interface Language</p>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className={`px-3 py-1.5 rounded-[8px] ${inputBg} border ${borderColor} ${textColor} text-[12px] focus:outline-none`}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                </div>
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Shader Colors</h3>
                  <div className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
                    <div className="flex items-center gap-3">
                      <Palette className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      <div>
                        <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Customize Shader Colors</p>
                        <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>Choose colors for the background shader</p>
                      </div>
                    </div>
                    <Toggle enabled={showColorPicker} onToggle={() => setShowColorPicker(!showColorPicker)} />
                  </div>
                </div>
                {showColorPicker && (
                  <div className={`p-4 rounded-[16px] ${inputBg} border ${borderColor} space-y-4`}>
                    <div className="flex items-center gap-4">
                      {['Hue Shift', 'Saturation', 'Brightness'].map((label, i) => (
                        <div key={label} className="flex flex-col items-center gap-1.5">
                          <input
                            type="color"
                            value={tempColors[i]}
                            onChange={(e) => {
                              const next = [...tempColors] as [string, string, string];
                              next[i] = e.target.value;
                              setTempColors(next);
                              setShaderColors(next);
                            }}
                            className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                          />
                          <span className={`text-[11px] ${textSecondary}`}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleApplyColors} className={`flex-1 px-4 py-2 rounded-[12px] ${inputBg} border ${borderColor} ${hoverBg} transition-colors`}>
                        <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Save Colors</span>
                      </button>
                      <button onClick={handleResetColors} className={`px-4 py-2 rounded-[12px] ${inputBg} border ${borderColor} ${hoverBg} transition-colors`}>
                        <span className={`font-['Inter',_sans-serif] text-[13px] ${textSecondary}`}>Reset</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* MODEL TAB */}
            {activeTab === 'model' && (
              <>
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Model Selection</h3>
                  <select
                    value={modelSettings.model}
                    onChange={(e) => setModelSettings({ ...modelSettings, model: e.target.value })}
                    className={`w-full px-4 py-3 rounded-[16px] ${inputBg} border ${borderColor} ${textColor} text-[13px] focus:outline-none`}
                  >
                    <option value="gpt-4">GPT-4 (Most Capable)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                    <option value="claude-3">Claude 3 Opus</option>
                  </select>
                </div>
                {[
                  { key: 'temperature', label: 'Temperature', min: 0, max: 2, step: 0.1, desc: 'Higher values make output more random, lower values more focused' },
                  { key: 'maxTokens', label: 'Max Tokens', min: 256, max: 4096, step: 256, desc: "Maximum length of the model's response" },
                  { key: 'topP', label: 'Top P', min: 0, max: 1, step: 0.1, desc: 'Nucleus sampling parameter' },
                ].map(({ key, label, min, max, step, desc }) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] ${textColor}`}>{label}</h3>
                      <span className={`font-['Geist_Mono',_monospace] text-[12px] ${textSecondary}`}>{(modelSettings as any)[key]}</span>
                    </div>
                    <input type="range" min={min} max={max} step={step} value={(modelSettings as any)[key]}
                      onChange={(e) => setModelSettings({ ...modelSettings, [key]: parseFloat(e.target.value) })} className="w-full" />
                    <p className={`text-[11px] ${textSecondary} mt-1`}>{desc}</p>
                  </div>
                ))}
                <button onClick={handleSaveModelSettings} className={`w-full px-4 py-3 rounded-[16px] ${inputBg} border ${borderColor} ${hoverBg} transition-colors`}>
                  <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Save Model Settings</span>
                </button>
              </>
            )}

            {/* ACCOUNT TAB */}
            {activeTab === 'account' && (
              <>
                {/* Avatar Upload */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-14 h-14 rounded-full ${inputBg} border-2 ${borderColor} flex items-center justify-center overflow-hidden mb-3 cursor-pointer transition-opacity hover:opacity-80`}
                    style={avatarUploading ? { opacity: 0.5 } : {}}
                  >
                    {avatar_url ? (
                      <img src={avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className={`text-[18px] font-semibold ${textSecondary}`}>{initials}</span>
                    )}
                    {avatarUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                        <div className="w-6 h-6 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>Click to change avatar</p>
                </div>

                {/* Display Name */}
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Display Name</h3>
                  <div className={`flex items-center gap-3 p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
                    <User className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      onBlur={handleNameBlur}
                      placeholder="Your name..."
                      className={`flex-1 bg-transparent ${textColor} font-['Geist_Mono',_monospace] text-[0.82rem] focus:outline-none`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Email</h3>
                  <input type="email" value={user?.email || ''} disabled
                    className={`w-full px-4 py-2.5 rounded-[12px] ${inputBg} border ${borderColor} ${textColor} text-[13px] focus:outline-none opacity-60`} />
                </div>

                {/* Security */}
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Security</h3>
                  <button onClick={async () => { if (!user?.email) return; await supabase.auth.resetPasswordForEmail(user.email); showSaved('Password reset email sent'); }}
                    className={`w-full flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor} ${hoverBg} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <Key className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      <div className="text-left">
                        <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Change Password</p>
                        <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>Send a password reset email</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Danger Zone */}
                <div>
                  <h3 className="font-['Inter',_sans-serif] font-medium text-[14px] mb-3 text-red-500">Danger Zone</h3>
                  <button onClick={handleClearConversations}
                    className="w-full flex items-center justify-between p-4 rounded-[16px] border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                      <div className="text-left">
                        <p className="font-['Inter',_sans-serif] text-[13px] text-red-500">Clear All Conversations</p>
                        <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>This action cannot be undone</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Help */}
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Help & Support</h3>
                  <div className="space-y-2">
                    <button className={`w-full flex items-center gap-3 p-3 rounded-[12px] ${hoverBg} transition-colors`}>
                      <HelpCircle className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                      <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Help Center</span>
                    </button>
                    <button className={`w-full flex items-center gap-3 p-3 rounded-[12px] ${hoverBg} transition-colors`}>
                      <FileText className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                      <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Documentation</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <PrivacyTab textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} inputBg={inputBg} hoverBg={hoverBg} showSaved={showSaved} onClose={onClose} />
            )}

            {/* BILLING TAB */}
            {activeTab === 'billing' && (
              <BillingTab textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} inputBg={inputBg} hoverBg={hoverBg} theme={theme} />
            )}

            {/* USAGE TAB */}
            {activeTab === 'usage' && (
              <UsageTab textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} inputBg={inputBg} theme={theme} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
