import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import LiquidGlass from './LiquidGlass';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { theme } = useTheme();

  const bgColor = theme === 'light' 
    ? 'bg-[rgba(255,255,255,0.95)]' 
    : 'bg-[rgba(40,40,40,0.95)]';
  
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.7)]';
  const borderColor = theme === 'light' 
    ? 'border-gray-200' 
    : 'border-[rgba(255,255,255,0.12)]';
  const hoverBg = theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-[rgba(255,255,255,0.08)]';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`relative ${bgColor} backdrop-blur-[64px] rounded-[32px] border ${borderColor} w-full max-w-[500px] overflow-hidden shadow-2xl`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
              <div className="flex-1 text-center">
                <h2 className={`font-['Geist_Mono',_monospace] text-[18px] tracking-[-0.36px] uppercase ${textColor}`}>
                  Welcome to Temple
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${hoverBg} transition-colors`}
              >
                <X className={`w-4 h-4 ${textColor}`} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Main Message */}
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-[rgba(255,255,255,0.12)] flex items-center justify-center">
                  <div className={`text-[36px]`}>
                    🕉️
                  </div>
                </div>
                <h3 className={`font-['Inter',_sans-serif] text-[16px] font-semibold ${textColor}`}>
                  Your Spiritual Research Companion
                </h3>
                <p className={`font-['Inter',_sans-serif] text-[12px] leading-relaxed ${textSecondary} max-w-md mx-auto`}>
                  Temple is an AI-powered platform designed to help you explore spiritual wisdom, 
                  ancient teachings, and consciousness research with depth and clarity.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-[16px] ${theme === 'light' ? 'bg-gray-50' : 'bg-[rgba(255,255,255,0.05)]'} border ${borderColor}`}>
                  <div className={`text-[20px] mb-1`}>💬</div>
                  <p className={`font-['Inter',_sans-serif] text-[11px] font-medium ${textColor}`}>
                    Deep Conversations
                  </p>
                  <p className={`font-['Inter',_sans-serif] text-[9px] ${textSecondary} mt-1`}>
                    Explore profound topics
                  </p>
                </div>
                <div className={`p-3 rounded-[16px] ${theme === 'light' ? 'bg-gray-50' : 'bg-[rgba(255,255,255,0.05)]'} border ${borderColor}`}>
                  <div className={`text-[20px] mb-1`}>📚</div>
                  <p className={`font-['Inter',_sans-serif] text-[11px] font-medium ${textColor}`}>
                    Curated Library
                  </p>
                  <p className={`font-['Inter',_sans-serif] text-[9px] ${textSecondary} mt-1`}>
                    Access sacred texts
                  </p>
                </div>
                <div className={`p-3 rounded-[16px] ${theme === 'light' ? 'bg-gray-50' : 'bg-[rgba(255,255,255,0.05)]'} border ${borderColor}`}>
                  <div className={`text-[20px] mb-1`}>🔍</div>
                  <p className={`font-['Inter',_sans-serif] text-[11px] font-medium ${textColor}`}>
                    Discover Content
                  </p>
                  <p className={`font-['Inter',_sans-serif] text-[9px] ${textSecondary} mt-1`}>
                    Find new insights
                  </p>
                </div>
                <div className={`p-3 rounded-[16px] ${theme === 'light' ? 'bg-gray-50' : 'bg-[rgba(255,255,255,0.05)]'} border ${borderColor}`}>
                  <div className={`text-[20px] mb-1`}>⚡</div>
                  <p className={`font-['Inter',_sans-serif] text-[11px] font-medium ${textColor}`}>
                    AI-Powered
                  </p>
                  <p className={`font-['Inter',_sans-serif] text-[9px] ${textSecondary} mt-1`}>
                    Advanced understanding
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={onClose}
                className={`w-full py-3 rounded-[16px] bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <span className="font-['Inter',_sans-serif] text-[12px] font-semibold text-white">
                  Begin Your Journey
                </span>
              </button>

              <p className={`text-center font-['Inter',_sans-serif] text-[9px] ${textSecondary}`}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
