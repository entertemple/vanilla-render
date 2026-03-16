import { useTheme } from '../contexts/ThemeContext';
import WordmarkLight from '../components/WordmarkLight';
import WordmarkDark from '../components/WordmarkDark';

export default function About() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedColor = isDark ? 'text-[rgba(255,255,255,0.3)]' : 'text-[rgba(0,0,0,0.3)]';

  return (
    <div className="min-h-screen relative flex flex-col items-center">
      <div className="relative z-10 w-full max-w-[580px] px-8 pt-20 pb-20 text-center">
        {/* Wordmark */}
        <div className="flex justify-center mb-16">
          <div className="w-[140px]">
            {isDark ? <WordmarkLight /> : <WordmarkDark />}
          </div>
        </div>

        {/* Tagline */}
        <p
          className={`${textColor} opacity-90 mb-4`}
          style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '1.75rem' }}
        >
          Ancient wisdom. Live answers.
        </p>

        {/* Description */}
        <p
          className={`${textColor} opacity-50 mx-auto mb-12`}
          style={{ fontFamily: "'Geist Mono', monospace", fontSize: '0.85rem', lineHeight: 1.9, maxWidth: 480 }}
        >
          Temple is an AI built for the interior life —
          not to tell you what to do, but to show you
          what you already know.
        </p>

        {/* Divider */}
        <div className="mx-auto mb-12" style={{ width: 32, height: 1, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

        {/* Built by */}
        <p className={`${mutedColor} uppercase`} style={{ fontFamily: "'Geist Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em' }}>
          Built by
        </p>
        <p
          className={`${textColor} opacity-80 mt-1`}
          style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '1.1rem' }}
        >
          Emmanuel Adjei
        </p>
        <p
          className={`${textColor} opacity-35 mt-1`}
          style={{ fontFamily: "'Geist Mono', monospace", fontSize: '0.75rem' }}
        >
          Filmmaker. Creative director. Co-director of Beyoncé's Black Is King.
        </p>
      </div>
    </div>
  );
}
