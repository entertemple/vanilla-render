import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MOCK_RESPONSES = [
  "Stillness.\nYou're not stuck. You're waiting for permission you already have.\nThe thing you keep circling isn't complicated — it's just yours to decide.\nNothing changes until you let it be simple.\nYou already know.",
  "The weight.\nYou've been carrying this longer than you realize.\nIt's not the decision that's heavy — it's the delay.\nSay it out loud once and notice what shifts.\nSometimes the answer is just the exhale.",
  "Clarity.\nThe noise isn't outside you — it's the version of you still arguing with last week.\nLet that conversation end.\nWhat remains is the only thing that matters.\nStart there.",
  "Tension.\nYou're holding two truths at once and calling it confusion.\nIt's not confusion. It's growth refusing to simplify itself.\nSit with both a little longer.\nThe integration is closer than you think.",
  "Momentum.\nYou've already started — you just haven't named it yet.\nEvery thought you've had about this is evidence of motion.\nStop measuring and start trusting the trajectory.\nIt's working.",
  "Honesty.\nThe version of this you keep presenting isn't the real one.\nUnderneath the logic there's something simpler and harder.\nYou don't need a strategy. You need a sentence.\nSay the true thing.",
];

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

// Parse AI response into three movements
function parseResponse(content: string): { anchor: string; body: string[]; return_line: string } {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) return { anchor: lines[0] || '', body: [], return_line: '' };
  if (lines.length === 2) return { anchor: lines[0], body: [], return_line: lines[1] };
  return {
    anchor: lines[0],
    body: lines.slice(1, -1),
    return_line: lines[lines.length - 1],
  };
}

const customEasing = [0.16, 1, 0.3, 1] as const;

// Animated AI response component
function AssistantMessage({ content, theme, isNew }: { content: string; theme: string; isNew: boolean }) {
  const { anchor, body, return_line } = parseResponse(content);

  const anchorColor = theme === 'light' ? '#000000' : '#ffffff';
  const bodyColor = theme === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.75)';
  const returnColor = theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.45)';

  if (!isNew) {
    // Already seen — render without animation
    return (
      <div className="max-w-[680px]">
        <p style={{ fontSize: '2.5rem', fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, color: anchorColor, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '2rem' }}>
          {anchor}
        </p>
        {body.map((sentence, i) => (
          <p key={i} style={{ fontSize: '1rem', fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 300, color: bodyColor, lineHeight: 1.9, marginBottom: '0.75rem' }}>
            {sentence}
          </p>
        ))}
        {return_line && (
          <p style={{ fontSize: '0.875rem', fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 300, color: returnColor, marginTop: '2rem', lineHeight: 1.6 }}>
            {return_line}
          </p>
        )}
      </div>
    );
  }

  // Animated render
  const anchorDelay = 0.6;
  const bodyStartDelay = anchorDelay + 0.8 + 0.4;
  const returnDelay = bodyStartDelay + body.length * 0.6 + 0.6;

  return (
    <div className="max-w-[680px]">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: anchorDelay, ease: customEasing }}
        style={{ fontSize: '2.5rem', fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, color: anchorColor, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '2rem' }}
      >
        {anchor}
      </motion.p>
      {body.map((sentence, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: bodyStartDelay + i * 0.2, ease: customEasing }}
          style={{ fontSize: '1rem', fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 300, color: bodyColor, lineHeight: 1.9, marginBottom: '0.75rem' }}
        >
          {sentence}
        </motion.p>
      ))}
      {return_line && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: returnDelay, ease: customEasing }}
          style={{ fontSize: '0.875rem', fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 300, color: returnColor, marginTop: '2rem', lineHeight: 1.6 }}
        >
          {return_line}
        </motion.p>
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages when conversation changes
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

  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.6)]';
  const inputBgColor = theme === 'light' ? 'bg-[rgba(255,255,255,0.7)]' : 'bg-[rgba(40,40,40,0.7)]';
  const inputBorderColor = theme === 'light' ? 'border-gray-200' : 'border-[rgba(255,255,255,0.15)]';
  const inputHoverBg = theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-[rgba(255,255,255,0.05)]';
  const buttonBg = theme === 'light' ? 'bg-gray-900' : 'bg-white';
  const buttonText = theme === 'light' ? 'text-white' : 'text-gray-900';
  const userMsgColor = theme === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)';

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

  const handleSend = async () => {
    if (!input.trim() || isWaiting || !user) return;

    let activeConversationId = currentConversationId;

    // Create conversation if none exists
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

    // Save user message
    const { data: savedUserMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: activeConversationId, role: 'user', content: input.trim() })
      .select()
      .single();

    if (savedUserMsg) {
      setMessages(prev => [...prev, { id: savedUserMsg.id, role: 'user', content: savedUserMsg.content, timestamp: new Date(savedUserMsg.created_at) }]);
    }

    setInput('');
    setIsWaiting(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Simulate AI response then save
    setTimeout(async () => {
      const aiContent = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      const { data: savedAiMsg } = await supabase
        .from('messages')
        .insert({ conversation_id: activeConversationId!, role: 'assistant', content: aiContent })
        .select()
        .single();

      if (savedAiMsg) {
        setNewestMessageId(savedAiMsg.id);
        setMessages(prev => [...prev, { id: savedAiMsg.id, role: 'assistant', content: savedAiMsg.content, timestamp: new Date(savedAiMsg.created_at) }]);
      }
      setIsWaiting(false);
    }, 800 + Math.random() * 600);
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
                  className={`${theme === 'light' ? 'text-[#333333]' : 'text-[#e8e8e8]'} text-[16px] leading-[1.6] font-['Inter',_sans-serif] cursor-text whitespace-nowrap`}
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
            className={`w-full bg-transparent border-none resize-none ${textColor} text-[16px] leading-[1.6] font-['Inter',_sans-serif] focus:outline-none focus:ring-0 placeholder:${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}
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
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: theme === 'light' ? 'rgba(0,0,0,0.2) transparent' : 'rgba(255,255,255,0.2) transparent' }}>
        <div className="max-w-[680px] mx-auto px-8 pt-16 pb-8">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === 'user' ? (
                <div className="flex justify-end mb-12">
                  <p style={{ fontSize: '0.9375rem', fontFamily: "'DM Sans', 'Inter', sans-serif", color: userMsgColor, textAlign: 'right', maxWidth: '80%' }}>
                    {message.content}
                  </p>
                </div>
              ) : (
                <div className="mb-16">
                  <AssistantMessage content={message.content} theme={theme} isNew={message.id === newestMessageId} />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 px-6 py-4 max-w-[680px] mx-auto w-full">
        {renderChatInput()}
      </div>
    </div>
  );
}
