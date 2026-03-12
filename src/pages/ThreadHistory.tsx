import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { MoreHorizontal } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ConversationRow {
  id: string;
  title: string;
  preview: string;
  created_at: string;
  starred: boolean;
}

export default function ThreadHistory() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme !== 'light';

  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const textColor = isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const borderBtn = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const menuBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const menuBg = isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)';

  const loadConversations = async () => {
    if (!user) return;
    const { data: convos } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!convos) return;

    // Fetch first assistant message for each conversation for preview
    const rows: ConversationRow[] = [];
    for (const c of convos) {
      const { data: msgs } = await supabase
        .from('messages')
        .select('content')
        .eq('conversation_id', c.id)
        .eq('role', 'assistant')
        .order('created_at', { ascending: true })
        .limit(1);

      let preview = '';
      if (msgs && msgs.length > 0) {
        // Extract first body sentence
        const bodyMatch = msgs[0].content.match(/BODY:\s*(.+?)(?=\n\n|\nINVITATION:|$)/s);
        if (bodyMatch) {
          const firstSentence = bodyMatch[1].trim().split('\n')[0];
          preview = firstSentence.replace(/\[\d+\]/g, '').trim();
        } else {
          preview = msgs[0].content.substring(0, 120).replace(/\[\d+\]/g, '').trim();
        }
      }

      // Extract anchor as title if title is generic
      let displayTitle = c.title;
      if (msgs && msgs.length > 0 && (c.title === 'New Conversation' || c.title.split(' ').length <= 4)) {
        const anchorMatch = msgs[0].content.match(/ANCHOR:\s*(.+?)(?=\n\n|\nKEYWORDS:)/s);
        if (anchorMatch) {
          displayTitle = anchorMatch[1].replace(/\[\d+\]/g, '').trim();
        }
      }

      rows.push({
        id: c.id,
        title: displayTitle,
        preview,
        created_at: c.created_at,
        starred: false, // stored in local state for now
      });
    }
    setConversations(rows);
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  // Close menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus rename input
  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
    }
  }, [renamingId]);

  const handleNewConversation = async () => {
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

  const handleStar = (id: string) => {
    setConversations(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c);
      // Sort: starred first, then by date
      return updated.sort((a, b) => {
        if (a.starred && !b.starred) return -1;
        if (!a.starred && b.starred) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });
    setMenuOpenId(null);
  };

  const handleRenameStart = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(currentTitle);
    setMenuOpenId(null);
  };

  const handleRenameSave = async (id: string) => {
    if (renameValue.trim()) {
      await supabase.from('conversations').update({ title: renameValue.trim() }).eq('id', id);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: renameValue.trim() } : c));
    }
    setRenamingId(null);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('messages').delete().eq('conversation_id', id);
    await supabase.from('conversations').delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
    setDeletingId(null);
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredConversations = q
    ? conversations.filter(c =>
        c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
      )
    : conversations;

  return (
    <div className="flex-1 flex flex-col p-6 md:p-8">
      <div style={{ maxWidth: 680 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.1rem',
              fontWeight: 400,
              color: textColor,
            }}
          >
            History
          </h1>
          <div
            style={{
              position: 'relative',
              border: `1px solid ${borderBtn}`,
              display: 'flex',
              alignItems: 'center',
              padding: '0.4rem 0.7rem',
              gap: '0.5rem',
              minWidth: 200,
              maxWidth: 260,
            }}
          >
            <Search size={13} style={{ color: textColor, opacity: 0.35, flexShrink: 0 }} strokeWidth={1.5} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations"
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.7rem',
                letterSpacing: '0.04em',
                color: textColor,
                width: '100%',
                padding: 0,
              }}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div>
          {filteredConversations.length === 0 && (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                opacity: 0.4,
                color: textColor,
              }}
            >
              No conversations yet.
            </p>
          )}
          {filteredConversations.map((conv, idx) => (
            <div key={conv.id}>
              {/* Row */}
              <div
                className="group relative"
                style={{
                  padding: '1rem 0',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/chat/${conv.id}`)}
              >
                {/* Title */}
                {renamingId === conv.id ? (
                  <input
                    ref={renameRef}
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameSave(conv.id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    onBlur={() => handleRenameSave(conv.id)}
                    onClick={e => e.stopPropagation()}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: 400,
                      color: textColor,
                      background: 'none',
                      border: 'none',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                      outline: 'none',
                      padding: 0,
                      width: '100%',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: 400,
                      color: textColor,
                      paddingRight: '2rem',
                    }}
                  >
                    {conv.starred && (
                      <span style={{ fontFamily: "'Playfair Display', serif", marginRight: 6 }}>·</span>
                    )}
                    {conv.title}
                  </div>
                )}

                {/* Preview */}
                {conv.preview && (
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.8rem',
                      fontWeight: 300,
                      opacity: 0.45,
                      color: textColor,
                      marginTop: '0.35rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      paddingRight: '2rem',
                    }}
                  >
                    {conv.preview}
                  </div>
                )}

                {/* Timestamp */}
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    opacity: 0.3,
                    color: textColor,
                    marginTop: '0.3rem',
                  }}
                >
                  {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                </div>

                {/* Three-dot menu trigger */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                    setDeletingId(null);
                  }}
                  className="group-hover:!opacity-100"
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: 0.25,
                    padding: 4,
                    color: textColor,
                    transition: 'opacity 200ms',
                  }}
                >
                  <MoreHorizontal size={16} strokeWidth={1.5} />
                </button>

                {/* Dropdown menu */}
                {menuOpenId === conv.id && (
                  <div
                    ref={menuRef}
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '2.5rem',
                      right: 0,
                      background: menuBg,
                      border: `1px solid ${menuBorder}`,
                      borderRadius: 0,
                      zIndex: 50,
                      minWidth: 120,
                    }}
                  >
                    <button
                      onClick={() => handleStar(conv.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        color: textColor,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {conv.starred ? 'Unstar' : 'Star'}
                    </button>
                    <button
                      onClick={() => handleRenameStart(conv.id, conv.title)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        color: textColor,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(conv.id);
                        setMenuOpenId(null);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        color: textColor,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Inline delete confirmation */}
              {deletingId === conv.id && (
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    color: textColor,
                    opacity: 0.6,
                    padding: '0.5rem 0',
                  }}
                >
                  Delete this conversation?{' '}
                  <button
                    onClick={() => handleDelete(conv.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: textColor,
                      textDecoration: 'underline',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.75rem',
                      padding: 0,
                      marginLeft: 8,
                    }}
                  >
                    confirm
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: textColor,
                      textDecoration: 'underline',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.75rem',
                      padding: 0,
                      marginLeft: 8,
                    }}
                  >
                    cancel
                  </button>
                </div>
              )}

              {/* Divider */}
              {idx < conversations.length - 1 && (
                <div style={{ height: 1, background: dividerColor }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
