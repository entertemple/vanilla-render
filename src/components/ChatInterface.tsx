import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

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
  "Your question touches on some fundamental concepts. Here's my take..."
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMockResponse = (): string => {
    return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  };

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

    // Simulate AI thinking time
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(),
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

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div 
        className="backdrop-blur-[64px] backdrop-filter bg-[rgba(81,81,81,0.24)] box-border flex flex-col rounded-[48px] border border-[rgba(255,255,255,0.12)] relative"
        style={{ width: 502, height: 'calc(100% - 64px)' }}
      >
        {/* Header */}
        <div className="px-[42px] pt-8 pb-6 border-b border-[rgba(255,255,255,0.12)]">
          <div className="font-['Geist_Mono',_monospace] font-normal text-white text-[18px] text-left tracking-[-0.36px] uppercase">
            <p className="leading-none whitespace-pre">AI ASSISTANT</p>
          </div>
          <div className="font-['Geist_Mono',_monospace] font-normal text-[rgba(255,255,255,0.6)] text-[14px] text-left tracking-[-0.28px] uppercase mt-1">
            <p className="leading-none whitespace-pre">GPT-4 Model</p>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-[42px] py-6 space-y-4"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="font-['Geist_Mono',_monospace] font-normal text-[rgba(255,255,255,0.5)] text-[11px] text-left tracking-[-0.22px] uppercase mb-1.5">
                {message.role === 'user' ? 'YOU' : 'ASSISTANT'}
              </div>
              <div
                className={`
                  max-w-[80%] px-4 py-3 rounded-[20px]
                  ${message.role === 'user' 
                    ? 'bg-[rgba(255,255,255,0.16)] border border-[rgba(255,255,255,0.12)]' 
                    : 'bg-[rgba(81,81,81,0.32)] border border-[rgba(255,255,255,0.08)]'
                  }
                `}
              >
                <p className="font-['Inter',_sans-serif] text-white text-[14px] leading-[1.5]">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex flex-col items-start">
              <div className="font-['Geist_Mono',_monospace] font-normal text-[rgba(255,255,255,0.5)] text-[11px] text-left tracking-[-0.22px] uppercase mb-1.5">
                ASSISTANT
              </div>
              <div className="bg-[rgba(81,81,81,0.32)] border border-[rgba(255,255,255,0.08)] px-4 py-3 rounded-[20px]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-[42px] py-6 border-t border-[rgba(255,255,255,0.12)]">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-[16px] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.4)] font-['Inter',_sans-serif] text-[14px] resize-none focus:outline-none focus:border-[rgba(255,255,255,0.24)] transition-colors"
              rows={1}
              style={{
                maxHeight: '120px',
                minHeight: '44px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 w-11 h-11 rounded-full bg-[rgba(255,255,255,0.16)] border border-[rgba(255,255,255,0.12)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.24)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-white" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
