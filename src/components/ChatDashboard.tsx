import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const TEMPLE_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/temple-chat`;

interface TraceLine {
  id: string;
  timestamp: string;
  text: string;
}

function parseAnchorAndKeywords(content: string): { anchor: string; keywords: string[] } {
  const anchorMatch = content.match(/ANCHOR:\s*(.+?)(?=\n\n|\nKEYWORDS:)/s);
  const keywordsMatch = content.match(/KEYWORDS:\s*(.+?)(?=\n\n|\nBODY:)/s);

  const anchor = anchorMatch ? anchorMatch[1].trim().replace(/\[\d+\]/g, '').replace(/\s{2,}/g, ' ').trim() : '';
  const keywords = keywordsMatch
    ? keywordsMatch[1].trim().split(/\s*·\s*/).slice(0, 3).map(k => k.trim().toLowerCase())
    : [];

  if (!anchor) {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    return { anchor: lines[0] || content, keywords };
  }

  return { anchor, keywords };
}

// ========== EMBER WORDS COMPONENT ==========
function EmberAnchor({ text, onComplete }: { text: string; onComplete: () => void }) {
  const words = text.split(/\s+/);
  const totalDuration = words.length * 200 + 800; // stagger + last animation

  useEffect(() => {
    const timer = setTimeout(onComplete, totalDuration);
    return () => clearTimeout(timer);
  }, [totalDuration, onComplete]);

  return (
    <div className="liquid-assembly" style={{
      fontSize: '48px',
      fontFamily: "'DM Serif Display', Georgia, serif",
      fontWeight: 400,
      lineHeight: 1.15,
      textAlign: 'center',
      letterSpacing: '-0.02em',
    }}>
      {words.map((word, i) => (
        <span
          key={i}
          className="ember-word"
          style={{ animationDelay: `${i * 200}ms`, marginRight: '0.3em' }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}

// ========== MAIN COMPONENT ==========
export default function ChatDashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { id: conversationId } = useParams();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);

  // Response surface state
  const [phase, setPhase] = useState<'idle' | 'pause' | 'anchor' | 'keywords' | 'visible' | 'fading'>('idle');
  const [anchorText, setAnchorText] = useState('');
  const [keywordsArr, setKeywordsArr] = useState<string[]>([]);
  const [traceLines, setTraceLines] = useState<TraceLine[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const phaseTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isDark = theme !== 'light';

  // Sync conversationId
  useEffect(() => {
    setCurrentConversationId(conversationId || null);
  }, [conversationId]);

  // Auto-focus input when idle
  useEffect(() => {
    if (phase === 'idle' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  // Cleanup timers
  useEffect(() => {
    return () => phaseTimers.current.forEach(clearTimeout);
  }, []);

  const clearTimers = () => {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
  };

  const addTimer = (fn: () => void, ms: number) => {
    phaseTimers.current.push(setTimeout(fn, ms));
  };

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || isLocked || !user) return;

    setInput('');
    setIsLocked(true);
    setPhase('pause');
    clearTimers();

    // Create conversation if needed
    let activeConvId = currentConversationId;
    if (!activeConvId) {
      const title = text.split(/\s+/).slice(0, 4).join(' ');
      const { data: conv } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title })
        .select()
        .single();
      if (!conv) { setIsLocked(false); setPhase('idle'); return; }
      activeConvId = conv.id;
      setCurrentConversationId(conv.id);
      navigate(`/chat/${conv.id}`, { replace: true });
    }

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: activeConvId,
      role: 'user',
      content: text,
    });

    // 1.8s sacred pause
    addTimer(async () => {
      try {
        const resp = await fetch(TEMPLE_CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: [{ role: 'user', content: text }] }),
        });

        if (!resp.ok) throw new Error('API error');
        const data = await resp.json();
        const rawContent = (data.content || '').replace(/\*([^*]+)\*/g, '$1').replace(/\[\d+\]/g, '');

        // Save assistant message
        await supabase.from('messages').insert({
          conversation_id: activeConvId!,
          role: 'assistant',
          content: rawContent,
        });

        const { anchor, keywords } = parseAnchorAndKeywords(rawContent);
        setAnchorText(anchor);
        setKeywordsArr(keywords);

        // Phase: anchor emerges
        setPhase('anchor');

        // After anchor animation (~words*200 + 800), show keywords
        const anchorDuration = anchor.split(/\s+/).length * 200 + 800;
        addTimer(() => {
          setPhase('keywords');

          // After keywords visible for a moment, add trace
          addTimer(() => {
            setPhase('visible');
            const now = new Date();
            const ts = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
              ' ' + now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            setTraceLines(prev => {
              const next = [...prev, { id: Date.now().toString(), timestamp: ts, text: anchor }];
              return next.slice(-7); // max 7 lines
            });

            // After ~3s visible total, smoke drift fade
            addTimer(() => {
              setPhase('fading');

              // After fade animation (1.2s), back to idle
              addTimer(() => {
                setPhase('idle');
                setAnchorText('');
                setKeywordsArr([]);
                setIsLocked(false);
              }, 1200);
            }, 3000);
          }, 600);
        }, anchorDuration);
      } catch (err) {
        console.error('Temple chat error:', err);
        setAnchorText('Something went quiet.');
        setKeywordsArr(['silence', 'patience', 'return']);
        setPhase('anchor');

        addTimer(() => {
          setPhase('keywords');
          addTimer(() => {
            setPhase('visible');
            addTimer(() => {
              setPhase('fading');
              addTimer(() => {
                setPhase('idle');
                setAnchorText('');
                setKeywordsArr([]);
                setIsLocked(false);
              }, 1200);
            }, 3000);
          }, 600);
        }, 2000);
      }
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const textColor = isDark ? '#ffffff' : '#0e0e0e';
  const dimColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)';
  const traceColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';

  const isResponseVisible = phase === 'anchor' || phase === 'keywords' || phase === 'visible';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* RESPONSE SURFACE — centered in the main area */}
      <div
        className={phase === 'fading' ? 'smoke-drift' : ''}
        style={{
          position: 'absolute',
          top: '20%',
          bottom: '25%',
          left: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          pointerEvents: 'none',
          color: textColor,
        }}
      >
        {/* Sacred pause indicator */}
        {phase === 'pause' && (
          <div style={{
            width: '2px',
            height: '24px',
            background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            borderRadius: '1px',
            animation: 'breathe 2s ease-in-out infinite',
          }} />
        )}

        {/* SECTION 1: Anchor */}
        {isResponseVisible && anchorText && (
          <EmberAnchor text={anchorText} onComplete={() => {}} />
        )}

        {/* SECTION 2: Keywords */}
        {(phase === 'keywords' || phase === 'visible') && keywordsArr.length > 0 && (
          <p className="keywords-reveal" style={{
            fontSize: '20px',
            fontFamily: "'Geist Mono', monospace",
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: dimColor,
            textAlign: 'center',
          }}>
            {keywordsArr.join(' • ')}
          </p>
        )}
      </div>

      {/* BREATHING INPUT — fixed at bottom */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '24px',
        right: '24px',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div
          className={phase === 'idle' && !isLocked ? 'temple-breathing-input' : ''}
          style={{
            width: '100%',
            maxWidth: '680px',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLocked}
            autoComplete="off"
            style={{
              width: '100%',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              borderRadius: '16px',
              padding: '16px 24px',
              fontSize: '16px',
              fontFamily: "'DM Sans', 'Inter', sans-serif",
              color: textColor,
              outline: 'none',
              caretColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              transition: 'border-color 500ms ease, box-shadow 500ms ease, opacity 500ms ease',
              opacity: isLocked ? 0.3 : 1,
            }}
          />
        </div>
      </div>

      {/* TRACE CORNER — bottom-right, always visible */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        maxWidth: '360px',
        textAlign: 'right',
        pointerEvents: 'none',
      }}>
        {traceLines.map((line, i) => (
          <p
            key={line.id}
            className={i === traceLines.length - 1 ? 'trace-reveal' : ''}
            style={{
              fontSize: '13px',
              fontFamily: "'Geist Mono', monospace",
              color: traceColor,
              lineHeight: 1.6,
              opacity: i === traceLines.length - 1 ? undefined : 0.35,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {line.timestamp} · {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
