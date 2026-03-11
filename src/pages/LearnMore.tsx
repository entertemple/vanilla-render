import { useTheme } from '../contexts/ThemeContext';

export default function LearnMore() {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-[rgba(255,255,255,0.6)]';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <h1 className={`text-2xl font-semibold ${textColor} font-['Inter',_sans-serif] mb-2`}>Learn More</h1>
      <p className={`${textSecondary} font-['Inter',_sans-serif] text-sm text-center`}>
        Discover what Temple can do for you
      </p>
    </div>
  );
}
