import { useTheme } from '../contexts/ThemeContext';
import { Check } from 'lucide-react';

const FREE_FEATURES = [
  'Every conversation, every beat',
  'Full beat system — GO DEEPER, blur, sharp question',
  'Daily Oracle card',
  'Silence timer',
  'History saved',
];

const MONTHLY_FEATURES = [
  'Unlimited conversations',
  'Full beat system',
  'Daily Oracle card',
  'Silence timer',
  'Full conversation history',
  'Visual anchor journal',
];

const ANNUAL_FEATURES = [
  'Everything in monthly',
  'Full year visual journal — your anchor words across 365 days, each one opens that conversation',
  'Your interior life rendered over time',
];

export default function Upgrade() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex-1 flex flex-col items-center px-6 pt-16 pb-12">
      <p
        className="text-center mb-12 tracking-[0.16em] uppercase"
        style={{
          fontSize: '0.7rem',
          lineHeight: '1.6',
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
        }}
      >
        For when you need to hear yourself think.
      </p>

      <div className="w-full max-w-[680px] grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {/* FREE */}
        <div
          className="rounded-[4px] p-7 flex flex-col"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <p
            className="tracking-[0.14em] uppercase mb-5"
            style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            }}
          >
            Free
          </p>
          <p
            style={{
              fontSize: 'clamp(28px, 3vw, 40px)',
              fontWeight: 400,
              lineHeight: 1,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
            }}
          >
            $0
          </p>
          <p
            className="mt-1.5 mb-8"
            style={{
              fontSize: '0.7rem',
              lineHeight: '1.5',
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
            }}
          >
            7 days. Full experience. No card required.
          </p>

          <ul className="space-y-2.5 flex-1 mb-8">
            {FREE_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2.5"
                style={{
                  fontSize: '0.72rem',
                  lineHeight: '1.5',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                }}
              >
                <Check
                  size={12}
                  className="mt-0.5 shrink-0"
                  strokeWidth={1.5}
                  style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
                />
                {f}
              </li>
            ))}
          </ul>

          <button
            className="w-full py-3 rounded-[4px] transition-opacity hover:opacity-80"
            style={{
              fontSize: '0.72rem',
              fontWeight: 400,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
              background: 'transparent',
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            }}
          >
            Start your trial
          </button>
        </div>

        {/* MONTHLY */}
        <div
          className="rounded-[4px] p-7 flex flex-col"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <p
            className="tracking-[0.14em] uppercase mb-5"
            style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            }}
          >
            Monthly
          </p>
          <p
            style={{
              fontSize: 'clamp(28px, 3vw, 40px)',
              fontWeight: 400,
              lineHeight: 1,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
            }}
          >
            $15
          </p>
          <p
            className="mt-0.5"
            style={{
              fontSize: '0.65rem',
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
            }}
          >
            /month
          </p>
          <p
            className="mt-1.5 mb-8"
            style={{
              fontSize: '0.7rem',
              lineHeight: '1.5',
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
            }}
          >
            Come back whenever something is heavy.
          </p>

          <ul className="space-y-2.5 flex-1 mb-8">
            {MONTHLY_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2.5"
                style={{
                  fontSize: '0.72rem',
                  lineHeight: '1.5',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                }}
              >
                <Check
                  size={12}
                  className="mt-0.5 shrink-0"
                  strokeWidth={1.5}
                  style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
                />
                {f}
              </li>
            ))}
          </ul>

          <button
            className="w-full py-3 rounded-[4px] transition-opacity hover:opacity-90"
            style={{
              fontSize: '0.72rem',
              fontWeight: 400,
              background: isDark ? '#ffffff' : '#0e0e0e',
              color: isDark ? '#0e0e0e' : '#ffffff',
              border: 'none',
            }}
          >
            Enter Temple
          </button>
        </div>

        {/* ANNUAL */}
        <div
          className="rounded-[4px] p-7 flex flex-col relative"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          <span
            className="absolute top-4 right-4 tracking-[0.12em] uppercase"
            style={{
              fontSize: '0.6rem',
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
            }}
          >
            Best Value
          </span>

          <p
            className="tracking-[0.14em] uppercase mb-5"
            style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            }}
          >
            Annual
          </p>
          <p
            style={{
              fontSize: 'clamp(28px, 3vw, 40px)',
              fontWeight: 400,
              lineHeight: 1,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
            }}
          >
            $99
          </p>
          <p
            className="mt-0.5"
            style={{
              fontSize: '0.65rem',
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
            }}
          >
            /year
          </p>
          <p
            className="mt-1 mb-1"
            style={{
              fontSize: '0.65rem',
              color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)',
            }}
          >
            $8.25/month — save $81
          </p>
          <p
            className="mb-8"
            style={{
              fontSize: '0.7rem',
              lineHeight: '1.5',
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
            }}
          >
            A full year of clarity.
          </p>

          <ul className="space-y-2.5 flex-1 mb-8">
            {ANNUAL_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2.5"
                style={{
                  fontSize: '0.72rem',
                  lineHeight: '1.5',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                }}
              >
                <Check
                  size={12}
                  className="mt-0.5 shrink-0"
                  strokeWidth={1.5}
                  style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
                />
                {f}
              </li>
            ))}
          </ul>

          <button
            className="w-full py-3 rounded-[4px] transition-opacity hover:opacity-90"
            style={{
              fontSize: '0.72rem',
              fontWeight: 400,
              background: isDark ? '#ffffff' : '#0e0e0e',
              color: isDark ? '#0e0e0e' : '#ffffff',
              border: 'none',
            }}
          >
            Enter Temple
          </button>
        </div>
      </div>

      <p
        className="text-center"
        style={{
          fontSize: '0.65rem',
          color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
        }}
      >
        Cancel anytime. Your history stays.
      </p>
    </div>
  );
}
