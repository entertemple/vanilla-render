import { useTheme } from '../contexts/ThemeContext';
import { History } from 'lucide-react';

export default function ThreadHistory() {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.6)]';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <History className={`w-12 h-12 ${textSecondary} mb-4`} strokeWidth={1.5} />
      <h1 className={`text-2xl font-semibold ${textColor} font-['Inter',_sans-serif] mb-2`}>History</h1>
      <p className={`${textSecondary} font-['Inter',_sans-serif] text-sm text-center`}>
        View your conversation history
      </p>
    </div>
  );
}
