import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowUp, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'motion/react';
import { TextShimmer } from '@/components/ui/text-shimmer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: string[];
}

interface ParsedResponse {
  keywords: string;
  anchor: string;
  body: string[];
  invitation: string;
  goDeeper: { title: string; reason: string };
  toPonder: string;
}

const TEMPLE_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/temple-chat`;
const ERROR_RESPONSE = "KEYWORDS: SILENCE · PATIENCE · RETURN\n\nANCHOR: something went quiet\n\nBODY: try again.\n\nINVITATION: the thread is still here.\n\nGO DEEPER: 4'33\" by John Cage — sometimes the silence is the composition.\n\nTO PONDER: even pauses have rhythm.";

const SUGGESTED_QUESTIONS = [
  "Hey temple...",
  "I've been 'about to start' for three weeks now...",
  "my body said no but I said sure, absolutely, sounds great...",
  "I have a vision board and an overdraft. explain...",
  "I know the answer. I just don't like it...",
  "manifested a parking spot in Manhattan. universe is playing...",
];

const WaveformIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="6" width="2" height="8" rx="1" fill="currentColor" />
    <rect x="7" y="4" width="2" height="12" rx="1" fill="currentColor" />
    <rect x="11" y="7" width="2" height="6" rx="1" fill="currentColor" />
    <rect x="15" y="5" width="2" height="10" rx="1" fill="currentColor" />
  </svg>
);

function parseStructuredResponse(content: string): ParsedResponse {
  const defaults: ParsedResponse = {
    keywords: '',
    anchor: '',
    body: [],
    invitation: '',
    goDeeper: { title: '', reason: '' },
    toPonder: '',
  };

  const keywordsMatch = content.match(/KEYWORDS:\s*(.+?)(?=\n\n|\nANCHOR:)/s);
  const anchorMatch = content.match(/ANCHOR:\s*(.+?)(?=\n\n|\nBODY:)/s);
  const bodyMatch = content.match(/BODY:\s*(.+?)(?=\n\n|\nINVITATION:)/s);
  const invitationMatch = content.match(/INVITATION:\s*(.+?)(?=\n\n|\nGO DEEPER:)/s);
  const goDeeperMatch = content.match(/GO DEEPER:\s*(.+?)(?=\n\n|\nTO PONDER:)/s);
  const toPonderMatch = content.match(/TO PONDER:\s*(.+?)$/s);

  if (keywordsMatch) defaults.keywords = keywordsMatch[1].trim();
  if (anchorMatch) defaults.anchor = anchorMatch[1].trim();
  if (bodyMatch) {
    defaults.body = bodyMatch[1].trim().split('\n').map(l => l.trim()).filter(Boolean);
  }
  if (invitationMatch) defaults.invitation = invitationMatch[1].trim();
  if (goDeeperMatch) {
    const raw = goDeeperMatch[1].trim();
    const dashIndex = raw.indexOf(' — ');
    if (dashIndex > -1) {
      defaults.goDeeper = { title: raw.slice(0, dashIndex).trim(), reason: raw.slice(dashIndex + 3).trim() };
    } else {
      defaults.goDeeper = { title: raw, reason: '' };
    }
  }
  if (toPonderMatch) defaults.toPonder = toPonderMatch[1].trim();

  // Fallback for unstructured responses
  if (!defaults.anchor && !defaults.keywords) {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    defaults.anchor = lines[0] || content;
    defaults.body = lines.slice(1);
  }

  return defaults;
}

const customEasing = [0.16, 1, 0.3, 1] as const;
const FADE_DURATION = 0.5;

function AssistantMessage({
  content,
  theme,
  isNew,
  citations,
  onOpenSources,
}: {
  content: string;
  theme: string;
  isNew: boolean;
  citations?: string[];
  onOpenSources: (citations: string[], subject: string) => void;
}) {
  const parsed = parseStructuredResponse(content);
  const isDark = theme !== 'light';

  const anchorColor = isDark ? '#ffffff' : '#000000';
  const keywordsColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
  const bodyColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)';
  const invitationColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  const toPonderColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  const labelColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const sourcesBtnBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const sourcesBtnColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

  const labelStyle: React.CSSProperties = {
    fontSize: '0.6rem',
    fontFamily: "'Geist Mono', monospace",
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: labelColor,
    marginBottom: '0.5rem',
  };

  if (!isNew) {
    return (
      <div className="max-w-[680px]">
        {parsed.keywords && (
          <p style={{ fontSize: '0.7rem', fontFamily: "'Geist Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', color: keywordsColor, marginBottom: '2rem' }}>
            {parsed.keywords}
          </p>
        )}
        <p style={{ fontSize: '2.5rem', fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, color: anchorColor, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '2rem' }}>
          {parsed.anchor}
        </p>
        {parsed.body.map((sentence, i) => (
          <p key={i} style={{ fontSize: '1rem', fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 300, color: bodyColor, lineHeight: 1.9, marginBottom: '0.75rem' }}>
            {sentence}
          </p>
        ))}
        {parsed.invitation && (
          <p style={{ fontSize: '1.5rem', fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, color: invitationColor, marginTop: '2rem', lineHeight: 1.4 }}>
            {parsed.invitation}
          </p>
        )}
        {parsed.goDeeper.title && (
          <div style={{ marginTop: '2rem' }}>
            <p style={labelStyle}>GO DEEPER</p>
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, padding: '1rem' }}>
              <p style={{ fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: anchorColor, marginBottom: '0.25rem' }}>{parsed.goDeeper.title}</p>
              {parsed.goDeeper.reason && (
                <p style={{ fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 300, color: bodyColor }}>{parsed.goDeeper.reason}</p>
              )}
            </div>
          </div>
        )}
        {parsed.toPonder && (
          <div style={{ marginTop: '2rem' }}>
            <p style={labelStyle}>TO PONDER</p>
            <p style={{ fontSize: '1rem', fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', fontWeight: 300, color: toPonderColor, lineHeight: 1.6 }}>
              {parsed.toPonder}
            </p>
          </div>
        )}
        {citations && citations.length > 0 && (
          <button
            onClick={() => onOpenSources(citations, parsed.anchor || 'this response')}
            style={{ marginTop: '1.5rem', background: 'none', border: `1px solid ${sourcesBtnBorder}`, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.4rem 0.8rem', color: sourcesBtnColor, cursor: 'pointer', fontFamily: "'Geist Mono', monospace" }}
          >
            SOURCES
          </button>
        )}
      </div>
    );
  }

  // Animated render
  let delay = 0.6;
  const keywordsDelay = delay;
  delay += 0.5;
  const anchorDelay = delay;
  delay += 0.8;
  const bodyStartDelay = delay;
  delay += parsed.body.length * 0.3;
  const invitationDelay = delay + 0.3;
  delay += 0.6;
  const goDeeperDelay = delay + 0.3;
  delay += 0.5;
  const toPonderDelay = delay + 0.3;
  delay += 0.5;
  const sourcesDelay = delay + 0.3;

  return (
    <div className="max-w-[680px]">
      {parsed.keywords && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FADE_DURATION, delay: keywordsDelay, ease: customEasing }}
          style={{ fontSize: '0.7rem', fontFamily: "'Geist Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', color: keywordsColor, marginBottom: '2rem' }}
        >
          {parsed.keywords}
        </motion.p>
      )}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: FADE_DURATION, delay: anchorDelay, ease: customEasing }}
        style={{ fontSize: '2.5rem', fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, color: anchorColor, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '2rem' }}
      >
        {parsed.anchor}
      </motion.p>
      {parsed.body.map((sentence, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: FADE_DURATION, delay: bodyStartDelay + i * 0.3, ease: customEasing }}
          style={{ fontSize: '1rem', fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 300, color: bodyColor, lineHeight: 1.9, marginBottom: '0.75rem' }}
        >
          {sentence}
        </motion.p>
      ))}
      {parsed.invitation && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FADE_DURATION, delay: invitationDelay, ease: customEasing }}
          style={{ fontSize: '1.5rem', fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, color: invitationColor, marginTop: '2rem', lineHeight: 1.4 }}
        >
          {parsed.invitation}
        </motion.p>
      )}
      {parsed.goDeeper.title && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FADE_DURATION, delay: goDeeperDelay, ease: customEasing }}
          style={{ marginTop: '2rem' }}
        >
          <p style={labelStyle}>GO DEEPER</p>
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, padding: '1rem' }}>
            <p style={{ fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: anchorColor, marginBottom: '0.25rem' }}>{parsed.goDeeper.title}</p>
            {parsed.goDeeper.reason && (
              <p style={{ fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 300, color: bodyColor }}>{parsed.goDeeper.reason}</p>
            )}
          </div>
        </motion.div>
      )}
      {parsed.toPonder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FADE_DURATION, delay: toPonderDelay, ease: customEasing }}
          style={{ marginTop: '2rem' }}
        >
          <p style={labelStyle}>TO PONDER</p>
          <p style={{ fontSize: '1rem', fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', fontWeight: 300, color: toPonderColor, lineHeight: 1.6 }}>
            {parsed.toPonder}
          </p>
        </motion.div>
      )}
      {citations && citations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FADE_DURATION, delay: sourcesDelay, ease: customEasing }}
        >
          <button
            onClick={() => onOpenSources(citations, parsed.anchor || 'this response')}
            style={{ marginTop: '1.5rem', background: 'none', border: `1px solid ${sourcesBtnBorder}`, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.4rem 0.8rem', color: sourcesBtnColor, cursor: 'pointer', fontFamily: "'Geist Mono', monospace" }}
          >
            SOURCES
          </button>
        </motion.div>
      )}
    </div>
  );
}

function SourcesPanel({
  isOpen,
  onClose,
  citations,
  subject,
  theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  citations: string[];
  subject: string;
  theme: string;
}) {
  const isDark = theme !== 'light';
  const bg = isDark ? 'rgba(10,10,10,0.7)' : 'rgba(255,255,255,0.7)';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const panel = document.getElementById('sources-panel');
      if (panel && !panel.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener('click', handleClick), 10);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="sources-panel"
          initial={{ x: 340 }}
          animate={{ x: 0 }}
          exit={{ x: 340 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 340,
            height: '100vh',
            background: bg,
            backdropFilter: 'blur(20px)',
            borderLeft: `1px solid ${borderColor}`,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1rem' }}>
            <p style={{ fontSize: '0.7rem', fontFamily: "'Geist Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', color: mutedColor }}>
              Sources for {subject.length > 30 ? subject.slice(0, 30) + '…' : subject}
            </p>
            <button onClick={onClose} style={{ color: mutedColor, cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.5rem', lineHeight: 1 }}>
              +
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem' }}>
            {citations.map((url, i) => {
              let domain = '';
              try { domain = new URL(url).hostname.replace('www.', ''); } catch { domain = url; }
              return (
                <div key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', padding: '0.75rem 0', textDecoration: 'none' }}
                  >
                    <p style={{ fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: textColor, marginBottom: '0.2rem', fontWeight: 400 }}>
                      {domain}
                    </p>
                    <p style={{ fontSize: '0.7rem', fontFamily: "'Geist Mono', monospace", color: mutedColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {url}
                    </p>
                  </a>
                  {i < citations.length - 1 && (
                    <div style={{ height: 1, background: dividerColor }} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ChatDashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [newestMessageId, setNewestMessageId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [activeCitations, setActiveCitations] = useState<string[]>([]);
  const [activeSubject, setActiveSubject] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentConversationId(conversationId || null);
    if (!conversationId) {
      setMessages([]);
      return;
    }
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data.map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content, timestamp: new Date(m.created_at) })));
      }
    };
    loadMessages();
  }, [conversationId]);

  const hasConversation = messages.length > 0;
  const isDark = theme !== 'light';

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[rgba(255,255,255,0.6)]' : 'text-gray-600';
  const inputBgColor = isDark ? 'bg-[rgba(40,40,40,0.7)]' : 'bg-[rgba(255,255,255,0.7)]';
  const inputBorderColor = isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-gray-200';
  const inputHoverBg = isDark ? 'hover:bg-[rgba(255,255,255,0.05)]' : 'hover:bg-gray-100';
  const buttonBg = isDark ? 'bg-white' : 'bg-gray-900';
  const buttonText = isDark ? 'text-gray-900' : 'text-white';

  const userBubbleBg = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  const userBubbleBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const userTextColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isFocused || input || hasConversation) return;
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % SUGGESTED_QUESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused, input, hasConversation]);

  const handleOpenSources = (citations: string[], subject: string) => {
    setActiveCitations(citations);
    setActiveSubject(subject);
    setSourcesOpen(true);
  };

  const handleSend = async () => {
    if (!input.trim() || isWaiting || !user) return;

    let activeConversationId = currentConversationId;

    if (!activeConversationId) {
      const title = input.trim().split(/\s+/).slice(0, 4).join(' ');
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title })
        .select()
        .single();
      if (error || !conv) return;
      activeConversationId = conv.id;
      setCurrentConversationId(conv.id);
      navigate(`/chat/${conv.id}`, { replace: true });
    }

    const userContent = input.trim();

    const { data: savedUserMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: activeConversationId, role: 'user', content: userContent })
      .select()
      .single();

    if (savedUserMsg) {
      setMessages(prev => [...prev, { id: savedUserMsg.id, role: 'user', content: savedUserMsg.content, timestamp: new Date(savedUserMsg.created_at) }]);
    }

    setInput('');
    setIsWaiting(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userContent });

      const resp = await fetch(TEMPLE_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!resp.ok) throw new Error('API error');

      const data = await resp.json();
      const rawContent = data.content || '';
      const citations = data.citations || [];
      const cleanedContent = rawContent.replace(/\*([^*]+)\*/g, '$1');

      const { data: savedAiMsg } = await supabase
        .from('messages')
        .insert({ conversation_id: activeConversationId!, role: 'assistant', content: cleanedContent })
        .select()
        .single();

      if (savedAiMsg) {
        setNewestMessageId(savedAiMsg.id);
        setMessages(prev => [...prev, { id: savedAiMsg.id, role: 'assistant', content: savedAiMsg.content, timestamp: new Date(savedAiMsg.created_at), citations }]);
      }
    } catch (err) {
      console.error('Temple chat error:', err);
      const errorId = Date.now().toString();
      setNewestMessageId(errorId);
      setMessages(prev => [...prev, { id: errorId, role: 'assistant', content: ERROR_RESPONSE, timestamp: new Date() }]);
    }

    setIsWaiting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  };

  const renderChatInput = () => (
    <div className={`relative w-full rounded-full ${inputBgColor} backdrop-blur-[120px] border ${inputBorderColor} shadow-[0_20px_60px_rgba(0,0,0,0.25),_0_0_0_1px_rgba(255,255,255,0.05)_inset] transition-all duration-300 hover:shadow-[0_24px_70px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.08)_inset]`}>
      <div className="flex items-center gap-4 px-6 py-4">
        <button onClick={() => fileInputRef.current?.click()} className={`w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-full ${inputHoverBg} transition-all duration-200 hover:scale-105`} aria-label="Attach file">
          <Plus className={`w-5 h-5 ${textColor}`} strokeWidth={2.5} />
        </button>
        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => console.log('Files:', e.target.files)} />

        <div className="flex-1 relative min-h-[26px]">
          {!hasConversation && !isFocused && !input && (
            <div className="absolute inset-0 flex items-center overflow-hidden cursor-text" onClick={() => { setIsFocused(true); textareaRef.current?.focus(); }}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentSuggestionIndex}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className={`${isDark ? 'text-[#e8e8e8]' : 'text-[#333333]'} text-[16px] leading-[1.6] font-['Inter',_sans-serif] cursor-text whitespace-nowrap`}
                >
                  {SUGGESTED_QUESTIONS[currentSuggestionIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => { if (!input) setIsFocused(false); }}
            placeholder={hasConversation ? "Say something..." : ""}
            rows={1}
            className={`w-full bg-transparent border-none resize-none ${textColor} text-[16px] leading-[1.6] font-['Inter',_sans-serif] focus:outline-none focus:ring-0`}
            style={{ maxHeight: '180px', overflow: 'auto', caretColor: '#666666' }}
          />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {input.trim() ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleSend}
              className={`w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full ${buttonBg} transition-all duration-200 hover:scale-110 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]`}
              aria-label="Send message"
            >
              <ArrowUp className={`w-5 h-5 ${buttonText}`} strokeWidth={2.5} />
            </motion.button>
          ) : (
            <button className={`w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full ${inputHoverBg} transition-all duration-200 hover:scale-105`} aria-label="Voice input">
              <WaveformIcon className={textColor} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Welcome state
  if (!hasConversation) {
    return (
      <div className="flex flex-col h-full relative">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <h1 className={`font-['Inter',_sans-serif] text-[28px] md:text-[36px] font-light ${textColor} mb-8 text-center`}>
            How can I guide you today?
          </h1>
          <div className="w-full max-w-[640px]">
            {renderChatInput()}
          </div>
        </div>
        <div className="flex-shrink-0 pb-6 flex justify-center">
          <span className={`font-['Geist_Mono',_monospace] ${textSecondary} text-[10px] tracking-[0.2em] uppercase`}>
            A deeper kind of search
          </span>
        </div>
      </div>
    );
  }

  // Conversation state
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: isDark ? 'rgba(255,255,255,0.2) transparent' : 'rgba(0,0,0,0.2) transparent' }}>
        <div className="max-w-[680px] mx-auto px-8 pt-16 pb-8">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === 'user' ? (
                <div className="flex justify-end mb-12">
                  <div
                    style={{
                      background: userBubbleBg,
                      border: `1px solid ${userBubbleBorder}`,
                      backdropFilter: 'blur(8px)',
                      padding: '1rem 1.25rem',
                      maxWidth: '75%',
                    }}
                  >
                    <p style={{ fontSize: '0.9375rem', fontFamily: "'DM Sans', 'Inter', sans-serif", color: userTextColor }}>
                      {message.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-16">
                  <AssistantMessage
                    content={message.content}
                    theme={theme}
                    isNew={message.id === newestMessageId}
                    citations={message.citations}
                    onOpenSources={handleOpenSources}
                  />
                </div>
              )}
            </div>
          ))}

          {isWaiting && (
            <div className="mb-16 max-w-[680px]">
              <TextShimmer
                duration={2.5}
                className="font-['Playfair_Display'] italic text-base [--base-color:rgba(255,255,255,0.25)] [--base-gradient-color:rgba(255,255,255,0.7)] dark:[--base-color:rgba(255,255,255,0.25)] dark:[--base-gradient-color:rgba(255,255,255,0.85)]"
              >
                Contemplating...
              </TextShimmer>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 px-6 py-4 max-w-[680px] mx-auto w-full">
        {renderChatInput()}
      </div>

      <SourcesPanel
        isOpen={sourcesOpen}
        onClose={() => setSourcesOpen(false)}
        citations={activeCitations}
        subject={activeSubject}
        theme={theme}
      />
    </div>
  );
}
