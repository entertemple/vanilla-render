import { X, User, Mail, Calendar, Crown, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import LiquidGlass from './LiquidGlass';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  // Enhanced glassmorphism - increased blur and transparency
  const bgColor = theme === 'light' 
    ? 'bg-[rgba(255,255,255,0.60)]'  // Increased transparency for more glass effect
    : 'bg-[rgba(40,40,40,0.90)]';
  
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.7)]';
  
  const borderColor = theme === 'light' 
    ? 'border-[rgba(255,255,255,0.6)]'  // Lighter, more visible border
    : 'border-[rgba(255,255,255,0.18)]'; // Increased visibility
    
  const hoverBg = theme === 'light' ? 'hover:bg-[rgba(255,255,255,0.4)]' : 'hover:bg-[rgba(255,255,255,0.1)]';
  const inputBg = theme === 'light' ? 'bg-[rgba(255,255,255,0.3)]' : 'bg-[rgba(255,255,255,0.08)]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <LiquidGlass
        className={`border ${borderColor} w-full max-w-[450px] shadow-2xl`}
        borderRadius="32px"
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
          <h2 className={`font-['Geist_Mono',_monospace] text-[16px] tracking-[-0.32px] uppercase ${textColor}`}>
            Profile
          </h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${hoverBg} transition-colors`}
          >
            <X className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Picture & Info */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full ${inputBg} border-2 ${borderColor} flex items-center justify-center mb-4`}>
              <User className={`w-12 h-12 ${textSecondary}`} strokeWidth={1.5} />
            </div>
            <h3 className={`font-['Inter',_sans-serif] font-semibold text-[18px] ${textColor}`}>
              Alex Johnson
            </h3>
            <div className={`flex items-center gap-2 mt-1 px-3 py-1 rounded-full ${inputBg}`}>
              <Crown className="w-3.5 h-3.5 text-yellow-500" strokeWidth={2} />
              <span className={`font-['Geist_Mono',_monospace] text-[11px] tracking-[-0.22px] uppercase ${textSecondary}`}>
                Pro Member
              </span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
              <Mail className={`w-5 h-5 ${textSecondary}`} strokeWidth={1.5} />
              <div>
                <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary} uppercase tracking-wide`}>
                  Email
                </p>
                <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                  alex.johnson@example.com
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
              <Calendar className={`w-5 h-5 ${textSecondary}`} strokeWidth={1.5} />
              <div>
                <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary} uppercase tracking-wide`}>
                  Member Since
                </p>
                <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                  January 2024
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-3 gap-3 p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
            <div className="text-center">
              <p className={`font-['Geist_Mono',_monospace] text-[20px] font-semibold ${textColor}`}>
                142
              </p>
              <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary} uppercase tracking-wide`}>
                Chats
              </p>
            </div>
            <div className="text-center">
              <p className={`font-['Geist_Mono',_monospace] text-[20px] font-semibold ${textColor}`}>
                1.2K
              </p>
              <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary} uppercase tracking-wide`}>
                Messages
              </p>
            </div>
            <div className="text-center">
              <p className={`font-['Geist_Mono',_monospace] text-[20px] font-semibold ${textColor}`}>
                45
              </p>
              <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary} uppercase tracking-wide`}>
                Days
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] ${inputBg} border ${borderColor} ${hoverBg} transition-colors`}>
              <User className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
              <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>
                Edit Profile
              </span>
            </button>
            <button className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors`}>
              <LogOut className="w-4 h-4 text-red-500" strokeWidth={1.5} />
              <span className="font-['Inter',_sans-serif] text-[13px] text-red-500">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}