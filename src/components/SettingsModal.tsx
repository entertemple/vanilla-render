import { useState, useEffect } from 'react';
import { X, Sun, Moon, User, Bell, Globe, Key, Database, HelpCircle, FileText, Download, Trash2, Zap, Sliders, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import LiquidGlass from './LiquidGlass';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggleTheme, shaderColors, setShaderColors } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'model' | 'account' | 'data'>('general');
  const [modelSettings, setModelSettings] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0
  });
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColors, setTempColors] = useState<[string, string, string]>(shaderColors);

  // Update tempColors when shaderColors change
  useEffect(() => {
    setTempColors(shaderColors);
  }, [shaderColors]);

  if (!isOpen) return null;

  // Enhanced glassmorphism styling for all pop cards
  // Light theme: 25% less opaque than dark theme
  const bgColor = theme === 'light' 
    ? 'bg-[rgba(255,255,255,0.55)]'  // 25% less opaque for light theme
    : 'bg-[rgba(40,40,40,0.75)]';    // Base opacity for dark theme
  
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.7)]';
  
  const borderColor = theme === 'light' 
    ? 'border-[rgba(200,200,200,0.4)]'  // Subtle light border
    : 'border-[rgba(255,255,255,0.2)]'; // Subtle highlight border
    
  const hoverBg = theme === 'light' ? 'hover:bg-[rgba(255,255,255,0.4)]' : 'hover:bg-[rgba(255,255,255,0.1)]';
  const inputBg = theme === 'light' ? 'bg-[rgba(255,255,255,0.3)]' : 'bg-[rgba(255,255,255,0.08)]';
  const activeBg = theme === 'light' ? 'bg-[rgba(255,255,255,0.5)]' : 'bg-[rgba(255,255,255,0.2)]';

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'model', label: 'Model', icon: Zap },
    { id: 'account', label: 'Account', icon: User },
    { id: 'data', label: 'Data', icon: Database }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className={`relative ${bgColor} backdrop-blur-[64px] rounded-[32px] border ${borderColor} w-full max-w-[700px] max-h-[600px] flex overflow-hidden shadow-2xl`}
      >
        {/* Sidebar */}
        <div className={`w-48 border-r ${borderColor} p-4`}>
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-colors
                  ${activeTab === tab.id ? activeBg : hoverBg}
                `}
              >
                <tab.icon className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
            <h2 className={`font-['Geist_Mono',_monospace] text-[16px] tracking-[-0.32px] uppercase ${textColor}`}>
              Settings
            </h2>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${hoverBg} transition-colors`}
            >
              <X className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'general' && (
              <>
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>
                    Appearance
                  </h3>
                  <div className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
                    <div className="flex items-center gap-3">
                      {theme === 'light' ? (
                        <Sun className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      ) : (
                        <Moon className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      )}
                      <div>
                        <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                          Theme
                        </p>
                        <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>
                          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>
                    Notifications
                  </h3>
                  <div className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
                    <div className="flex items-center gap-3">
                      <Bell className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      <div>
                        <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                          Enable Notifications
                        </p>
                        <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>
                          Get notified about updates
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notifications ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>
                    Language
                  </h3>
                  <div className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
                    <div className="flex items-center gap-3">
                      <Globe className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                        Interface Language
                      </p>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
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
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>
                    Shader Colors
                  </h3>
                  <div className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
                    <div className="flex items-center gap-3">
                      <Palette className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      <div>
                        <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                          Customize Shader Colors
                        </p>
                        <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>
                          Choose colors for the shader
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        showColorPicker ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          showColorPicker ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {showColorPicker && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-red-500" />
                      <input
                        type="color"
                        value={tempColors[0]}
                        onChange={(e) => setTempColors([e.target.value, tempColors[1], tempColors[2]])}
                        className="w-10 h-10"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500" />
                      <input
                        type="color"
                        value={tempColors[1]}
                        onChange={(e) => setTempColors([tempColors[0], e.target.value, tempColors[2]])}
                        className="w-10 h-10"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-500" />
                      <input
                        type="color"
                        value={tempColors[2]}
                        onChange={(e) => setTempColors([tempColors[0], tempColors[1], e.target.value])}
                        className="w-10 h-10"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setShaderColors(tempColors);
                        setShowColorPicker(false);
                      }}
                      className={`w-full flex items-center justify-center p-4 rounded-[16px] ${inputBg} border ${borderColor} ${hoverBg} transition-colors`}
                    >
                      <div className="text-left">
                        <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                          Apply Colors
                        </p>
                        <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>
                          Save your color changes
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'model' && (
              <>
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>
                    Model Selection
                  </h3>
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

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] ${textColor}`}>
                      Temperature
                    </h3>
                    <span className={`font-['Geist_Mono',_monospace] text-[12px] ${textSecondary}`}>
                      {modelSettings.temperature}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={modelSettings.temperature}
                    onChange={(e) => setModelSettings({ ...modelSettings, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <p className={`text-[11px] ${textSecondary} mt-1`}>
                    Higher values make output more random, lower values more focused
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] ${textColor}`}>
                      Max Tokens
                    </h3>
                    <span className={`font-['Geist_Mono',_monospace] text-[12px] ${textSecondary}`}>
                      {modelSettings.maxTokens}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="4096"
                    step="256"
                    value={modelSettings.maxTokens}
                    onChange={(e) => setModelSettings({ ...modelSettings, maxTokens: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className={`text-[11px] ${textSecondary} mt-1`}>
                    Maximum length of the model's response
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] ${textColor}`}>
                      Top P
                    </h3>
                    <span className={`font-['Geist_Mono',_monospace] text-[12px] ${textSecondary}`}>
                      {modelSettings.topP}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={modelSettings.topP}
                    onChange={(e) => setModelSettings({ ...modelSettings, topP: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <p className={`text-[11px] ${textSecondary} mt-1`}>
                    Nucleus sampling parameter
                  </p>
                </div>
              </>
            )}

            {activeTab === 'account' && (
              <>
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>
                    Profile Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-[12px] ${textSecondary} mb-1`}>Full Name</label>
                      <input
                        type="text"
                        defaultValue="Alex Johnson"
                        className={`w-full px-4 py-2.5 rounded-[12px] ${inputBg} border ${borderColor} ${textColor} text-[13px] focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[12px] ${textSecondary} mb-1`}>Email</label>
                      <input
                        type="email"
                        defaultValue="alex.johnson@example.com"
                        className={`w-full px-4 py-2.5 rounded-[12px] ${inputBg} border ${borderColor} ${textColor} text-[13px] focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>
                    Security
                  </h3>
                  <button className={`w-full flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor} ${hoverBg} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <Key className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      <div className="text-left">
                        <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                          Change Password
                        </p>
                        <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>
                          Update your password
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>
                    Help & Support
                  </h3>
                  <div className="space-y-2">
                    <button className={`w-full flex items-center gap-3 p-3 rounded-[12px] ${hoverBg} transition-colors`}>
                      <HelpCircle className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                      <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                        Help Center
                      </span>
                    </button>
                    <button className={`w-full flex items-center gap-3 p-3 rounded-[12px] ${hoverBg} transition-colors`}>
                      <FileText className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                      <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                        Documentation
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'data' && (
              <>
                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>
                    Data Management
                  </h3>
                  <button className={`w-full flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor} ${hoverBg} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <Download className={`w-5 h-5 ${textColor}`} strokeWidth={1.5} />
                      <div className="text-left">
                        <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                          Export Data
                        </p>
                        <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>
                          Download all your conversations
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div>
                  <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 text-red-500`}>
                    Danger Zone
                  </h3>
                  <div className="space-y-2">
                    <button className={`w-full flex items-center justify-between p-4 rounded-[16px] border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors`}>
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                        <div className="text-left">
                          <p className="font-['Inter',_sans-serif] text-[13px] text-red-500">
                            Clear All Conversations
                          </p>
                          <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>
                            This action cannot be undone
                          </p>
                        </div>
                      </div>
                    </button>
                    <button className={`w-full flex items-center justify-between p-4 rounded-[16px] border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors`}>
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                        <div className="text-left">
                          <p className="font-['Inter',_sans-serif] text-[13px] text-red-500">
                            Delete Account
                          </p>
                          <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>
                            Permanently delete your account
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}