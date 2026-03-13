import { useTheme } from '../contexts/ThemeContext';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FONT_HEADING = "'DM Sans', Arial, sans-serif";
const FONT_BODY = "'Geist Mono', monospace";

const FREE_FEATURES = [
  'Basic spiritual guidance',
  '10 messages per day',
  'Access to core teachings',
  'Community support',
];

const PRO_FEATURES = [
  'Unlimited messages',
  'Advanced spiritual insights',
  'Priority response times',
  'Access to all teachings',
  'Personalized guidance',
  'Early access to new features',
  'Download conversation history',
  'Custom meditation guides',
];

export default function Upgrade() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[800px] grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FREE */}
        <div
          className="rounded-2xl p-8 md:p-10 flex flex-col"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'hsl(0 0% 98%)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'hsl(0 0% 90%)'}`,
            backdropFilter: isDark ? 'blur(40px)' : 'none',
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
              }}
            >
              FREE
            </p>
            <span
              className="rounded-full px-4 py-1.5"
              style={{
                fontFamily: FONT_BODY,
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              }}
            >
              ACTIVE
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-10">
            <p
              style={{
                fontFamily: FONT_HEADING,
                fontSize: '64px',
                fontWeight: 400,
                lineHeight: 1,
                color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
              }}
            >
              $0
            </p>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: '0.85rem',
                color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              }}
            >
              forever
            </p>
          </div>

          <ul className="space-y-5 flex-1 mb-10">
            {FREE_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-3"
                style={{ fontFamily: FONT_BODY, fontSize: '0.82rem', lineHeight: 1.5 }}
              >
                <Check
                  size={16}
                  className="mt-0.5 shrink-0"
                  strokeWidth={1.5}
                  style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' }}
                />
                <span
                  style={{
                    fontWeight: 600,
                    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
                  }}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <button
            className="w-full py-4 rounded-full transition-opacity hover:opacity-80 uppercase tracking-[0.1em]"
            style={{
              fontFamily: FONT_BODY,
              fontSize: '0.72rem',
              fontWeight: 400,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
              background: 'transparent',
              color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
            }}
          >
            CURRENT PLAN
          </button>
        </div>

        {/* PRO */}
        <div
          className="rounded-2xl p-8 md:p-10 flex flex-col"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'hsl(0 0% 98%)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'hsl(0 0% 88%)'}`,
            backdropFilter: isDark ? 'blur(40px)' : 'none',
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
              }}
            >
              PRO
            </p>
          </div>

          <div className="flex items-baseline gap-2 mb-10">
            <p
              style={{
                fontFamily: FONT_HEADING,
                fontSize: '64px',
                fontWeight: 400,
                lineHeight: 1,
                color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
              }}
            >
              $12
            </p>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: '0.85rem',
                color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              }}
            >
              per month
            </p>
          </div>

          <ul className="space-y-5 flex-1 mb-10">
            {PRO_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-3"
                style={{ fontFamily: FONT_BODY, fontSize: '0.82rem', lineHeight: 1.5 }}
              >
                <Check
                  size={16}
                  className="mt-0.5 shrink-0"
                  strokeWidth={1.5}
                  style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' }}
                />
                <span
                  style={{
                    fontWeight: 600,
                    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
                  }}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 rounded-full transition-opacity hover:opacity-80 uppercase tracking-[0.1em]"
            style={{
              fontFamily: FONT_BODY,
              fontSize: '0.72rem',
              fontWeight: 400,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
              background: 'transparent',
              color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
            }}
          >
            UPGRADE TO PRO
          </button>
        </div>
      </div>
    </div>
  );
}