import { useState, useRef, useEffect, useCallback } from 'react';
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

// Voice input not supported message duration
const VOICE_UNSUPPORTED_TIMEOUT = 3000;

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
        borderRadius: '15px',
        padding: '1.25rem',
        marginTop: '2rem',
      }}
      className="go-deeper-card"
    >
      <p style={{
        fontSize: '0.6rem',
        fontFamily: "'Geist Mono', monospace",
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: labelColor,
        marginBottom: '1rem',
        fontWeight: 400,
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

// --- TO PONDER Cultural Reference Card (Beat 2) ---
function ADoorCard({
  goDeeper,
  isDark,
  isNew,
  label = 'TO PONDER',
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
        borderRadius: '15px',
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
        {label}
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
    fontSize: '3rem',
    fontFamily: "'DM Sans', Arial, sans-serif",
    fontWeight: 300,
    color: anchorColor,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    marginBottom: '0.75rem',
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    fontFamily: "'DM Sans', Arial, sans-serif",
    fontWeight: 300,
    color: bodyColor,
    lineHeight: 2,
    letterSpacing: '-0.01em',
    marginBottom: '0.75rem',
  };

  // Responsive body font size handled via className below

  const invitationStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    fontFamily: "'DM Sans', Arial, sans-serif",
    fontStyle: 'italic',
    fontWeight: 300,
    color: invitationColor,
    letterSpacing: '-0.02em',
    marginTop: '1.5rem',
    lineHeight: 1.5,
  };

  const keywordWords = parsed.keywords ? parsed.keywords.split(/\s*·\s*/).slice(0, 3) : [];

  // Blur for Beat 3+
  const getBlurStyle = (): React.CSSProperties => {
    if (beat < 2) return {};
    const blur = beat === 2 ? 1.5 : beat === 3 ? 3 : 6;
    const opacity = beat === 2 ? 0.7 : beat === 3 ? 0.5 : 0.3;
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
            <p style={{ fontSize: '0.65rem', fontFamily: "'Geist Mono', monospace", letterSpacing: '0.2em', textTransform: 'uppercase', color: keywordsColor, marginTop: '0.75rem', marginBottom: '2rem', fontWeight: 400 }}>
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

      {showGoDeeperReference && (
          <ADoorCard goDeeper={parsed.goDeeper} isDark={isDark} isNew={false} label="TO PONDER" />
        )}

        {showADoor && (
          <ADoorCard goDeeper={parsed.goDeeper} isDark={isDark} isNew={false} />
        )}

        {showSharpQuestion && (
          <p className="blur-anchor-question" style={{
            color: isDark ? '#ffffff' : '#0e0e0e',
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
            initial={{ opacity: 0, y: 8 }}
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
                style={{ fontSize: '0.65rem', fontFamily: "'Geist Mono', monospace", letterSpacing: '0.2em', textTransform: 'uppercase', color: keywordsColor, fontWeight: 400 }}
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

      {showGoDeeperReference && (
        <ADoorCard goDeeper={parsed.goDeeper} isDark={isDark} isNew={true} label="TO PONDER" />
      )}

      {showADoor && (
        <ADoorCard goDeeper={parsed.goDeeper} isDark={isDark} isNew={true} />
      )}

      {showSharpQuestion && (
        <motion.p
          className="blur-anchor-question"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            color: isDark ? '#ffffff' : '#0e0e0e',
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
  const [newestMessageId, setNewestMessageId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  // Beat system state
  const [phrases, setPhrases] = useState<string[]>([]);
  const [firstUserMessage, setFirstUserMessage] = useState<string>('');
  const [beat2Question, setBeat2Question] = useState<string>('');
  // File upload state
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceUnsupported, setVoiceUnsupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const specularRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  const userBubbleBg = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.55)';
  const userBubbleBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
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

  // Mouse tracking for specular highlight
  const handleGlassMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!specularRef.current || !glassRef.current) return;
    const rect = glassRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    specularRef.current.style.background = `radial-gradient(circle 200px at ${x}px ${y}px, rgba(255,255,255,0.15), transparent)`;
  }, []);

  const handleGlassMouseLeave = useCallback(() => {
    if (specularRef.current) {
      specularRef.current.style.background = 'none';
    }
  }, []);

  // Voice input handler
  const handleVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceUnsupported(true);
      setTimeout(() => setVoiceUnsupported(false), VOICE_UNSUPPORTED_TIMEOUT);
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  // File upload handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, []);

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
    <div className="w-full flex flex-col items-center">
      {/* Attached file pill */}
      <AnimatePresence>
        {attachedFile && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.6rem',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 0,
              marginBottom: '0.5rem',
              fontSize: '0.7rem',
              fontFamily: "'Inter', sans-serif",
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            }}
          >
            {attachedFile.name}
            <button onClick={() => setAttachedFile(null)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', opacity: 0.6 }}>
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Filter */}
      <svg style={{ display: 'none' }}>
        <filter id="glass-distortion">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves={2} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={77} />
        </filter>
      </svg>

      {/* Glass container */}
      <div
        ref={glassRef}
        className="glass-search"
        onMouseMove={handleGlassMouseMove}
        onMouseLeave={handleGlassMouseLeave}
      >
        <div className="glass-filter" />
        <div className="glass-overlay" />
        <div className="glass-specular" ref={specularRef} />
        <div className="glass-content">
          <div className="flex items-center gap-4 px-6 py-4">
            {/* File Attachment */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-full transition-all duration-200 hover:scale-105"
              style={{ color: isDark ? '#ffffff' : '#000000' }}
              aria-label="Attach file"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".txt,.pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />

            {/* Text Input */}
            <div className="flex-1 relative min-h-[26px]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter temple…"
                rows={1}
                className="w-full bg-transparent border-none resize-none text-[16px] leading-[1.6] font-['Inter',_sans-serif] focus:outline-none focus:ring-0"
                style={{
                  maxHeight: '180px',
                  overflow: 'auto',
                  caretColor: isDark ? '#ffffff' : '#000000',
                  color: isDark ? '#ffffff' : '#000000',
                }}
              />
            </div>

            {/* Right controls */}
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
                <button
                  onClick={handleVoiceInput}
                  className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full transition-all duration-200 hover:scale-105"
                  aria-label="Voice input"
                >
                  {isRecording ? (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <WaveformIcon className="text-red-500" />
                    </motion.div>
                  ) : (
                    <WaveformIcon className={isDark ? 'text-white' : 'text-black'} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voice unsupported message */}
      <AnimatePresence>
        {voiceUnsupported && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              fontFamily: "'Inter', sans-serif",
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            }}
          >
            Voice input not supported in this browser
          </motion.p>
        )}
      </AnimatePresence>
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
                      backdropFilter: isDark ? 'blur(12px)' : 'saturate(180%) blur(20px)',
                      WebkitBackdropFilter: isDark ? 'blur(12px)' : 'saturate(180%) blur(20px)',
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
