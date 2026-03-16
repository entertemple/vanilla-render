import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronRight } from 'lucide-react';

const links = [
  { label: 'About', path: '/about' },
  { label: 'Usage Policy', path: '/terms' },
  { label: 'Privacy Policy', path: '/privacy' },
];

export default function LearnMore() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme !== 'light';

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[rgba(255,255,255,0.5)]' : 'text-gray-500';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const hoverBg = isDark ? 'hover:bg-[rgba(255,255,255,0.04)]' : 'hover:bg-[rgba(0,0,0,0.03)]';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-[400px]">
        <h1
          className={`${textColor} mb-8 text-center`}
          style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '1.5rem' }}
        >
          Learn More
        </h1>

        <div className="space-y-1">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[12px] transition-colors ${hoverBg}`}
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <span
                className={`${textColor} text-[14px]`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {link.label}
              </span>
              <ChevronRight className={`w-4 h-4 ${textSecondary}`} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
