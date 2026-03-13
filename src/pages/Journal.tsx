import { useTheme } from '../contexts/ThemeContext';

export default function Journal() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '100%' }}>
      <div
        style={{
          fontFamily: '"DM Sans", Arial, sans-serif',
          fontSize: '2rem',
          fontWeight: 300,
          fontStyle: 'italic',
          textAlign: 'center',
          letterSpacing: '0.02em',
          color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
        }}
      >
        Journal
      </div>
      <div
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: '0.8rem',
          textAlign: 'center',
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          marginTop: '0.875rem',
        }}
      >
        Your entries will appear here.
      </div>
    </div>
  );
}
