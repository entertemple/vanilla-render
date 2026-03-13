import { useRef, useEffect, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import WordmarkLight from '@/components/WordmarkLight';
import WordmarkDark from '@/components/WordmarkDark';
import LandingHero from '@/components/landing/LandingHero';
import ConversationPreview from '@/components/landing/ConversationPreview';
import LandingPricing from '@/components/landing/LandingPricing';
import LandingFooter from '@/components/landing/LandingFooter';

import menuAbout from '@/assets/menu-about.jpg';
import menuPricing from '@/assets/menu-pricing.jpg';
import menuEvents from '@/assets/menu-events.jpg';
import menuSounds from '@/assets/menu-sounds.jpg';
import menuShop from '@/assets/menu-shop.jpg';
import menuInstagram from '@/assets/menu-instagram.jpg';

const FONT_HEADING = "'DM Sans', Arial, sans-serif";
const FONT_BODY = "'Geist Mono', monospace";
const FONT_SERIF = "'DM Serif Display', Georgia, serif";

const MENU_ITEMS = [
  { label: 'About', img: menuAbout, action: 'scroll-about' },
  { label: 'Pricing', img: menuPricing, action: 'scroll-pricing' },
  { label: 'Events', img: menuEvents, action: 'link', href: '#' },
  { label: 'Sounds', img: menuSounds, action: 'link', href: '#' },
  { label: 'Shop', img: menuShop, action: 'link', href: '#' },
  { label: 'Instagram', img: menuInstagram, action: 'link', href: 'https://instagram.com' },
];

export default function Landing() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleMenuItem = (item: typeof MENU_ITEMS[0]) => {
    setMenuOpen(false);
    if (item.action === 'scroll-about') {
      aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (item.action === 'scroll-pricing') {
      pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (item.action === 'link' && item.href) {
      if (item.href.startsWith('http')) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const pillClass = `px-5 py-2.5 rounded-full text-sm transition-colors cursor-pointer border ${
    isDark
      ? 'border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.08)]'
      : 'border-[rgba(0,0,0,0.1)] text-[rgba(0,0,0,0.65)] hover:bg-[rgba(0,0,0,0.04)]'
  }`;

  return (
    <div className="fixed inset-0 z-50 bg-background">

      {/* ═══ FIXED NAV ═══ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 md:px-12 h-[72px] transition-all duration-500 ${
          scrolled
            ? 'backdrop-blur-[16px] bg-background/80 border-b border-border'
            : 'bg-transparent'
        }`}
        style={{ fontFamily: FONT_HEADING }}
      >
        {/* Left: Menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors outline-none"
        >
          {menuOpen ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-foreground">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-foreground">
              <rect x="3" y="4" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="10" y="4" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="3" y="11" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="10" y="11" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
        </button>

        {/* Center: Wordmark */}
        <button
          onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute left-1/2 -translate-x-1/2 outline-none focus:outline-none"
        >
          <WordmarkLight className="h-5 dark:hidden" />
          <WordmarkDark className="h-5 hidden dark:block" />
        </button>

        {/* Right: Enter button */}
        <button
          onClick={() => navigate('/login')}
          className={pillClass}
          style={{ fontSize: '14px', fontWeight: 400, fontFamily: FONT_HEADING }}
        >
          Enter
        </button>
      </nav>

      {/* ═══ MENU POPCARD ═══ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[65]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
              style={{
                background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            />
            {/* Card */}
            <motion.div
              className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Close button */}
              <button
                onClick={() => setMenuOpen(false)}
                className={`absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${
                  isDark ? 'bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)]' : 'bg-[rgba(0,0,0,0.06)] hover:bg-[rgba(0,0,0,0.1)]'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" className="text-foreground">
                  <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              <div
                className={`rounded-3xl p-8 ${
                  isDark
                    ? 'bg-[rgba(30,30,30,0.85)] border border-[rgba(255,255,255,0.08)]'
                    : 'bg-[rgba(255,255,255,0.85)] border border-[rgba(0,0,0,0.06)]'
                }`}
                style={{
                  backdropFilter: 'blur(40px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(150%)',
                  boxShadow: isDark
                    ? '0 24px 80px rgba(0,0,0,0.5)'
                    : '0 24px 80px rgba(0,0,0,0.12)',
                }}
              >
                <div className="grid grid-cols-3 gap-5">
                  {MENU_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleMenuItem(item)}
                      className="flex flex-col items-center gap-2.5 group outline-none"
                    >
                      <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden transition-transform group-hover:scale-[1.03]">
                        <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                      </div>
                      <span
                        className="text-foreground text-sm"
                        style={{ fontFamily: FONT_HEADING, fontWeight: 400 }}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ MOBILE NAV ═══ */}
      <div
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 rounded-full p-2 backdrop-blur-[10px] bg-background/60 border border-border shadow-lg"
        style={{ fontFamily: FONT_HEADING }}
      >
        <button onClick={() => setMenuOpen(true)} className="px-3 py-2 rounded-full hover:bg-muted/50 transition-colors text-foreground" style={{ fontSize: '12px' }}>Menu</button>
        <button onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="px-3 py-2 rounded-full hover:bg-muted/50 transition-colors">
          <WordmarkLight className="h-3.5 dark:hidden" />
          <WordmarkDark className="h-3.5 hidden dark:block" />
        </button>
        <button onClick={() => navigate('/login')} className="px-3 py-2 text-foreground rounded-full border border-border hover:bg-muted/50 transition-colors whitespace-nowrap" style={{ fontSize: '12px' }}>Enter</button>
      </div>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden relative z-[52]"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}>

        {/* ═══ 1. HERO ═══ */}
        <LandingHero />

        {/* ═══ 2. STATEMENT ═══ */}
        <section className="py-32 md:py-48 px-6 md:px-12 max-w-[1100px] mx-auto" ref={statementRef}>
          <motion.p
            className="text-foreground text-center"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 'clamp(24px, 4vw, 42px)',
              fontWeight: 400,
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={statementInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}>
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
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={statementInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.5 }}>
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
              transition={{ duration: 0.6 }}>
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
                transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}>
                {line}
              </motion.p>
            ))}
          </div>
        </section>

        {/* ═══ 3.5 CONVERSATION PREVIEW ═══ */}
        <section className="py-32 md:py-48 px-6 md:px-12">
          <ConversationPreview />
        </section>

        {/* ═══ 4. WHAT TEMPLE IS ═══ */}
        <section className="py-32 md:py-48 px-6 md:px-12 max-w-[900px] mx-auto" ref={whatRef}>
          <motion.p
            className="text-foreground text-center"
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(24px, 4vw, 42px)',
              fontWeight: 400,
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={whatInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}>
            Most AI tells you what to do. Temple shows you what you already know but haven't been able to say.
          </motion.p>
          <motion.p
            className="text-foreground text-center mt-10"
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(20px, 3vw, 32px)',
              fontWeight: 400,
              lineHeight: 1.45,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={whatInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.5 }}>
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
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}>
            It just works
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-center mb-12 max-w-[480px]"
            style={{
              fontFamily: FONT_BODY,
              fontSize: 'clamp(13px, 1.5vw, 15px)',
              lineHeight: 1.6
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={closingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}>
            The first AI built for the interior life. Always the first place you go.
          </motion.p>

          <motion.button
            onClick={() => navigate('/login')}
            className="px-12 py-5 rounded-full bg-foreground text-background transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{
              fontFamily: FONT_BODY,
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.02em'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={closingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}>
            Enter Temple
          </motion.button>
        </section>

        {/* ═══ 7. WORDMARK + FOOTER ═══ */}
        <div className="w-full px-8 md:px-16 pt-32">
          {isDark ? <WordmarkDark className="w-full h-auto" /> : <WordmarkLight className="w-full h-auto" />}
        </div>
        <LandingFooter />
      </div>
    </div>
  );
}
