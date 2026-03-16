import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { Settings, User, LogOut, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePopupProps {
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

function getInitials(name: string, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

export default function ProfilePopup({ onSettingsClick, onProfileClick }: ProfilePopupProps) {
  const { theme, userPlan } = useTheme();
  const { display_name, avatar_url, email } = useProfile();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(display_name, email);
  const displayLabel = display_name || email || 'User';

  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.7)]';
  const textDim = theme === 'light' ? 'text-gray-500' : 'text-[rgba(255,255,255,0.5)]';
  const popupBg = theme === 'light'
    ? 'bg-[rgba(255,255,255,0.55)]'
    : 'bg-[rgba(40,40,40,0.75)]';
  const borderColor = theme === 'light'
    ? 'border-[rgba(200,200,200,0.4)]'
    : 'border-[rgba(255,255,255,0.2)]';
  const hoverBg = theme === 'light'
    ? 'hover:bg-[rgba(255,255,255,0.4)]'
    : 'hover:bg-[rgba(255,255,255,0.1)]';
  const footerBg = theme === 'light'
    ? 'bg-[rgba(255,255,255,0.3)]'
    : 'bg-[rgba(255,255,255,0.05)]';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
    navigate('/');
  };

  const AvatarCircle = ({ size = 40, textSize = '14px' }: { size?: number; textSize?: string }) => (
    <div
      className="rounded-full bg-gradient-to-br from-[#5b8dee] to-[#9b59b6] flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      {avatar_url ? (
        <img src={avatar_url} className="w-full h-full object-cover" alt="" />
      ) : (
        <span className="text-white font-semibold" style={{ fontSize: textSize }}>{initials}</span>
      )}
    </div>
  );

  return (
    <div className="relative w-full" ref={popupRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute bottom-full left-0 mb-3 w-[220px] ${popupBg} backdrop-blur-[120px] border ${borderColor} rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden z-[200]`}
            style={{ transformOrigin: 'bottom left' }}
          >
            {/* Profile Header */}
            <div className={`px-4 py-4 border-b ${borderColor}`}>
              <div className="flex items-center gap-3">
                <AvatarCircle size={48} textSize="16px" />
                <div className="flex-1 min-w-0">
                  <div className={`${textColor} text-[14px] font-medium truncate`}>{displayLabel}</div>
                  <div className={`${textSecondary} text-[12px] mt-0.5 truncate`}>{email}</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => { setIsOpen(false); onProfileClick?.(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${textColor} text-[13px] transition-colors ${hoverBg}`}
              >
                <User className={`w-[18px] h-[18px] ${textSecondary}`} strokeWidth={1.5} />
                <span className="flex-1">Profile</span>
              </button>
              <button
                onClick={() => { setIsOpen(false); onSettingsClick?.(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${textColor} text-[13px] transition-colors ${hoverBg}`}
              >
                <Settings className={`w-[18px] h-[18px] ${textSecondary}`} strokeWidth={1.5} />
                <span className="flex-1">Settings</span>
              </button>
            </div>

            <div className={`h-px ${footerBg}`} />

            <div className="py-2">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${textDim} text-[13px] transition-colors ${hoverBg}`}
              >
                <LogOut className={`w-[18px] h-[18px] ${textDim}`} strokeWidth={1.5} />
                <span className="flex-1">Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-2 py-2 rounded-[12px] ${hoverBg} transition-all hover:scale-[1.02]`}
      >
        <AvatarCircle size={40} textSize="14px" />
        <div className="flex-1 min-w-0 text-left">
          <div className={`${textColor} text-[12px] font-medium truncate`}>{displayLabel}</div>
        </div>
      </button>
    </div>
  );
}
