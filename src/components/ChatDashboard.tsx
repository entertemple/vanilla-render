import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowUp } from 'lucide-react';
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
}

const TEMPLE_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/temple-chat`;
const ERROR_RESPONSE = "KEYWORDS: SILENCE · PATIENCE · RETURN\n\nANCHOR: something went quiet\n\nBODY: try again.\n\nINVITATION: the thread is still here.\n\nGO DEEPER: 4'33\" by John Cage — sometimes the silence is the composition.";

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

// Strip citation markers like [1], [2], [1][2], etc.
function stripCitations(text: string): string {
  return text.replace(/\[\d+\]/g, '').replace(/\s{2,}/g, ' ').trim();
}

function parseStructuredResponse(content: string): ParsedResponse {
  const defaults: ParsedResponse = {
    keywords: '',
    anchor: '',
    body: [],
    invitation: '',
    goDeeper: { title: '', reason: '' },
  };

  const keywordsMatch = content.match(/KEYWORDS:\s*(.+?)(?=\n\n|\nANCHOR:)/s);
  const anchorMatch = content.match(/ANCHOR:\s*(.+?)(?=\n\n|\nBODY:)/s);
  const bodyMatch = content.match(/BODY:\s*(.+?)(?=\n\n|\nINVITATION:)/s);
  const invitationMatch = content.match(/INVITATION:\s*(.+?)(?=\n\n|\nGO DEEPER:)/s);
  const goDeeperMatch = content.match(/GO DEEPER:\s*(.+?)(?=\n\n|\nTO PONDER:|$)/s);

  if (keywordsMatch) {
    // Limit to 3 keywords max
    const words = keywordsMatch[1].trim().split(/\s*·\s*/).slice(0, 3);
    defaults.keywords = words.join(' · ');
  }
  if (anchorMatch) defaults.anchor = stripCitations(anchorMatch[1].trim());
  if (bodyMatch) {
    defaults.body = bodyMatch[1].trim().split('\n').map(l => stripCitations(l.trim())).filter(Boolean);
  }
  if (invitationMatch) defaults.invitation = stripCitations(invitationMatch[1].trim());
  if (goDeeperMatch) {
    const raw = stripCitations(goDeeperMatch[1].trim());
    // Try to extract URL from format: [URL] Title — Reason  or  URL Title — Reason
    const urlMatch = raw.match(/^(https?:\/\/\S+)\s+(.+)/);
    let rest = raw;
    let url = '';
    if (urlMatch) {
      url = urlMatch[1];
      rest = urlMatch[2];
    }
    const dashIndex = rest.indexOf(' — ');
    if (dashIndex > -1) {
      defaults.goDeeper = { title: rest.slice(0, dashIndex).trim(), reason: rest.slice(dashIndex + 3).trim(), url };
    } else {
      defaults.goDeeper = { title: rest, reason: '', url };
    }
  }

  if (!defaults.anchor && !defaults.keywords) {
    const lines = content.split('\n').map(l => stripCitations(l.trim())).filter(Boolean);
    defaults.anchor = lines[0] || content;
    defaults.body = lines.slice(1);
  }

  return defaults;
}

// Build a contextual search URL for the Go Deeper reference
function buildSearchUrl(title: string): string {
  return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(title)}`;
}

const oracleEasing = [0.16, 1, 0.3, 1] as const;

function AssistantMessage({
  content,
  theme,
  isNew,
}: {
  content: string;
  theme: string;
  isNew: boolean;
}) {
  const parsed = parseStructuredResponse(content);
  const isDark = theme !== 'light';

  const keywordsColor = isDark ? '#ffffff' : '#0e0e0e';
  const bodyColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)';
  const invitationColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  const labelColor = isDark ? '#ffffff' : '#0e0e0e';
  const anchorColor = isDark ? '#ffffff' : '#0e0e0e';
  const goDeeperTitleColor = isDark ? '#ffffff' : '#0e0e0e';

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontFamily: "'Geist Mono', monospace",
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: labelColor,
    marginBottom: '0.5rem',
    fontWeight: 500,
  };

  const keywordWords = parsed.keywords ? parsed.keywords.split(/\s*·\s*/).slice(0, 3) : [];

  // Anchor style with mix-blend-mode difference
  const anchorStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontWeight: 400,
    color: anchorColor,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    marginBottom: '0.75rem',
    
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    fontWeight: 600,
    color: bodyColor,
    lineHeight: 1.9,
    marginBottom: '0.75rem',
  };

  const invitationStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontStyle: 'italic',
    fontWeight: 400,
    color: invitationColor,
    marginTop: '1.5rem',
    lineHeight: 1.4,
  };

  // Go Deeper card: no background, keep box-shadow, clickable
  const goDeeperCardStyle: React.CSSProperties = {
    background: 'transparent',
    boxShadow: isDark
      ? '0 8px 32px rgba(31,38,135,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
      : '0 8px 32px rgba(31,38,135,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
    padding: '1.25rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  };

  if (!isNew) {
    return (
      <div className="max-w-[680px]">
        {parsed.anchor && (
          <p style={anchorStyle}>{parsed.anchor}</p>
        )}
        {parsed.keywords && (
          <p style={{ fontSize: '0.7rem', fontFamily: "'Geist Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', color: keywordsColor, marginTop: '0.75rem', marginBottom: '2rem', fontWeight: 500 }}>
            {keywordWords.join(' · ')}
          </p>
        )}
        {parsed.body.map((sentence, i) => (
          <p key={i} style={bodyStyle}>{sentence}</p>
        ))}
        {parsed.invitation && (
          <p style={invitationStyle}>{parsed.invitation}</p>
        )}
        {parsed.goDeeper.title && (
          <div style={{ marginTop: '2.5rem' }}>
            <p style={labelStyle}>GO DEEPER</p>
            <a
              href={buildSearchUrl(parsed.goDeeper.title)}
              target="_blank"
              rel="noopener noreferrer"
              style={goDeeperCardStyle}
              className="hover:shadow-[0_12px_40px_rgba(31,38,135,0.4)] hover:translate-y-[-1px]"
            >
              <p style={{ fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: goDeeperTitleColor, marginBottom: '0.3rem' }}>{parsed.goDeeper.title}</p>
              {parsed.goDeeper.reason && (
                <p style={{ fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 300, color: bodyColor }}>{parsed.goDeeper.reason}</p>
              )}
            </a>
          </div>
        )}
      </div>
    );
  }

  // === Animated (new message) render ===
  let delay = 1.5;
  const anchorDelay = delay;
  delay += 1.6;
  const keywordsStartDelay = delay;
  delay += 0.3 + keywordWords.length * 0.1;
  const bodyStartDelay = delay + 0.2;
  delay += parsed.body.length * 0.2 + 0.4;
  const invitationDelay = delay + 0.3;
  delay += 0.5;
  const goDeeperDelay = delay + 0.3;

  return (
    <div className="max-w-[680px]">
      {/* ANCHOR — mix-blend-mode: difference */}
      {parsed.anchor && (
        <motion.p
          initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, delay: anchorDelay, ease: oracleEasing }}
          style={anchorStyle}
        >
          {parsed.anchor}
        </motion.p>
      )}

      {/* KEYWORDS — staggered, max 3 */}
      {keywordWords.length > 0 && (
        <div style={{ marginTop: '0.75rem', marginBottom: '2rem', display: 'flex', gap: '0.5em', alignItems: 'center' }}>
          {keywordWords.map((word, i) => (
           <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: keywordsStartDelay + i * 0.1, ease: oracleEasing }}
              style={{ fontSize: '0.7rem', fontFamily: "'Geist Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: keywordsColor, fontWeight: 500 }}
            >
              {i > 0 && <span style={{ marginRight: '0.5em' }}>·</span>}
              {word.trim()}
            </motion.span>
          ))}
        </div>
      )}

      {/* BODY — typewriter stagger */}
      {parsed.body.map((sentence, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: bodyStartDelay + i * 0.2, ease: oracleEasing }}
          style={bodyStyle}
        >
          {sentence}
        </motion.p>
      ))}

      {/* INVITATION */}
      {parsed.invitation && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: invitationDelay, ease: oracleEasing }}
          style={invitationStyle}
        >
          {parsed.invitation}
        </motion.p>
      )}

      {/* GO DEEPER — clickable, no background */}
      {parsed.goDeeper.title && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: goDeeperDelay, ease: oracleEasing }}
          style={{ marginTop: '2.5rem' }}
        >
          <p style={labelStyle}>GO DEEPER</p>
          <a
            href={buildSearchUrl(parsed.goDeeper.title)}
            target="_blank"
            rel="noopener noreferrer"
            style={goDeeperCardStyle}
            className="hover:shadow-[0_12px_40px_rgba(31,38,135,0.4)] hover:translate-y-[-1px]"
          >
            <p style={{ fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: goDeeperTitleColor, marginBottom: '0.3rem' }}>{parsed.goDeeper.title}</p>
            {parsed.goDeeper.reason && (
              <p style={{ fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 300, color: bodyColor }}>{parsed.goDeeper.reason}</p>
            )}
          </a>
        </motion.div>
      )}
    </div>
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  const userBubbleBg = isDark ? 'rgba(40,40,40,0.75)' : 'rgba(255,255,255,0.55)';
  const userBubbleBorder = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(200,200,200,0.4)';
  const userTextColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)';

  // Scroll to bottom but keep new content visible (not pushed above viewport)
  useEffect(() => {
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      // Smooth scroll to bottom, keeping content in view
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isWaiting]);

  useEffect(() => {
    if (isFocused || input || hasConversation) return;
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % SUGGESTED_QUESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused, input, hasConversation]);

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
      // Strip markdown bold and citation markers
      const cleanedContent = rawContent.replace(/\*([^*]+)\*/g, '$1').replace(/\[\d+\]/g, '');

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
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: isDark ? 'rgba(255,255,255,0.2) transparent' : 'rgba(0,0,0,0.2) transparent' }}
      >
        <div className="max-w-[680px] mx-auto px-8 pt-16 pb-8">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === 'user' ? (
                <div className="flex justify-end mb-12">
                  <div
                    style={{
                      background: userBubbleBg,
                      border: `1px solid ${userBubbleBorder}`,
                      backdropFilter: 'saturate(180%) blur(20px)',
                      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                      boxShadow: isDark
                        ? '0 8px 32px rgba(0,0,0,0.2)'
                        : '0 8px 32px rgba(0,0,0,0.06)',
                      borderRadius: '16px',
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
                  />
                </div>
              )}
            </div>
          ))}

          {isWaiting && (
            <div className="mb-16 max-w-[680px]">
              <TextShimmer
                duration={2.5}
                className="font-['DM_Serif_Display',_Georgia,_serif] italic text-base [--base-color:rgba(255,255,255,0.2)] [--base-gradient-color:rgba(255,255,255,0.65)] dark:[--base-color:rgba(255,255,255,0.2)] dark:[--base-gradient-color:rgba(255,255,255,0.8)]"
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
    </div>
  );
}
