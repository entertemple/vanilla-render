import { useTheme } from '../contexts/ThemeContext';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FONT_FAMILY = "'DM Sans', Arial, sans-serif";

const FREE_FEATURES = [
  'Basic reflections',
  'Light & dark themes',
  'Limited daily messages',
];

const PRO_FEATURES = [
  'Unlimited reflections',
  'All typeface pairings',
  'Unlimited messages',
  'Priority processing',
];

export default function Upgrade() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[rgba(255,255,255,0.5)]' : 'text-gray-500';
  const borderColor = isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-[rgba(0,0,0,0.1)]';
  const cardBg = isDark ? 'bg-[rgba(255,255,255,0.05)]' : 'bg-[rgba(0,0,0,0.02)]';
  const proBg = isDark ? 'bg-white' : 'bg-[#0e0e0e]';
  const proText = isDark ? 'text-[#0e0e0e]' : 'text-white';
  const proSecondary = isDark ? 'text-[rgba(14,14,14,0.5)]' : 'text-[rgba(255,255,255,0.5)]';
  const proFeatureText = isDark ? 'text-[#0e0e0e]' : 'text-white';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
      <h1
        className={`${textColor} text-center mb-4`}
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
        Pricing
      </h1>
      <p
        className={`${textSecondary} text-center mb-16 max-w-[400px]`}
        style={{ fontFamily: FONT_FAMILY, fontSize: '15px', lineHeight: '1.6' }}>
        Start free. Upgrade when you're ready.
      </p>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-[800px]">
        {/* Free */}
        <div className={`rounded-[24px] border ${borderColor} ${cardBg} p-8 md:p-10 flex flex-col`}>
          <p
            className={`${textSecondary} uppercase tracking-[0.12em] mb-6`}
            style={{ fontFamily: FONT_FAMILY, fontSize: '11px', fontWeight: 500 }}>
            Free
          </p>
          <p
            className={textColor}
            style={{ fontFamily: FONT_FAMILY, fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 400, lineHeight: 1 }}>
            $0
          </p>
          <p className={`${textSecondary} mb-10 mt-1`} style={{ fontFamily: FONT_FAMILY, fontSize: '13px' }}>
            Forever
          </p>
          <ul className="space-y-3 flex-1 mb-10">
            {FREE_FEATURES.map((f) => (
              <li key={f} className={`${textColor} flex items-start gap-3`} style={{ fontFamily: FONT_FAMILY, fontSize: '14px', lineHeight: '1.5' }}>
                <Check size={14} className={`${textSecondary} mt-1 shrink-0`} strokeWidth={1.5} />
                {f}
              </li>
            ))}
          </ul>
          <button
            className={`w-full py-3.5 rounded-[100px] border ${borderColor} ${textColor} hover:opacity-80 transition-opacity`}
            style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400 }}>
            Current Plan
          </button>
        </div>

        {/* Pro */}
        <div className={`rounded-[24px] ${proBg} p-8 md:p-10 flex flex-col`}>
          <p
            className={proSecondary}
            style={{ fontFamily: FONT_FAMILY, fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Pro
          </p>
          <p
            className={`${proText} mt-6`}
            style={{ fontFamily: FONT_FAMILY, fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 400, lineHeight: 1 }}>
            $20
          </p>
          <p className={`${proSecondary} mb-10 mt-1`} style={{ fontFamily: FONT_FAMILY, fontSize: '13px' }}>
            per month
          </p>
          <ul className="space-y-3 flex-1 mb-10">
            {PRO_FEATURES.map((f) => (
              <li key={f} className={`${proFeatureText} flex items-start gap-3`} style={{ fontFamily: FONT_FAMILY, fontSize: '14px', lineHeight: '1.5' }}>
                <Check size={14} className={`${proSecondary} mt-1 shrink-0`} strokeWidth={1.5} />
                {f}
              </li>
            ))}
          </ul>
          <button
            className={`w-full py-3.5 rounded-[100px] ${isDark ? 'bg-[#0e0e0e] text-white' : 'bg-white text-[#0e0e0e]'} hover:opacity-90 transition-opacity`}
            style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400 }}>
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
