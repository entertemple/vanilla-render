import { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, Crown, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile?: () => void;
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

export default function ProfileModal({ isOpen, onClose, onEditProfile }: ProfileModalProps) {
  const { theme } = useTheme();
  const { display_name, avatar_url, email } = useProfile();
  const { user } = useAuth();
  const [chatCount, setChatCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [daysSince, setDaysSince] = useState(0);

  useEffect(() => {
    if (!isOpen || !user) return;
    const load = async () => {
      const [convRes, msgRes, authRes] = await Promise.all([
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.auth.getUser(),
      ]);
      setChatCount(convRes.count || 0);
      setMessageCount(msgRes.count || 0);
      if (authRes.data?.user?.created_at) {
        const days = Math.floor((Date.now() - new Date(authRes.data.user.created_at).getTime()) / (1000 * 60 * 60 * 24));
        setDaysSince(days);
      }
    };
    load();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const initials = getInitials(display_name, email);
  const displayLabel = display_name || email || 'User';

  const bgColor = theme === 'light' ? 'bg-[rgba(255,255,255,0.60)]' : 'bg-[rgba(40,40,40,0.90)]';
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.7)]';
  const borderColor = theme === 'light' ? 'border-[rgba(255,255,255,0.6)]' : 'border-[rgba(255,255,255,0.18)]';
  const hoverBg = theme === 'light' ? 'hover:bg-[rgba(255,255,255,0.4)]' : 'hover:bg-[rgba(255,255,255,0.1)]';
  const inputBg = theme === 'light' ? 'bg-[rgba(255,255,255,0.3)]' : 'bg-[rgba(255,255,255,0.08)]';

  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative ${bgColor} backdrop-blur-[64px] rounded-[32px] border ${borderColor} w-full max-w-[450px] overflow-hidden shadow-2xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
          <h2 className={`font-['Geist_Mono',_monospace] text-[16px] tracking-[-0.32px] uppercase ${textColor}`}>Profile</h2>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${hoverBg} transition-colors`}>
            <X className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar & Info */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full ${inputBg} border-2 ${borderColor} flex items-center justify-center mb-4 overflow-hidden`}>
              {avatar_url ? (
                <img src={avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className={`text-[32px] font-semibold ${textSecondary}`}>{initials}</span>
              )}
            </div>
            <h3 className={`font-['Inter',_sans-serif] font-semibold text-[18px] ${textColor}`}>{displayLabel}</h3>
          </div>

          {/* Info Cards */}
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
              <Mail className={`w-5 h-5 ${textSecondary}`} strokeWidth={1.5} />
              <div>
                <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary} uppercase tracking-wide`}>Email</p>
                <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>{email}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
              <Calendar className={`w-5 h-5 ${textSecondary}`} strokeWidth={1.5} />
              <div>
                <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary} uppercase tracking-wide`}>Member Since</p>
                <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>{memberSince}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-3 gap-3 p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
            <div className="text-center">
              <p className={`font-['Geist_Mono',_monospace] text-[20px] font-semibold ${textColor}`}>{formatCount(chatCount)}</p>
              <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary} uppercase tracking-wide`}>Chats</p>
            </div>
            <div className="text-center">
              <p className={`font-['Geist_Mono',_monospace] text-[20px] font-semibold ${textColor}`}>{formatCount(messageCount)}</p>
              <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary} uppercase tracking-wide`}>Messages</p>
            </div>
            <div className="text-center">
              <p className={`font-['Geist_Mono',_monospace] text-[20px] font-semibold ${textColor}`}>{daysSince}</p>
              <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary} uppercase tracking-wide`}>Days</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => { onClose(); onEditProfile?.(); }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] ${inputBg} border ${borderColor} ${hoverBg} transition-colors`}
            >
              <User className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
              <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Edit Profile</span>
            </button>
            <button
              onClick={async () => { onClose(); await supabase.auth.signOut(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" strokeWidth={1.5} />
              <span className="font-['Inter',_sans-serif] text-[13px] text-red-500">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
