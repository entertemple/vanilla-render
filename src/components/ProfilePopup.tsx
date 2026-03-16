import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { Settings, LogOut, ChevronRight } from 'lucide-react';
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

function getPlanLabel(plan: string): { label: string; isProPlan: boolean } {
  if (plan === 'pro') return { label: 'Pro Plan', isProPlan: true };
  if (plan === 'pro_annual') return { label: 'Pro Annual', isProPlan: true };
  return { label: 'Free Trial', isProPlan: false };
}

export default function ProfilePopup({ onSettingsClick, onProfileClick }: ProfilePopupProps) {
  const { theme } = useTheme();
  const { display_name, avatar_url, email, plan } = useProfile();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(display_name, email);
  const displayLabel = display_name || email || 'User';
  const { label: planLabel, isProPlan } = getPlanLabel(plan);

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
  const sectionLabelColor = theme === 'light' ? 'text-gray-400' : 'text-[rgba(255,255,255,0.3)]';

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
                  <div
                    className="font-['Geist_Mono',_monospace] text-[0.62rem] tracking-[0.08em] uppercase mt-[1px]"
                    style={isProPlan
                      ? { color: 'rgba(200,150,60,1)', opacity: 0.8 }
                      : { color: theme === 'dark' ? '#fff' : '#000', opacity: 0.45 }
                    }
                  >
                    {planLabel}
                  </div>
                  <div className={`${textSecondary} text-[12px] mt-0.5 truncate`}>{email}</div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="py-1.5">
              <button
                onClick={() => { setIsOpen(false); onSettingsClick?.(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${textColor} text-[13px] transition-colors ${hoverBg}`}
              >
                <Settings className={`w-[18px] h-[18px] ${textSecondary}`} strokeWidth={1.5} />
                <span className="flex-1">Settings</span>
              </button>
            </div>

            <div className={`h-px ${footerBg}`} />

            {/* Upgrade */}
            <div className="py-1.5">
              <button
                onClick={() => { setIsOpen(false); navigate('/pricing'); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${textColor} text-[13px] transition-colors ${hoverBg}`}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className={textSecondary}>
                  <path d="M9 2l2.5 4.5L16 8l-3.5 3.5L13.5 16 9 13.5 4.5 16l1-4.5L2 8l4.5-1.5z" />
                </svg>
                <span className="flex-1">Upgrade Plan</span>
              </button>
            </div>

            <div className={`h-px ${footerBg}`} />

            {/* Learn More */}
            <div className="py-1.5">
              <p className={`px-4 pt-1.5 pb-1 font-['Geist_Mono',_monospace] text-[0.6rem] uppercase tracking-[0.1em] ${sectionLabelColor}`}>
                Learn More
              </p>
              {[
                { label: 'About Temple', path: '/about' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Usage Policy', path: '/usage-policy' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => { setIsOpen(false); navigate(item.path); }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-left ${textDim} text-[13px] transition-colors ${hoverBg}`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" strokeWidth={1.5} />
                </button>
              ))}
            </div>

            <div className={`h-px ${footerBg}`} />

            {/* Log Out */}
            <div className="py-1.5">
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
