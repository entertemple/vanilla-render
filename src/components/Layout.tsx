import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
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

const OracleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="7" cy="7" r="1.2" fill="currentColor"/>
  </svg>
);

const HistoryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const JournalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 3v8M2 3h5v8H2a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M7 3h5a1 1 0 011 1v6a1 1 0 01-1 1H7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string | undefined>();
  const [profileOpen, setProfileOpen] = useState(false);

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

    const channel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `user_id=eq.${user.id}` }, () => {
        loadConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bgPrimary = theme === 'light' ? 'bg-[rgba(255,255,255,0.65)]' : 'bg-[rgba(26,26,28,0.18)]';
  const bgSecondary = theme === 'light' ? 'bg-[rgba(255,255,255,0.65)]' : 'bg-[rgba(26,26,28,0.18)]';
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.6)]';
  const borderColor = theme === 'light' ? 'border-[rgba(255,255,255,0.6)]' : 'border-[rgba(255,255,255,0.18)]';
  const hoverBg = theme === 'light' ? 'hover:bg-[rgba(255,255,255,0.15)]' : 'hover:bg-[rgba(255,255,255,0.1)]';
  const activeBg = theme === 'light' ? 'bg-[rgba(255,255,255,0.2)]' : 'bg-[rgba(255,255,255,0.15)]';

  const createNewChat = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('conversations').insert({ user_id: user.id, title: 'New Conversation' }).select().single();
    if (data && !error) navigate(`/chat/${data.id}`);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(prev => prev === id ? null : id);
  };

  const confirmDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await supabase.from('messages').delete().eq('conversation_id', id);
    await supabase.from('conversations').delete().eq('id', id).eq('user_id', user.id);
    setConversations(prev => prev.filter(c => c.id !== id));
    setConfirmDeleteId(null);
    if (location.pathname === `/chat/${id}`) navigate('/chat');
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const navigationItems = [
    { label: 'Oracle', path: '/oracle', icon: <OracleIcon /> },
    { label: 'History', path: '/history', icon: <HistoryIcon /> },
    { label: 'Journal', path: '/journal', icon: <JournalIcon /> },
  ];

  const isActive = (path: string) => {
    if (path === '/chat') return location.pathname === '/chat' || location.pathname.startsWith('/chat/');
    return location.pathname === path;
  };

  const openSettings = (tab?: string) => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  const handleEditProfile = () => {
    setProfileOpen(false);
    openSettings('account');
  };

  return (
    <>
      <div className="w-full h-screen flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div className={`relative flex rounded-[32px] md:rounded-[48px] border ${borderColor} overflow-hidden w-full h-full max-w-[1600px]`}>
          {/* Sidebar */}
          <div
            className={`backdrop-blur-[64px] backdrop-filter ${bgPrimary} border-r ${borderColor} flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-[200px] md:w-[240px] lg:w-[280px]' : 'w-0'}`}
            style={{ overflow: 'hidden' }}
          >
            <div className={`flex-shrink-0 p-4 border-b ${borderColor} space-y-3`}>
              <button onClick={createNewChat} className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[16px] border ${borderColor} ${hoverBg} transition-colors`}>
                <Plus className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                <span className={`font-['Geist_Mono',_monospace] ${textColor} text-[13px] tracking-[-0.22px] uppercase`}>New Chat</span>
              </button>
            </div>

            <div className={`flex-shrink-0 p-2 border-b ${borderColor}`}>
              {navigationItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button key={item.path} onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2 px-3 py-2 mb-1 rounded-[12px] transition-all duration-200 ease-out ${active ? `${activeBg} border ${borderColor}` : hoverBg}`}>
                    <span className={`${textColor} opacity-60`}>{item.icon}</span>
                    <span className={`font-['Inter',_sans-serif] ${textColor} text-[13px]`}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin', scrollbarColor: theme === 'light' ? 'rgba(0,0,0,0.2) transparent' : 'rgba(255, 255, 255, 0.2) transparent' }}>
              <div className={`font-['Geist_Mono',_monospace] ${textSecondary} text-[11px] tracking-[0.1em] uppercase px-3 py-2`}>Recents</div>
              {conversations.map((conv) => (
                <div key={conv.id}>
                  <div onClick={() => navigate(`/chat/${conv.id}`)}
                    className={`group relative flex items-center gap-2 px-3 py-2.5 mb-0.5 rounded-[12px] cursor-pointer transition-colors ${location.pathname === `/chat/${conv.id}` ? `${activeBg} border ${borderColor}` : hoverBg}`}>
                    <span className={`font-['Inter',_sans-serif] ${textColor} text-[13px] flex-1 min-w-0`}
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{conv.title}</span>
                    <button onClick={(e) => handleDeleteClick(conv.id, e)} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Trash2 className={`w-3 h-3 ${textSecondary} hover:text-red-400`} strokeWidth={1.5} />
                    </button>
                  </div>
                  {confirmDeleteId === conv.id && (
                    <div className="px-3 py-1.5 mb-1 flex items-center gap-2">
                      <span className={`font-['Geist_Mono',_monospace] text-[0.72rem] ${textSecondary}`}>Delete?</span>
                      <button onClick={cancelDelete} className={`font-['Geist_Mono',_monospace] text-[0.72rem] ${textSecondary} hover:opacity-80`}>Cancel</button>
                      <button onClick={(e) => confirmDelete(conv.id, e)} className="font-['Geist_Mono',_monospace] text-[0.72rem] text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={`flex-shrink-0 p-4 border-t ${borderColor}`}>
              <ProfilePopup onSettingsClick={() => openSettings()} onProfileClick={() => setProfileOpen(true)} />
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex-1 flex flex-col backdrop-blur-[64px] backdrop-filter`} style={{ background: theme === 'light' ? 'rgba(255,255,255,0.80)' : 'rgba(26,26,28,0.18)' }}>
            <div className={`flex-shrink-0 px-4 md:px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`w-8 h-8 rounded-[12px] flex items-center justify-center ${hoverBg} transition-all duration-200 ease-out hover:scale-110 hover:rotate-90`}>
                {sidebarOpen ? <X className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} /> : <Menu className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />}
              </button>
              <div className="flex-1 flex items-center justify-center">
                <button onClick={() => navigate('/chat')} className="rounded-[12px] p-2 outline-none focus:outline-none focus:ring-0 border-none">
                  {theme === 'light' ? <WordmarkLight className="w-auto h-5 object-contain" /> : <WordmarkDark className="w-auto h-5 object-contain" />}
                </button>
              </div>
              <div className="w-8" />
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: theme === 'light' ? 'rgba(0,0,0,0.2) transparent' : 'rgba(255, 255, 255, 0.2) transparent' }}>
              {children}
            </div>
          </div>
        </div>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => { setSettingsOpen(false); setSettingsTab(undefined); }} initialTab={settingsTab} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} onEditProfile={handleEditProfile} />
    </>
  );
}
