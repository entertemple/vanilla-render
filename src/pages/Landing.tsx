import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import WordmarkLight from '@/components/WordmarkLight';
import WordmarkDark from '@/components/WordmarkDark';
import LandingHero from '@/components/landing/LandingHero';
import LandingPricing from '@/components/landing/LandingPricing';

const FONT_HEADING = "'DM Sans', Arial, sans-serif";
const FONT_BODY = "'Geist Mono', monospace";

export default function Landing() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Section refs
  const aboutRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const whatRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);

  const statementInView = useInView(statementRef, { once: true, amount: 0.3 });
  const howInView = useInView(howRef, { once: true, amount: 0.3 });
  const whatInView = useInView(whatRef, { once: true, amount: 0.3 });
  const closingInView = useInView(closingRef, { once: true, amount: 0.3 });

  // Nav scroll glassmorphism
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  // Detect dark mode for footer wordmark
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Glass specular highlight
  const specularRef = useRef<HTMLDivElement>(null);
  const handleGlassMouseMove = (e: React.MouseEvent) => {
    if (!specularRef.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    specularRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.07), transparent 40%)`;
  };
  const handleGlassMouseLeave = () => {
    if (specularRef.current) specularRef.current.style.background = 'transparent';
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* ═══ SVG DISTORTION FILTER ═══ */}
      <svg style={{ display: 'none' }}>
        <filter id="landing-glass-distortion">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves={2} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={77} />
        </filter>
      </svg>

      {/* ═══ LIQUID GLASS OVERLAY ═══ */}
      <div
        className="fixed inset-0 z-[51] pointer-events-none"
        onMouseMove={handleGlassMouseMove}
        onMouseLeave={handleGlassMouseLeave}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(12px)',
            filter: 'url(#landing-glass-distortion) saturate(120%) brightness(1.05)',
          }}
        />
        <div
          className="absolute inset-0 bg-background/70"
        />
        <div
          ref={specularRef}
          className="absolute inset-0"
          style={{
            boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.08)',
          }}
        />
      </div>

      {/* ═══ FIXED NAV ═══ */}
      <nav
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center px-6 md:px-12 h-[80px]"
        style={{ fontFamily: FONT_BODY }}>
        <div
          className={`hidden md:flex items-center gap-0 rounded-[100px] transition-all duration-500 ${
          scrolled ?
          'backdrop-blur-[10px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(34,34,34,0.08)]' :
          'bg-transparent border border-transparent'}`
          }
          style={{ padding: '6px 8px' }}>
          <button
            onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-5 py-2 outline-none focus:outline-none rounded-[100px] hover:bg-muted/50 transition-colors">
            <WordmarkLight className="h-5 dark:hidden" />
            <WordmarkDark className="h-5 hidden dark:block" />
          </button>
          <button
            onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 text-foreground rounded-[100px] hover:bg-muted/50 transition-colors"
            style={{ fontSize: '14px', fontWeight: 400 }}>
            How It Works
          </button>
          <button
            onClick={() => pricingRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 text-foreground rounded-[100px] hover:bg-muted/50 transition-colors"
            style={{ fontSize: '14px', fontWeight: 400 }}>
            Pricing
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-foreground rounded-[100px] border border-border hover:bg-muted/50 transition-colors whitespace-nowrap"
            style={{ fontSize: '14px', fontWeight: 400 }}>
            Get Started
          </button>
        </div>

        {/* Mobile nav */}
        <div
          className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-[100px] p-2 backdrop-blur-[10px] bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(0,0,0,0.6)] border border-border shadow-[0_8px_32px_rgba(34,34,34,0.08)]">
          <button onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="px-3 py-2 rounded-[100px] hover:bg-muted/50 transition-colors">
            <WordmarkLight className="h-4 dark:hidden" />
            <WordmarkDark className="h-4 hidden dark:block" />
          </button>
          <button onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-3 py-2 text-foreground rounded-[100px] hover:bg-muted/50 transition-colors" style={{ fontSize: '12px' }}>How It Works</button>
          <button onClick={() => pricingRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-3 py-2 text-foreground rounded-[100px] hover:bg-muted/50 transition-colors" style={{ fontSize: '12px' }}>Pricing</button>
          <button onClick={() => navigate('/login')} className="px-3 py-2 text-foreground rounded-[100px] border border-border hover:bg-muted/50 transition-colors whitespace-nowrap" style={{ fontSize: '12px' }}>Get Started</button>
        </div>
      </nav>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden relative z-[52]"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}>

        {/* ═══ 1. HERO ═══ */}
        <LandingHero />

        {/* ═══ 2. STATEMENT ═══ */}
        <section className="py-32 md:py-48 px-6 md:px-12 max-w-[900px] mx-auto" ref={statementRef}>
          <motion.p
            className="text-foreground text-center"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 'clamp(24px, 4vw, 42px)',
              fontWeight: 400,
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
              mixBlendMode: 'normal',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={statementInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            Somewhere along the way, thinking got complicated. Tools piled up. Noise crept in. Everyone optimized for more — more output, more answers, more reasons to stay.
          </motion.p>
          <motion.p
            className="text-foreground text-center mt-10"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 'clamp(24px, 4vw, 42px)',
              fontWeight: 400,
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
              mixBlendMode: 'normal',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={statementInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.5 }}
          >
            Temple is the room where you can finally listen to yourself.
          </motion.p>
        </section>

        {/* ═══ 3. HOW IT WORKS ═══ */}
        <section className="py-32 md:py-48 px-6 md:px-12 max-w-[800px] mx-auto text-center" ref={howRef}>
          <div ref={aboutRef}>
            <motion.p
              className="text-muted-foreground uppercase tracking-[0.2em] mb-16"
              style={{ fontFamily: FONT_BODY, fontSize: '0.68rem' }}
              initial={{ opacity: 0 }}
              animate={howInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
            >
              How It Works
            </motion.p>
            {[
              "You bring what you're carrying.",
              'Temple reads what lives underneath it.',
              'Then it leaves you with what matters.',
            ].map((line, i) => (
              <motion.p
                key={i}
                className="text-foreground mb-4"
                style={{
                  fontFamily: FONT_HEADING,
                  fontSize: 'clamp(20px, 3vw, 32px)',
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={howInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </section>

        {/* ═══ 4. WHAT TEMPLE IS ═══ */}
        <section className="py-32 md:py-48 px-6 md:px-12 max-w-[900px] mx-auto" ref={whatRef}>
          <motion.p
            className="text-muted-foreground text-center"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 'clamp(24px, 4vw, 42px)',
              fontWeight: 400,
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={whatInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            Most AI tells you what to do. Temple shows you what you already know but haven't been able to say.
          </motion.p>
          <motion.p
            className="text-muted-foreground text-center mt-10"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 'clamp(20px, 3vw, 32px)',
              fontWeight: 400,
              lineHeight: 1.45,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={whatInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.5 }}
          >
            It doesn't push you further than you want to go. But if you're ready to look closer, it will go there with you.
          </motion.p>
        </section>

        {/* ═══ 5. PRICING ═══ */}
        <div ref={pricingRef}>
          <LandingPricing />
        </div>

        {/* ═══ 6. CLOSING ═══ */}
        <section className="py-32 md:py-48 px-6 flex flex-col items-center justify-center min-h-[60vh]" ref={closingRef}>
          <motion.h1
            className="text-foreground text-center mb-6"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 'clamp(56px, 12vw, 160px)',
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={closingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            It just works.
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-center mb-12 max-w-[480px]"
            style={{
              fontFamily: FONT_BODY,
              fontSize: 'clamp(13px, 1.5vw, 15px)',
              lineHeight: 1.6,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={closingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            The first AI built for the interior life. Always the first place you go.
          </motion.p>

          <motion.button
            onClick={() => navigate('/chat')}
            className="px-12 py-5 rounded-[100px] bg-foreground text-background transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{
              fontFamily: FONT_BODY,
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={closingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Enter Temple
          </motion.button>
        </section>

        {/* ═══ 7. FOOTER — Full-width wordmark ═══ */}
        <footer className="px-8 md:px-16 pt-24 pb-16">
          <div className="w-full">
            {isDark ? (
              <WordmarkDark className="w-full h-auto" />
            ) : (
              <WordmarkLight className="w-full h-auto" />
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
