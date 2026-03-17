import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { Settings, LogOut, ChevronDown, ChevronRight, Zap, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePopupProps {
  onSettingsClick?: () => void;
  onAppearanceClick?: () => void;
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

const InfoIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="9" cy="9" r="7" />
    <path d="M9 8.5v4M9 6.5v0" strokeLinecap="round" />
  </svg>
);

export default function ProfilePopup({ onSettingsClick, onAppearanceClick, onProfileClick }: ProfilePopupProps) {
  const { theme } = useTheme();
  const { display_name, avatar_url, email, plan } = useProfile();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(display_name, email);
  const displayLabel = display_name || email || 'User';
  const isDark = theme === 'dark';

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[rgba(255,255,255,0.7)]' : 'text-gray-600';
  const textDim = isDark ? 'text-[rgba(255,255,255,0.5)]' : 'text-gray-500';
  const borderColor = isDark
    ? 'border-[rgba(255,255,255,0.1)]'
    : 'border-[rgba(0,0,0,0.08)]';
  const hoverBg = isDark
    ? 'hover:bg-[rgba(255,255,255,0.06)]'
    : 'hover:bg-[rgba(0,0,0,0.04)]';
  const dividerBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setLearnMoreOpen(false);
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

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    setLearnMoreOpen(false);
    navigate(path);
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
            className={`absolute bottom-full left-0 mb-3 w-[220px] border ${borderColor} rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.25)] overflow-hidden z-[200]`}
            style={{
              transformOrigin: 'bottom left',
              background: isDark ? '#1a1a1c' : '#ffffff',
            }}
          >
            {/* Profile Header */}
            <div className="px-4 py-4" style={{ borderBottom: `1px solid ${dividerBg}` }}>
              <div className="flex items-center gap-3">
                <AvatarCircle size={48} textSize="16px" />
                <div className="flex-1 min-w-0">
                  <div className={`${textColor} text-[14px] font-medium truncate`} style={{ fontFamily: "'Inter', sans-serif" }}>{displayLabel}</div>
                  <div className={`${textDim} text-[12px] mt-0.5 truncate`} style={{ fontFamily: "'Inter', sans-serif" }}>{email}</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1.5">
              {/* Settings */}
              <button
                onClick={() => { setIsOpen(false); onSettingsClick?.(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${textColor} text-[13px] transition-colors ${hoverBg}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Settings className={`w-[18px] h-[18px] ${textSecondary}`} strokeWidth={1.5} />
                <span className="flex-1">Settings</span>
              </button>

              {/* Appearance */}
              <button
                onClick={() => { setIsOpen(false); onAppearanceClick?.(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${textColor} text-[13px] transition-colors ${hoverBg}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <SlidersHorizontal className={`w-[18px] h-[18px] ${textSecondary}`} strokeWidth={1.5} />
                <span className="flex-1">Appearance</span>
              </button>

              {/* Upgrade Plan */}
              <button
                onClick={() => handleNavigate('/pricing')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${textColor} text-[13px] transition-colors ${hoverBg}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Zap className={`w-[18px] h-[18px] ${textSecondary}`} strokeWidth={1.5} />
                <span className="flex-1">Upgrade Plan</span>
              </button>

              {/* Learn More — collapsible */}
              <button
                onClick={() => setLearnMoreOpen(!learnMoreOpen)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${textColor} text-[13px] transition-colors ${hoverBg}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <InfoIcon className={`${textSecondary}`} />
                <span className="flex-1">Learn More</span>
                {learnMoreOpen
                  ? <ChevronDown className={`w-3.5 h-3.5 ${textDim}`} strokeWidth={1.5} />
                  : <ChevronRight className={`w-3.5 h-3.5 ${textDim}`} strokeWidth={1.5} />
                }
              </button>

              {/* Learn More sub-items */}
              {learnMoreOpen && (
                <div>
                  {[
                    { label: 'About', path: '/about' },
                    { label: 'Usage Policy', path: '/usage-policy' },
                    { label: 'Privacy Policy', path: '/privacy-policy' },
                  ].map(item => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 pl-11 pr-4 py-2 text-left ${textSecondary} text-[12px] transition-colors ${hoverBg}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ height: 1, background: dividerBg }} />

            {/* Log Out */}
            <div className="py-1.5">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${textDim} text-[13px] transition-colors ${hoverBg}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
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
        <AvatarCircle size={28} textSize="11px" />
        <div className="flex-1 min-w-0 text-left">
          <div className={`${textColor} text-[12px] font-medium truncate`} style={{ fontFamily: "'Inter', sans-serif" }}>{displayLabel}</div>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            }}
          >
            {plan === 'pro' || plan === 'pro_annual' ? 'Pro' : 'Free Trial'}
          </div>
        </div>
      </button>
    </div>
  );
}
