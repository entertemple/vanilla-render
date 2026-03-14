import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import WordmarkLight from '@/components/WordmarkLight';
import WordmarkDark from '@/components/WordmarkDark';

const FONT = "'DM Sans', Arial, sans-serif";
const SERIF = "'DM Serif Display', Georgia, serif";

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: '3rem' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: i <= current ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.15)',
            transition: 'background 300ms',
          }}
        />
      ))}
    </div>
  );
}

function AnimatedItem({ children, delay, className = '' }: { children: React.ReactNode; delay: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 500ms ease-out, transform 500ms ease-out',
      }}
    >
      {children}
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward
  const [name, setName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark');
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    // Check if already onboarded
    supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.onboarding_complete) {
          navigate('/chat', { replace: true });
        }
      });
  }, [user, navigate]);

  const goNext = () => {
    setDirection(1);
    setTransitioning(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setTransitioning(false);
    }, 350);
  };

  const handleNameSubmit = async () => {
    if (!user || !name.trim()) return;
    await supabase
      .from('profiles')
      .update({ display_name: name.trim() })
      .eq('user_id', user.id);
    goNext();
  };

  const handleThemeSubmit = async () => {
    if (!user) return;
    setTheme(selectedTheme);
    await supabase
      .from('profiles')
      .update({ theme_preference: selectedTheme })
      .eq('user_id', user.id);
    goNext();
  };

  const handleFinish = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ onboarding_complete: true })
      .eq('user_id', user.id);
    navigate('/chat', { replace: true });
  };

  const screens = [
    // SCREEN 1 — WELCOME
    <div key="welcome" className="flex flex-col items-center text-center">
      <AnimatedItem delay={0}>
        <WordmarkLight className="h-6 mb-12" />
      </AnimatedItem>
      <AnimatedItem delay={300}>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'rgba(0,0,0,0.88)' }}>
          You've arrived.
        </h1>
      </AnimatedItem>
      <AnimatedItem delay={600}>
        <p style={{ fontFamily: FONT, fontSize: '16px', color: 'rgba(0,0,0,0.45)', marginTop: '0.75rem', lineHeight: 1.6 }}>
          Temple is a space to think clearly,<br />without noise, without judgment.
        </p>
      </AnimatedItem>
      <AnimatedItem delay={900} className="w-full max-w-[400px]">
        <button
          onClick={goNext}
          className="w-full h-[52px] rounded-2xl hover:opacity-90 transition-opacity mt-10"
          style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 500, background: 'rgba(0,0,0,0.88)', color: '#fff' }}
        >
          Begin →
        </button>
      </AnimatedItem>
    </div>,

    // SCREEN 2 — NAME
    <div key="name" className="flex flex-col items-center text-center">
      <WordmarkLight className="h-6 mb-12" />
      <h1 style={{ fontFamily: SERIF, fontSize: '2rem', fontWeight: 400, color: 'rgba(0,0,0,0.88)', marginBottom: '2rem' }}>
        What should we call you?
      </h1>
      <div className="w-full max-w-[400px] rounded-3xl border p-7" style={{ borderColor: 'rgba(0,0,0,0.12)', background: 'transparent' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name..."
          autoFocus
          className="w-full h-[52px] px-5 rounded-2xl border outline-none transition-colors"
          style={{
            fontFamily: FONT,
            fontSize: '15px',
            borderColor: 'rgba(0,0,0,0.12)',
            background: 'rgba(0,0,0,0.03)',
            color: 'rgba(0,0,0,0.88)',
          }}
        />
        <button
          onClick={handleNameSubmit}
          disabled={!name.trim()}
          className="w-full h-[52px] rounded-2xl hover:opacity-90 transition-opacity mt-3"
          style={{
            fontFamily: FONT,
            fontSize: '15px',
            fontWeight: 500,
            background: 'rgba(0,0,0,0.88)',
            color: '#fff',
            opacity: name.trim() ? 1 : 0.4,
            pointerEvents: name.trim() ? 'auto' : 'none',
          }}
        >
          Continue →
        </button>
      </div>
    </div>,

    // SCREEN 3 — THEME
    <div key="theme" className="flex flex-col items-center text-center">
      <WordmarkLight className="h-6 mb-12" />
      <h1 style={{ fontFamily: SERIF, fontSize: '2rem', fontWeight: 400, color: 'rgba(0,0,0,0.88)', marginBottom: '2rem' }}>
        How do you want Temple to feel?
      </h1>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        {(['dark', 'light'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTheme(t)}
            style={{
              width: 140,
              height: 160,
              borderRadius: 16,
              border: selectedTheme === t ? '2px solid rgba(0,0,0,0.88)' : '1px solid rgba(0,0,0,0.12)',
              background: t === 'dark' ? '#0d0d0f' : '#f5f5f3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'border 200ms',
            }}
          >
            {/* Abstract chat lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 48, height: 3, borderRadius: 2, background: t === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
              <div style={{ width: 36, height: 3, borderRadius: 2, background: t === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
              <div style={{ width: 56, height: 3, borderRadius: 2, background: t === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 500, color: t === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
                {t === 'dark' ? 'Dark' : 'Light'}
              </div>
              <div style={{ fontFamily: FONT, fontSize: '11px', color: t === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                {t === 'dark' ? 'Default' : 'Minimal'}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="w-full max-w-[400px]">
        <button
          onClick={handleThemeSubmit}
          className="w-full h-[52px] rounded-2xl hover:opacity-90 transition-opacity"
          style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 500, background: 'rgba(0,0,0,0.88)', color: '#fff' }}
        >
          Continue →
        </button>
      </div>
    </div>,

    // SCREEN 4 — READY
    <div key="ready" className="flex flex-col items-center text-center">
      <AnimatedItem delay={0}>
        <WordmarkLight className="h-6 mb-12" />
      </AnimatedItem>
      <AnimatedItem delay={300}>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'rgba(0,0,0,0.88)' }}>
          Your temple is ready.
        </h1>
      </AnimatedItem>
      <AnimatedItem delay={600}>
        <p style={{ fontFamily: FONT, fontSize: '16px', color: 'rgba(0,0,0,0.45)', marginTop: '0.75rem' }}>
          Everything you think here stays here.
        </p>
      </AnimatedItem>
      <AnimatedItem delay={900} className="w-full max-w-[400px]">
        <button
          onClick={handleFinish}
          className="w-full h-[52px] rounded-2xl hover:opacity-90 transition-opacity mt-10"
          style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 500, background: 'rgba(0,0,0,0.88)', color: '#fff' }}
        >
          Enter Temple
        </button>
      </AnimatedItem>
    </div>,
  ];

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#fff' }}
    >
      <ProgressDots current={step} total={4} />
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          transform: transitioning ? `translateX(${direction * -100}px)` : 'translateX(0)',
          opacity: transitioning ? 0 : 1,
          transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1), opacity 250ms ease-out',
        }}
      >
        {screens[step]}
      </div>
    </div>
  );
}
