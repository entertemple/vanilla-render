import { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical, Download, Share2, Copy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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

export default function ChatDashboard() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.6)]';
  const borderColor = theme === 'light'
    ? 'border-gray-200'
    : 'border-[rgba(255,255,255,0.12)]';
  const hoverBg = theme === 'light'
    ? 'hover:bg-gray-100'
    : 'hover:bg-[rgba(255,255,255,0.08)]';
  const inputBg = theme === 'light'
    ? 'bg-gray-50'
    : 'bg-[rgba(255,255,255,0.08)]';
  const userMsgBg = theme === 'light'
    ? 'bg-blue-500 border-blue-400'
    : 'bg-[rgba(255,255,255,0.16)] border-[rgba(255,255,255,0.12)]';
  const assistantMsgBg = theme === 'light'
    ? 'bg-gray-100 border-gray-200'
    : 'bg-[rgba(81,81,81,0.32)] border-[rgba(255,255,255,0.08)]';
  const userMsgText = 'text-white';
  const assistantMsgText = theme === 'light' ? 'text-gray-900' : 'text-white';
  const bgPrimary = theme === 'light'
    ? 'bg-[rgba(255,255,255,0.92)]'
    : 'bg-[rgba(81,81,81,0.28)]';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const exportConversation = () => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversation.json';
    a.click();
    setMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with menu */}
      <div className={`flex-shrink-0 px-6 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <div className="w-8" />
        <div className="flex-1 text-center">
          <div className={`font-['Geist_Mono',_monospace] font-normal ${textColor} text-[14px] tracking-[-0.28px] uppercase`}>
            AI ASSISTANT
          </div>
          <div className={`font-['Geist_Mono',_monospace] font-normal ${textSecondary} text-[10px] tracking-[-0.2px] uppercase mt-0.5`}>
            GPT-4 Model
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-8 h-8 rounded-[12px] flex items-center justify-center ${hoverBg} transition-colors`}
          >
            <MoreVertical className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
          </button>
          {menuOpen && (
            <div className={`absolute right-0 mt-2 w-48 ${bgPrimary} backdrop-blur-[64px] rounded-[16px] border ${borderColor} shadow-xl overflow-hidden z-50`}>
              <button onClick={exportConversation} className={`w-full flex items-center gap-3 px-4 py-2.5 ${hoverBg} transition-colors`}>
                <Download className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                <span className={`font-['Inter',_sans-serif] ${textColor} text-[12px]`}>Export Chat</span>
              </button>
              <button className={`w-full flex items-center gap-3 px-4 py-2.5 ${hoverBg} transition-colors`}>
                <Share2 className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                <span className={`font-['Inter',_sans-serif] ${textColor} text-[12px]`}>Share Chat</span>
              </button>
              <button className={`w-full flex items-center gap-3 px-4 py-2.5 ${hoverBg} transition-colors`}>
                <Copy className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
                <span className={`font-['Inter',_sans-serif] ${textColor} text-[12px]`}>Copy Link</span>
              </button>
            </div>
          )}
        </div>
      </div>

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
      <div className={`flex-shrink-0 px-6 py-4 border-t ${borderColor}`}>
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={`flex-1 ${inputBg} border ${borderColor} rounded-[14px] px-3 py-2.5 ${textColor} font-['Inter',_sans-serif] text-[13px] resize-none focus:outline-none transition-colors`}
            rows={1}
            style={{ maxHeight: '100px', minHeight: '40px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`shrink-0 w-10 h-10 rounded-full ${inputBg} border ${borderColor} flex items-center justify-center ${hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Send className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
