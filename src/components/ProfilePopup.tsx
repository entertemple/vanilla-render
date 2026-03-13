import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Settings, User, LogOut, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface ProfilePopupProps {
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

export default function ProfilePopup({ onSettingsClick, onProfileClick }: ProfilePopupProps) {
  const { theme, userPlan } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.7)]';
  const textDim = theme === 'light' ? 'text-gray-500' : 'text-[rgba(255,255,255,0.5)]';
  
  // Enhanced glassmorphism styling - light theme 25% less opaque
  const popupBg = theme === 'light' 
    ? 'bg-[rgba(255,255,255,0.55)]'  // 25% less opaque for light theme
    : 'bg-[rgba(40,40,40,0.75)]';    // Base opacity for dark theme
    
  const borderColor = theme === 'light'
    ? 'border-[rgba(200,200,200,0.4)]'  // Subtle light border
    : 'border-[rgba(255,255,255,0.2)]'; // Subtle highlight border
    
  const hoverBg = theme === 'light' 
    ? 'hover:bg-[rgba(255,255,255,0.4)]' 
    : 'hover:bg-[rgba(255,255,255,0.1)]';
    
  const footerBg = theme === 'light'
    ? 'bg-[rgba(255,255,255,0.3)]'
    : 'bg-[rgba(255,255,255,0.05)]';

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  const handleLearnMore = () => {
    setIsOpen(false);
    // No-op: page removed
  };

  const handleUpgrade = () => {
    setIsOpen(false);
    // No-op: page removed
  };

  const handleLogout = async () => {
    setIsOpen(false);
    const { signOut } = await import('../contexts/AuthContext').then(m => {
      // We need to call signOut from supabase directly
      return { signOut: async () => {} };
    });
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="relative w-full" ref={popupRef}>
      {/* Popup Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`
              absolute bottom-full left-0 mb-3 w-[220px]
              ${popupBg} backdrop-blur-[120px] border ${borderColor} rounded-[16px]
              shadow-[0_8px_32px_rgba(0,0,0,0.2)]
              overflow-hidden z-[200]
            `}
            style={{ transformOrigin: 'bottom left' }}
          >
            {/* Profile Header */}
            <div className={`px-4 py-4 border-b ${borderColor}`}>
              <div className="flex items-center gap-3">
                <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#5b8dee] to-[#9b59b6] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[16px] font-semibold">AJ</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`${textColor} text-[14px] font-medium truncate`}>
                    Alex Johnson
                  </div>
                  <div className={`${textSecondary} text-[12px] mt-0.5 truncate`}>
                    alex.johnson@example.com
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleProfileClick}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left
                  ${textColor} text-[13px] transition-colors ${hoverBg}
                `}
              >
                <User className={`w-[18px] h-[18px] ${textSecondary}`} strokeWidth={1.5} />
                <span className="flex-1">Profile</span>
              </button>
              <button
                onClick={handleSettingsClick}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left
                  ${textColor} text-[13px] transition-colors ${hoverBg}
                `}
              >
                <Settings className={`w-[18px] h-[18px] ${textSecondary}`} strokeWidth={1.5} />
                <span className="flex-1">Settings</span>
              </button>
              <button
                onClick={handleLearnMore}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left
                  ${textColor} text-[13px] transition-colors ${hoverBg}
                `}
              >
                <Info className={`w-[18px] h-[18px] ${textSecondary}`} strokeWidth={1.5} />
                <span className="flex-1">Learn More</span>
              </button>
              {userPlan === 'free' && (
                <button
                  onClick={handleUpgrade}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left
                    ${textColor} text-[13px] transition-colors ${hoverBg}
                  `}
                >
                  <Zap className={`w-[18px] h-[18px] ${textSecondary}`} strokeWidth={1.5} />
                  <span className="flex-1">Upgrade</span>
                </button>
              )}
            </div>

            <div className={`h-px ${footerBg}`} />

            {/* Logout */}
            <div className="py-2">
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left
                  ${textDim} text-[13px] transition-colors ${hoverBg}
                `}
              >
                <LogOut className={`w-[18px] h-[18px] ${textDim}`} strokeWidth={1.5} />
                <span className="flex-1">Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar + Username Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-2 py-2 rounded-[12px] ${hoverBg} transition-all hover:scale-[1.02]`}
      >
        <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#5b8dee] to-[#9b59b6] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[14px] font-semibold">AJ</span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className={`${textColor} text-[12px] font-medium truncate`}>
            Alex Johnson
          </div>
        </div>
      </button>
    </div>
  );
}