import { useState, useRef, useEffect } from 'react';
import { Send, Plus, ArrowUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MOCK_RESPONSES = [
  "I'm here to help you with whatever you need. What would you like to explore today?",
  "That's an interesting question. Let me think about it for a moment...",
  "Based on what you're asking, I'd suggest considering multiple perspectives on this topic.",
  "I understand what you're looking for. Here's my perspective on that...",
  "Great question! This is something I've analyzed from various angles.",
  "Let me break this down for you in a clear and concise way.",
  "I appreciate your curiosity. Here's what I can tell you about this...",
  "That's a nuanced topic. From my understanding, there are several key points to consider.",
  "I'm designed to help you think through complex ideas. Let's explore this together.",
  "Your question touches on some fundamental concepts. Here's my take...",
  "Excellent observation! This connects to several important concepts in the field.",
  "I can see why you'd ask that. Let me provide some context that might help.",
  "This is a common question, and there's actually quite a bit to unpack here.",
  "From what I understand about this topic, here's what stands out to me...",
  "That's worth exploring further. There are multiple dimensions to consider."
];

const SUGGESTED_QUESTIONS = [
  "Hey temple...",
  "I've been 'about to start' for three weeks now...",
  "my body said no but I said sure, absolutely, sounds great...",
  "I have a vision board and an overdraft. explain...",
  "I know the answer. I just don't like it...",
  "manifested a parking spot in Manhattan. universe is playing...",
];

// Waveform Icon Component
const WaveformIcon = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="6" width="2" height="8" rx="1" fill="currentColor" />
    <rect x="7" y="4" width="2" height="12" rx="1" fill="currentColor" />
    <rect x="11" y="7" width="2" height="6" rx="1" fill="currentColor" />
    <rect x="15" y="5" width="2" height="10" rx="1" fill="currentColor" />
  </svg>
);

export default function ChatDashboard() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasConversation = messages.length > 0;

  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.6)]';
  const borderColor = theme === 'light'
    ? 'border-gray-200'
    : 'border-[rgba(255,255,255,0.12)]';
  const hoverBg = theme === 'light'
    ? 'hover:bg-gray-100'
    : 'hover:bg-[rgba(255,255,255,0.08)]';
  const userMsgBg = theme === 'light'
    ? 'bg-blue-500 border-blue-400'
    : 'bg-[rgba(255,255,255,0.16)] border-[rgba(255,255,255,0.12)]';
  const assistantMsgBg = theme === 'light'
    ? 'bg-gray-100 border-gray-200'
    : 'bg-[rgba(81,81,81,0.32)] border-[rgba(255,255,255,0.08)]';
  const userMsgText = 'text-white';
  const assistantMsgText = theme === 'light' ? 'text-gray-900' : 'text-white';

  const inputBgColor = theme === 'light'
    ? 'bg-[rgba(255,255,255,0.7)]'
    : 'bg-[rgba(40,40,40,0.7)]';
  const inputBorderColor = theme === 'light'
    ? 'border-gray-200'
    : 'border-[rgba(255,255,255,0.15)]';
  const inputHoverBg = theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-[rgba(255,255,255,0.05)]';
  const buttonBg = theme === 'light' ? 'bg-gray-900' : 'bg-white';
  const buttonText = theme === 'light' ? 'text-white' : 'text-gray-900';
  const placeholderColor = theme === 'light' ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Suggestion carousel timer
  useEffect(() => {
    if (isFocused || input || hasConversation) return;
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % SUGGESTED_QUESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused, input, hasConversation]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const handleSuggestionClick = () => {
    setIsFocused(true);
    textareaRef.current?.focus();
  };

  // Shared chat input bar
  const renderChatInput = () => (
    <div
      className={`
        relative w-full rounded-full ${inputBgColor} backdrop-blur-[120px]
        border ${inputBorderColor}
        shadow-[0_20px_60px_rgba(0,0,0,0.25),_0_0_0_1px_rgba(255,255,255,0.05)_inset]
        transition-all duration-300 hover:shadow-[0_24px_70px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.08)_inset]
      `}
    >
      <div className="flex items-center gap-4 px-6 py-4">
        {/* File Attachment Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-8 h-8 flex items-center justify-center flex-shrink-0
            rounded-full ${inputHoverBg} transition-all duration-200 hover:scale-105
          `}
          aria-label="Attach file"
        >
          <Plus className={`w-5 h-5 ${textColor}`} strokeWidth={2.5} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={(e) => console.log('Files:', e.target.files)}
        />

        {/* Text Input Area with Carousel */}
        <div className="flex-1 relative min-h-[26px]">
          {/* Sliding placeholder carousel - only on welcome state when not focused and no input */}
          {!hasConversation && !isFocused && !input && (
            <div
              className="absolute inset-0 flex items-center overflow-hidden cursor-text"
              onClick={() => {
                setIsFocused(true);
                textareaRef.current?.focus();
              }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentSuggestionIndex}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className={`text-[#e8e8e8] text-[16px] leading-[1.6] font-['Inter',_sans-serif] cursor-text whitespace-nowrap`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestionClick();
                  }}
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
            placeholder=""
            rows={1}
            className={`
              w-full bg-transparent border-none resize-none
              ${textColor} text-[16px] leading-[1.6] font-['Inter',_sans-serif]
              focus:outline-none focus:ring-0
              
            `}
            style={{
              maxHeight: '180px',
              overflow: 'auto',
              caretColor: '#666666',
            }}
          />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {input.trim() ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={handleSend}
              className={`
                w-9 h-9 flex items-center justify-center flex-shrink-0
                rounded-full ${buttonBg} transition-all duration-200
                hover:scale-110 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]
              `}
              aria-label="Send message"
            >
              <ArrowUp className={`w-5 h-5 ${buttonText}`} strokeWidth={2.5} />
            </motion.button>
          ) : (
            <button
              className={`
                w-9 h-9 flex items-center justify-center flex-shrink-0
                rounded-full ${inputHoverBg} transition-all duration-200 hover:scale-105
              `}
              aria-label="Voice input"
            >
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
        {/* Centered content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <h1 className={`font-['Inter',_sans-serif] text-[28px] md:text-[36px] font-light ${textColor} mb-8 text-center`}>
            How can I guide you today?
          </h1>
          <div className="w-full max-w-[640px]">
            {renderChatInput()}
          </div>
        </div>

        {/* Bottom tagline */}
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
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: theme === 'light' ? 'rgba(0,0,0,0.2) transparent' : 'rgba(255,255,255,0.2) transparent'
        }}
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`font-['Geist_Mono',_monospace] font-normal ${textSecondary} text-[10px] tracking-[-0.2px] uppercase mb-1.5`}>
              {message.role === 'user' ? 'YOU' : 'ASSISTANT'}
            </div>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-[16px] ${message.role === 'user' ? `${userMsgBg} border` : `${assistantMsgBg} border`}`}>
              <p className={`font-['Inter',_sans-serif] text-[13px] leading-[1.5] ${message.role === 'user' ? userMsgText : assistantMsgText}`}>
                {message.content}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start">
            <div className={`font-['Geist_Mono',_monospace] font-normal ${textSecondary} text-[10px] tracking-[-0.2px] uppercase mb-1.5`}>
              ASSISTANT
            </div>
            <div className={`${assistantMsgBg} border px-3.5 py-2.5 rounded-[16px]`}>
              <div className="flex space-x-1">
                <div className={`w-2 h-2 ${theme === 'light' ? 'bg-gray-600' : 'bg-white'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                <div className={`w-2 h-2 ${theme === 'light' ? 'bg-gray-600' : 'bg-white'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                <div className={`w-2 h-2 ${theme === 'light' ? 'bg-gray-600' : 'bg-white'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4">
        {renderChatInput()}
      </div>
    </div>
  );
}
