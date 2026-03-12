import { useState, useRef, useEffect, useCallback } from 'react';
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
  beat?: number;
}

interface ParsedResponse {
  keywords: string;
  anchor: string;
  body: string[];
  invitation: string;
  goDeeper: { title: string; reason: string; url?: string };
}

const TEMPLE_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/temple-chat`;
const TEMPLE_PHRASES_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/temple-phrases`;
const ERROR_RESPONSE = "ANCHOR: something went quiet\n\nKEYWORDS: SILENCE · PATIENCE · RETURN\n\nBODY:\ntry again.\n\nINVITATION: the thread is still here.\n\nGO DEEPER: 4'33\" by John Cage — sometimes the silence is the composition — https://en.wikipedia.org/wiki/4%E2%80%B233%E2%80%B3";

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

  const anchorMatch = content.match(/ANCHOR:\s*(.+?)(?=\n\n|\nKEYWORDS:)/s);
  const keywordsMatch = content.match(/KEYWORDS:\s*(.+?)(?=\n\n|\nBODY:)/s);
  const bodyMatch = content.match(/BODY:\s*(.+?)(?=\n\n|\nINVITATION:)/s);
  const invitationMatch = content.match(/INVITATION:\s*(.+?)(?=\n\n|\nGO DEEPER:|$)/s);
  const goDeeperMatch = content.match(/GO DEEPER:\s*(.+?)$/s);

  if (anchorMatch) defaults.anchor = stripCitations(anchorMatch[1].trim());
  if (keywordsMatch) {
    const words = keywordsMatch[1].trim().split(/\s*·\s*/).slice(0, 3);
    defaults.keywords = words.join(' · ');
  }
  if (bodyMatch) {
    defaults.body = bodyMatch[1].trim().split('\n').map(l => stripCitations(l.trim())).filter(Boolean);
  }
  if (invitationMatch) defaults.invitation = stripCitations(invitationMatch[1].trim());
  if (goDeeperMatch) {
    const raw = stripCitations(goDeeperMatch[1].trim());
    // Format: Title — Reason — URL
    const parts = raw.split(/\s*—\s*/);
    if (parts.length >= 3) {
      const url = parts[parts.length - 1].trim();
      const reason = parts[parts.length - 2].trim();
      const title = parts.slice(0, parts.length - 2).join(' — ').trim();
      defaults.goDeeper = { title, reason, url: url.startsWith('http') ? url : undefined };
    } else if (parts.length === 2) {
      // Could be Title — Reason or Title — URL
      if (parts[1].trim().startsWith('http')) {
        defaults.goDeeper = { title: parts[0].trim(), reason: '', url: parts[1].trim() };
      } else {
        defaults.goDeeper = { title: parts[0].trim(), reason: parts[1].trim() };
      }
    } else {
      defaults.goDeeper = { title: raw, reason: '' };
    }
  }

  if (!defaults.anchor && !defaults.keywords) {
    const lines = content.split('\n').map(l => stripCitations(l.trim())).filter(Boolean);
    defaults.anchor = lines[0] || content;
    defaults.body = lines.slice(1);
  }

  return defaults;
}

function buildSearchUrl(title: string): string {
  return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(title)}`;
}

const oracleEasing = [0.16, 1, 0.3, 1] as const;

// --- GO DEEPER Interactive Card ---
function GoDeeperCard({
  userMessage,
  phrases,
  isDark,
  onPhraseClick,
  isNew,
  animDelay,
}: {
  userMessage: string;
  phrases: string[];
  isDark: boolean;
  onPhraseClick: (phrase: string) => void;
  isNew: boolean;
  animDelay: number;
}) {
  const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  const dimColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
  const activeColor = isDark ? '#ffffff' : '#0e0e0e';
  const bg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  // Build rendered message with highlighted phrases
  const renderHighlightedMessage = () => {
    if (!phrases.length) return <span style={{ color: dimColor }}>{userMessage}</span>;

    // Sort phrases by length descending so longer phrases match first
    const sortedPhrases = [...phrases].sort((a, b) => b.length - a.length);
    const lowerMsg = userMessage.toLowerCase();

    // Find all phrase positions
    type Segment = { start: number; end: number; phrase: string; isPrimary: boolean };
    const segments: Segment[] = [];

    for (const phrase of sortedPhrases) {
      const lowerPhrase = phrase.toLowerCase();
      let searchFrom = 0;
      while (true) {
        const idx = lowerMsg.indexOf(lowerPhrase, searchFrom);
        if (idx === -1) break;
        // Check no overlap with existing segments
        const overlaps = segments.some(s => !(idx + phrase.length <= s.start || idx >= s.end));
        if (!overlaps) {
          segments.push({ start: idx, end: idx + phrase.length, phrase, isPrimary: phrase === phrases[0] });
        }
        searchFrom = idx + 1;
      }
    }

    segments.sort((a, b) => a.start - b.start);

    const parts: React.ReactNode[] = [];
    let lastIdx = 0;

    for (const seg of segments) {
      if (seg.start > lastIdx) {
        parts.push(
          <span key={`dim-${lastIdx}`} style={{ color: dimColor }}>
            {userMessage.slice(lastIdx, seg.start)}
          </span>
        );
      }
      const originalText = userMessage.slice(seg.start, seg.end);
      parts.push(
        <span
          key={`hl-${seg.start}`}
          onClick={(e) => { e.stopPropagation(); onPhraseClick(seg.phrase); }}
          style={{
            color: activeColor,
            fontSize: seg.isPrimary ? '1.05rem' : '1rem',
            cursor: 'pointer',
            opacity: 1,
            transition: 'all 0.2s ease',
            borderBottom: '1px solid transparent',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLSpanElement).style.borderBottom = `1px solid ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}`;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLSpanElement).style.borderBottom = '1px solid transparent';
          }}
        >
          {originalText}
        </span>
      );
      lastIdx = seg.end;
    }

    if (lastIdx < userMessage.length) {
      parts.push(
        <span key={`dim-${lastIdx}`} style={{ color: dimColor }}>
          {userMessage.slice(lastIdx)}
        </span>
      );
    }

    return parts;
  };

  const cardContent = (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '4px',
        padding: '1.25rem',
        marginTop: '2rem',
      }}
    >
      <p style={{
        fontSize: '0.65rem',
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: labelColor,
        marginBottom: '1rem',
        fontWeight: 500,
      }}>
        GO DEEPER
      </p>
      <p style={{
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        fontSize: '1rem',
        lineHeight: 1.8,
        fontWeight: 400,
      }}>
        {renderHighlightedMessage()}
      </p>
    </div>
  );

  if (isNew) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: animDelay, ease: oracleEasing }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

// --- A DOOR Cultural Reference Card (Beat 2) ---
function ADoorCard({
  goDeeper,
  isDark,
  isNew,
  label = 'A DOOR',
}: {
  goDeeper: ParsedResponse['goDeeper'];
  isDark: boolean;
  isNew: boolean;
  label?: string;
}) {
  const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  const titleColor = isDark ? '#ffffff' : '#0e0e0e';
  const reasonColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
  const bg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  const url = goDeeper.url || buildSearchUrl(goDeeper.title);

  const card = (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '4px',
        padding: '1.25rem',
        marginTop: '2rem',
        textDecoration: 'none',
        transition: 'border-color 0.3s ease, transform 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = border;
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
      }}
    >
      <p style={{
        fontSize: '0.65rem',
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: labelColor,
        marginBottom: '0.75rem',
        fontWeight: 500,
      }}>
        A DOOR
      </p>
      <p style={{
        fontSize: '1.1rem',
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        fontWeight: 400,
        color: titleColor,
        marginBottom: goDeeper.reason ? '0.3rem' : 0,
      }}>
        {goDeeper.title}
      </p>
      {goDeeper.reason && (
        <p style={{
          fontSize: '0.875rem',
          fontFamily: "'DM Sans', 'Inter', sans-serif",
          fontWeight: 400,
          color: reasonColor,
        }}>
          {goDeeper.reason}
        </p>
      )}
    </a>
  );

  if (isNew) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2, ease: oracleEasing }}
      >
        {card}
      </motion.div>
    );
  }

  return card;
}

// --- Assistant Message ---
function AssistantMessage({
  content,
  theme,
  isNew,
  beat,
  userMessage,
  phrases,
  onPhraseClick,
  beat2Question,
}: {
  content: string;
  theme: string;
  isNew: boolean;
  beat: number;
  userMessage?: string;
  phrases?: string[];
  onPhraseClick?: (phrase: string) => void;
  beat2Question?: string;
}) {
  const parsed = parseStructuredResponse(content);
  const isDark = theme !== 'light';

  const keywordsColor = isDark ? '#ffffff' : '#0e0e0e';
  const bodyColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)';
  const invitationColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  const anchorColor = isDark ? '#ffffff' : '#0e0e0e';

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

  const keywordWords = parsed.keywords ? parsed.keywords.split(/\s*·\s*/).slice(0, 3) : [];

  // Blur for Beat 3+
  const getBlurStyle = (): React.CSSProperties => {
    if (beat < 3) return {};
    const blur = beat === 3 ? 1.5 : beat === 4 ? 3 : 6;
    const opacity = beat === 3 ? 0.7 : beat === 4 ? 0.5 : 0.3;
    return {
      filter: `blur(${blur}px)`,
      opacity,
      transition: 'filter 600ms ease, opacity 600ms ease',
    };
  };

  // Show interactive GO DEEPER reflection card only on Beat 1
  const showGoDeeperCard = beat === 1 && userMessage && phrases && phrases.length > 0 && onPhraseClick;
  // Show cultural reference GO DEEPER card on Beat 1
  const showGoDeeperReference = beat === 1 && parsed.goDeeper.title;
  // Show A DOOR card only on Beat 2
  const showADoor = beat === 2 && parsed.goDeeper.title;
  // Show sharp question on Beat 5+
  const showSharpQuestion = beat >= 5 && beat2Question;

  // --- Static render ---
  if (!isNew) {
    return (
      <div className="max-w-[680px]">
        <div style={getBlurStyle()}>
          {parsed.anchor && <p style={anchorStyle}>{parsed.anchor}</p>}
          {parsed.keywords && (
            <p style={{ fontSize: '0.7rem', fontFamily: "'Geist Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', color: keywordsColor, marginTop: '0.75rem', marginBottom: '2rem', fontWeight: 500 }}>
              {keywordWords.join(' · ')}
            </p>
          )}
          {parsed.body.map((sentence, i) => <p key={i} style={bodyStyle}>{sentence}</p>)}
          {parsed.invitation && <p style={invitationStyle}>{parsed.invitation}</p>}
        </div>

        {showGoDeeperCard && (
          <GoDeeperCard
            userMessage={userMessage!}
            phrases={phrases!}
            isDark={isDark}
            onPhraseClick={onPhraseClick!}
            isNew={false}
            animDelay={0}
          />
        )}

        {showADoor && (
          <ADoorCard goDeeper={parsed.goDeeper} isDark={isDark} isNew={false} />
        )}

        {showSharpQuestion && (
          <p style={{
            fontSize: '1rem',
            color: isDark ? '#ffffff' : '#0e0e0e',
            marginTop: '1.5rem',
            textAlign: 'center',
            fontFamily: "'DM Sans', 'Inter', sans-serif",
          }}>
            {beat2Question}
          </p>
        )}
      </div>
    );
  }

  // --- Animated render ---
  let delay = 0.6;
  const anchorDelay = delay;
  delay += 1.4;
  const kDelay = delay + 0.4;
  delay = kDelay + 0.4;
  const bodyStart = delay;
  delay += parsed.body.length * 0.2 + 0.2;
  const invDelay = delay + 0.2;
  delay += 0.5;
  const cardDelay = delay;

  return (
    <div className="max-w-[680px]">
      <div style={getBlurStyle()}>
        {parsed.anchor && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: anchorDelay, ease: oracleEasing }}
            style={anchorStyle}
          >
            {parsed.anchor}
          </motion.p>
        )}

        {keywordWords.length > 0 && (
          <div style={{ marginTop: '0.75rem', marginBottom: '2rem', display: 'flex', gap: '0.5em', alignItems: 'center' }}>
            {keywordWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: kDelay + i * 0.1, ease: oracleEasing }}
                style={{ fontSize: '0.7rem', fontFamily: "'Geist Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', color: keywordsColor, fontWeight: 500 }}
              >
                {i > 0 && <span style={{ marginRight: '0.5em' }}>·</span>}
                {word.trim()}
              </motion.span>
            ))}
          </div>
        )}

        {parsed.body.map((sentence, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: bodyStart + i * 0.2, ease: oracleEasing }}
            style={bodyStyle}
          >
            {sentence}
          </motion.p>
        ))}

        {parsed.invitation && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: invDelay, ease: oracleEasing }}
            style={invitationStyle}
          >
            {parsed.invitation}
          </motion.p>
        )}
      </div>

      {showGoDeeperCard && (
        <GoDeeperCard
          userMessage={userMessage!}
          phrases={phrases!}
          isDark={isDark}
          onPhraseClick={onPhraseClick!}
          isNew={true}
          animDelay={cardDelay}
        />
      )}

      {showADoor && (
        <ADoorCard goDeeper={parsed.goDeeper} isDark={isDark} isNew={true} />
      )}

      {showSharpQuestion && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: cardDelay + 0.5, ease: oracleEasing }}
          style={{
            fontSize: '1rem',
            color: isDark ? '#ffffff' : '#0e0e0e',
            marginTop: '1.5rem',
            textAlign: 'center',
            fontFamily: "'DM Sans', 'Inter', sans-serif",
          }}
        >
          {beat2Question}
        </motion.p>
      )}
    </div>
  );
}

// ========== MAIN COMPONENT ==========
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
  // Beat system state
  const [phrases, setPhrases] = useState<string[]>([]);
  const [firstUserMessage, setFirstUserMessage] = useState<string>('');
  const [beat2Question, setBeat2Question] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentConversationId(conversationId || null);
    if (!conversationId) {
      setMessages([]);
      setPhrases([]);
      setFirstUserMessage('');
      setBeat2Question('');
      return;
    }
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (data) {
        // Assign beats based on assistant message index
        let assistantCount = 0;
        const loaded = data.map(m => {
          if (m.role === 'assistant') assistantCount++;
          return {
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.created_at),
            beat: m.role === 'assistant' ? assistantCount : undefined,
          };
        });
        setMessages(loaded);
        // Restore first user message for GO DEEPER card
        const firstUser = data.find(m => m.role === 'user');
        if (firstUser) setFirstUserMessage(firstUser.content);
        // Extract beat 2 question from beat 2 response
        const assistantMsgs = loaded.filter(m => m.role === 'assistant');
        if (assistantMsgs.length >= 2) {
          const parsed = parseStructuredResponse(assistantMsgs[1].content);
          if (parsed.invitation) setBeat2Question(parsed.invitation);
        }
        // Re-extract phrases for existing conversations
        if (firstUser && assistantMsgs.length >= 1) {
          fetchPhrases(firstUser.content);
        }
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

  // Get current beat number (count of assistant messages)
  const getAssistantCount = useCallback(() => {
    return messages.filter(m => m.role === 'assistant').length;
  }, [messages]);

  // Scroll
  useEffect(() => {
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
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

  const fetchPhrases = async (userMsg: string) => {
    try {
      const resp = await fetch(TEMPLE_PHRASES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ userMessage: userMsg }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.phrases && data.phrases.length > 0) {
          setPhrases(data.phrases);
        }
      }
    } catch (err) {
      console.error('Phrase extraction error:', err);
    }
  };

  const handlePhraseClick = async (phrase: string) => {
    if (isWaiting || !currentConversationId || !user) return;

    setIsWaiting(true);

    const beatContext = `The user has chosen to go deeper into "${phrase}". This is the thread they want to pull. Go inside that specific word or phrase only. Not the others. Do not repeat what you already said. Go one level underneath it. End your response with one single honest question about this thread specifically — the question they probably haven't asked themselves yet. Not advice. Not options. One question that requires honesty, not strategy.`;

    try {
      // Remove any existing beat 2 response
      const assistantMsgs = messages.filter(m => m.role === 'assistant');
      if (assistantMsgs.length >= 2) {
        // Remove beat 2+ messages from state (keep only beat 1 + user messages before it)
        const beat1AssistantId = assistantMsgs[0].id;
        const beat1Idx = messages.findIndex(m => m.id === beat1AssistantId);
        setMessages(prev => prev.slice(0, beat1Idx + 1));
      }

      const history = messages
        .filter(m => m.role === 'user' || (m.role === 'assistant' && m.beat === 1))
        .map(m => ({ role: m.role, content: m.content }));

      const resp = await fetch(TEMPLE_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history, beatContext }),
      });

      if (!resp.ok) throw new Error('API error');

      const data = await resp.json();
      const rawContent = data.content || '';
      const cleanedContent = rawContent.replace(/\*([^*]+)\*/g, '$1').replace(/\[\d+\]/g, '');

      const { data: savedAiMsg } = await supabase
        .from('messages')
        .insert({ conversation_id: currentConversationId, role: 'assistant', content: cleanedContent })
        .select()
        .single();

      if (savedAiMsg) {
        const parsed = parseStructuredResponse(cleanedContent);
        if (parsed.invitation) setBeat2Question(parsed.invitation);

        setNewestMessageId(savedAiMsg.id);
        setMessages(prev => [...prev, {
          id: savedAiMsg.id,
          role: 'assistant' as const,
          content: savedAiMsg.content,
          timestamp: new Date(savedAiMsg.created_at),
          beat: 2,
        }]);
      }
    } catch (err) {
      console.error('Beat 2 error:', err);
    }

    setIsWaiting(false);
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
    const currentBeat = getAssistantCount();

    const { data: savedUserMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: activeConversationId, role: 'user', content: userContent })
      .select()
      .single();

    if (savedUserMsg) {
      setMessages(prev => [...prev, { id: savedUserMsg.id, role: 'user', content: savedUserMsg.content, timestamp: new Date(savedUserMsg.created_at) }]);
    }

    // Track first user message for GO DEEPER card
    if (currentBeat === 0) {
      setFirstUserMessage(userContent);
    }

    setInput('');
    setIsWaiting(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userContent });

      // Beat context for beat 3+
      let beatContext: string | undefined;
      if (currentBeat >= 2) {
        beatContext = `This is Beat ${currentBeat + 1}. The user keeps pushing. Grow quieter. Shorter body. Fewer words. You are not withholding. You have already said the thing that matters. You are waiting.`;
      }

      const resp = await fetch(TEMPLE_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history, beatContext }),
      });

      if (!resp.ok) throw new Error('API error');

      const data = await resp.json();
      const rawContent = data.content || '';
      const cleanedContent = rawContent.replace(/\*([^*]+)\*/g, '$1').replace(/\[\d+\]/g, '');

      const newBeat = currentBeat + 1;

      const { data: savedAiMsg } = await supabase
        .from('messages')
        .insert({ conversation_id: activeConversationId!, role: 'assistant', content: cleanedContent })
        .select()
        .single();

      if (savedAiMsg) {
        setNewestMessageId(savedAiMsg.id);
        setMessages(prev => [...prev, {
          id: savedAiMsg.id,
          role: 'assistant' as const,
          content: savedAiMsg.content,
          timestamp: new Date(savedAiMsg.created_at),
          beat: newBeat,
        }]);

        // After Beat 1, fetch phrases for the GO DEEPER card
        if (newBeat === 1) {
          fetchPhrases(userContent);
        }

        // Store Beat 2 question
        if (newBeat === 2) {
          const parsed = parseStructuredResponse(cleanedContent);
          if (parsed.invitation) setBeat2Question(parsed.invitation);
        }
      }
    } catch (err) {
      console.error('Temple chat error:', err);
      const errorId = Date.now().toString();
      setNewestMessageId(errorId);
      setMessages(prev => [...prev, { id: errorId, role: 'assistant', content: ERROR_RESPONSE, timestamp: new Date(), beat: getAssistantCount() + 1 }]);
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
                    beat={message.beat || 1}
                    userMessage={message.beat === 1 ? firstUserMessage : undefined}
                    phrases={message.beat === 1 ? phrases : undefined}
                    onPhraseClick={message.beat === 1 ? handlePhraseClick : undefined}
                    beat2Question={beat2Question}
                  />
                </div>
              )}
            </div>
          ))}

          {isWaiting && (
            <div className="mb-16 max-w-[680px]">
              <TextShimmer
                duration={2.5}
                className="font-['Playfair_Display'] italic text-base [--base-color:rgba(255,255,255,0.25)] [--base-gradient-color:rgba(255,255,255,0.85)]"
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
