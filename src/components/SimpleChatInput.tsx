import { useState, useRef } from 'react';
import { Plus, ArrowUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'motion/react';

interface SimpleChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

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

export default function SimpleChatInput({ value, onChange, onSubmit, placeholder = "Enter temple…" }: SimpleChatInputProps) {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-400' : 'text-gray-500';
  const bgColor = theme === 'light' 
    ? 'bg-[rgba(255,255,255,0.7)]' 
    : 'bg-[rgba(40,40,40,0.7)]';
  const borderColor = theme === 'light' 
    ? 'border-gray-200' 
    : 'border-[rgba(255,255,255,0.15)]';
  const hoverBg = theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-[rgba(255,255,255,0.05)]';
  const buttonBg = theme === 'light' ? 'bg-gray-900' : 'bg-white';
  const buttonText = theme === 'light' ? 'text-white' : 'text-gray-900';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Add voice recording logic here
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  return (
    <div
      className={`
        relative w-full rounded-full ${bgColor} backdrop-blur-[120px]
        border ${borderColor} 
        shadow-[0_20px_60px_rgba(0,0,0,0.25),_0_0_0_1px_rgba(255,255,255,0.05)_inset]
        transition-all duration-300 hover:shadow-[0_24px_70px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.08)_inset]
      `}
    >
      <div className="flex items-center gap-4 px-6 py-4">
        {/* File Attachment Button */}
        <button
          onClick={handleFileSelect}
          className={`
            w-8 h-8 flex items-center justify-center flex-shrink-0
            rounded-full ${hoverBg} transition-all duration-200 hover:scale-105
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
          onChange={(e) => {
            // Handle file upload
            console.log('Files:', e.target.files);
          }}
        />

        {/* Text Input Area */}
        <div className="flex-1 relative min-h-[26px]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className={`
              w-full bg-transparent border-none resize-none
              ${textColor} text-[16px] leading-[1.6] font-['Inter',_sans-serif]
              focus:outline-none focus:ring-0
              placeholder:${textSecondary}
            `}
            style={{
              maxHeight: '180px',
              overflow: 'auto',
            }}
          />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Voice Input Button or Submit Button */}
          {value.trim() ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={onSubmit}
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
              onClick={handleVoiceInput}
              className={`
                w-9 h-9 flex items-center justify-center flex-shrink-0
                rounded-full ${hoverBg} transition-all duration-200 hover:scale-105
                ${isRecording ? 'bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : ''}
              `}
              aria-label="Voice input"
            >
              <WaveformIcon className={`${isRecording ? 'text-red-500' : textColor}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
