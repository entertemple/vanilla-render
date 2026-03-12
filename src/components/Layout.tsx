import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, MessageSquare, Trash2, Menu, X, Settings, User, Sparkles, BookOpen, History, Compass, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SettingsModal from './SettingsModal';
import ProfileModal from './ProfileModal';
import ProfilePopup from './ProfilePopup';
import WordmarkDark from './WordmarkDark';
import WordmarkLight from './WordmarkLight';

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, userPlan } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Load conversations from Supabase
  useEffect(() => {
    if (!user) return;
    const loadConversations = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) {
        setConversations(data.map(c => ({ id: c.id, title: c.title, createdAt: new Date(c.created_at) })));
      }
    };
    loadConversations();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `user_id=eq.${user.id}` }, () => {
        loadConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme-based colors
  const bgPrimary = theme === 'light' 
    ? 'bg-[rgba(255,255,255,0.75)]'  // More opaque for light theme
    : 'bg-[rgba(81,81,81,0.08)]';    // Almost transparent glassmorphism
  
  const bgSecondary = theme === 'light' 
    ? 'bg-[rgba(255,255,255,0.75)]'  // More opaque for light theme
    : 'bg-[rgba(81,81,81,0.08)]';    // Almost transparent glassmorphism
  
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.6)]';
  const borderColor = theme === 'light' 
    ? 'border-[rgba(255,255,255,0.6)]'  // Lighter border for glass effect
    : 'border-[rgba(255,255,255,0.18)]'; // Lighter border for glass effect
  
  const hoverBg = theme === 'light' 
    ? 'hover:bg-[rgba(255,255,255,0.15)]' 
    : 'hover:bg-[rgba(255,255,255,0.1)]';
  
  const activeBg = theme === 'light' 
    ? 'bg-[rgba(255,255,255,0.2)]' 
    : 'bg-[rgba(255,255,255,0.15)]';
  
  const inputBg = theme === 'light' 
    ? 'bg-[rgba(255,255,255,0.1)]' 
    : 'bg-[rgba(255,255,255,0.05)]';

  const createNewChat = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select()
      .single();

    if (data && !error) {
      navigate(`/chat/${data.id}`);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('conversations').delete().eq('id', id);
    
    if (location.pathname === `/chat/${id}`) {
      navigate('/chat');
    }
  };

  const navigationItems = [
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: Sparkles, label: 'Discover', path: '/discover' },
    { icon: BookOpen, label: 'Library', path: '/library' },
    { icon: History, label: 'History', path: '/history' },
  ];

  const isActive = (path: string) => {
    if (path === '/chat') {
      return location.pathname === '/chat' || location.pathname.startsWith('/chat/');
    }
    return location.pathname === path;
  };

  return (
    <>
      <div className="w-full h-screen flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div 
          className={`relative flex rounded-[32px] md:rounded-[48px] border ${borderColor} overflow-hidden w-full h-full max-w-[1600px]`}
        >
          {/* Sidebar */}
          <div 
            className={`
              backdrop-blur-[64px] backdrop-filter ${bgPrimary}
              border-r ${borderColor} flex flex-col
              transition-all duration-300 ease-in-out
              ${sidebarOpen ? 'w-[200px] md:w-[240px] lg:w-[280px]' : 'w-0'}
            `}
            style={{ overflow: 'hidden' }}
          >
            {/* Sidebar Header */}
            <div className={`flex-shrink-0 p-4 border-b ${borderColor} space-y-3`}>
              <button
                onClick={createNewChat}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[16px] ${inputBg} border ${borderColor} ${hoverBg} transition-colors`}
              >
                <Plus className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                <span className={`font-['Geist_Mono',_monospace] ${textColor} text-[11px] tracking-[-0.22px] uppercase`}>
                  New Chat
                </span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className={`flex-shrink-0 p-2 border-b ${borderColor}`}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 mb-1 rounded-[12px] 
                      transition-all duration-200 ease-out
                      ${active ? `${activeBg} border ${borderColor}` : hoverBg}
                    `}
                  >
                    <Icon className={`w-3.5 h-3.5 ${textColor}`} strokeWidth={1.5} />
                    <span className={`font-['Inter',_sans-serif] ${textColor} text-[11px]`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Conversations List */}
            <div 
              className="flex-1 overflow-y-auto p-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: theme === 'light' ? 'rgba(0,0,0,0.2) transparent' : 'rgba(255, 255, 255, 0.2) transparent'
              }}
            >
              <div className={`font-['Geist_Mono',_monospace] ${textSecondary} text-[9px] tracking-[0.1em] uppercase px-3 py-2`}>
                Recent Chats
              </div>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className={`
                    group relative flex items-center gap-2 px-3 py-2.5 mb-1 rounded-[12px] cursor-pointer transition-colors
                    ${location.pathname === `/chat/${conv.id}`
                      ? `${activeBg} border ${borderColor}` 
                      : hoverBg
                    }
                  `}
                >
                  <MessageSquare className={`w-3.5 h-3.5 ${textColor} shrink-0`} strokeWidth={1.5} />
                  <span className={`font-['Inter',_sans-serif] ${textColor} text-[11px] truncate flex-1`}>
                    {conv.title}
                  </span>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className={`w-3 h-3 ${textSecondary} hover:text-red-400`} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className={`flex-shrink-0 p-4 border-t ${borderColor}`}>
              {/* Profile Popup with Avatar + Username */}
              <ProfilePopup 
                onSettingsClick={() => setSettingsOpen(true)}
                onProfileClick={() => setProfileOpen(true)}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col backdrop-blur-[64px] backdrop-filter ${bgSecondary}`}>
            {/* Header */}
            <div className={`flex-shrink-0 px-4 md:px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`
                  w-8 h-8 rounded-[12px] flex items-center justify-center 
                  ${hoverBg} 
                  transition-all duration-200 ease-out
                  hover:scale-110 hover:rotate-90
                `}
              >
                {sidebarOpen ? (
                  <X className={`w-4 h-4 ${textColor} transition-transform duration-200`} strokeWidth={1.5} />
                ) : (
                  <Menu className={`w-4 h-4 ${textColor} transition-transform duration-200`} strokeWidth={1.5} />
                )}
              </button>
              
              <div className="flex-1 flex items-center justify-center">
              <button
                  onClick={() => navigate('/')}
                  className="rounded-[12px] p-2 outline-none focus:outline-none focus:ring-0 border-none"
                >
                  {theme === 'light' ? (
                    <WordmarkLight className="w-auto h-5 object-contain" />
                  ) : (
                    <WordmarkDark className="w-auto h-5 object-contain" />
                  )}
                </button>
              </div>

              <div className="w-8" /> {/* Spacer for centering */}
            </div>

            {/* Scrollable Content Area */}
            <div 
              className="flex-1 overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: theme === 'light' ? 'rgba(0,0,0,0.2) transparent' : 'rgba(255, 255, 255, 0.2) transparent'
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}