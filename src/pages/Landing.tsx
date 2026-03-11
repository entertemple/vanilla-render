import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import WordmarkLight from '@/components/WordmarkLight';

// ─── Constants matching Createnix spec exactly ───
const FONT_FAMILY = "'DM Sans', Arial, sans-serif";

// ─── Typing animation hook ───
function useTypingEffect(text: string, speed = 40, startTyping = false) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!startTyping) { setDisplayed(''); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, startTyping]);
  return displayed;
}

// ─── Shadow Text Row (Createnix double-text effect) ───
function ShadowTextRow({ text, inView, delay = 0 }: { text: string; inView: boolean; delay?: number }) {
  return (
    <div className="relative overflow-hidden">
      {/* Grey shadow behind */}
      <h2
        className="text-cnx-grey select-none"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 'clamp(32px, 6vw, 80px)',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: 'normal',
        }}
      >
        {text}
      </h2>
      {/* Dark overlay on top */}
      <motion.h2
        className="absolute inset-0 text-cnx-black"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 'clamp(32px, 6vw, 80px)',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: 'normal',
        }}
        initial={{ y: '100%' }}
        animate={inView ? { y: '0%' } : {}}
        transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {text}
      </motion.h2>
    </div>
  );
}

// ─── Image Frame (24px radius, Createnix spec) ───
function ImageFrame({
  gradient,
  className = '',
  parallaxY,
}: {
  gradient: string;
  className?: string;
  parallaxY?: any;
}) {
  return (
    <motion.div
      className={`rounded-[24px] overflow-hidden ${className}`}
      style={{
        background: gradient,
        y: parallaxY,
        willChange: 'transform',
      }}
    />
  );
}

// ─── iPhone Frame (adapted to Createnix card style: 24px radius) ───
function IPhoneFrame({
  children,
  caption,
  inView,
  delay = 0,
}: {
  children: React.ReactNode;
  caption: string;
  inView: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
    >
      <motion.div
        className="relative w-[280px] sm:w-[320px] md:w-[340px] rounded-[36px] border-[5px] border-cnx-black overflow-hidden"
        style={{
          aspectRatio: '375/812',
          boxShadow: '0 40px 100px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
        whileHover={{ y: -4, transition: { duration: 0.3 } }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[24px] bg-cnx-black rounded-b-xl z-10" />
        {/* Screen glare */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none z-20" />
        <div className="relative w-full h-full overflow-hidden bg-cnx-light-grey">
          {children}
        </div>
      </motion.div>
      <motion.p
        className="mt-5 text-cnx-grey text-center max-w-[300px]"
        style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400, lineHeight: '20px', fontStyle: 'italic' }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      >
        {caption}
      </motion.p>
    </motion.div>
  );
}

// ─── Color Legend Item ───
function ColorItem({
  color,
  word,
  label,
  inView,
  delay,
}: {
  color: string;
  word: string;
  label: string;
  inView: boolean;
  delay: number;
}) {
  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    red: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    green: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  };
  const s = styles[color];
  return (
    <motion.div
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className={`w-3 h-3 rounded-full ${s.dot} mt-1.5 shrink-0`} />
      <div>
        <span
          className={`inline-block px-2 py-0.5 rounded-md ${s.bg} ${s.text} font-semibold mr-2`}
          style={{ fontFamily: FONT_FAMILY, fontSize: '14px' }}
        >
          "{word}"
        </span>
        <span className="text-cnx-dark-grey/60" style={{ fontFamily: FONT_FAMILY, fontSize: '15px' }}>
          — {label}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Service Card (Createnix spec: 24px radius, border) ───
function ServiceCard({
  title,
  description,
  inView,
  delay = 0,
}: {
  title: string;
  description: string;
  inView: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className="rounded-[24px] border border-cnx-border bg-cnx-white p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <h3
        className="text-cnx-black mb-3"
        style={{ fontFamily: FONT_FAMILY, fontSize: '32px', fontWeight: 400, lineHeight: '38.4px' }}
      >
        {title}
      </h3>
      <p
        className="text-cnx-dark-grey/60"
        style={{ fontFamily: FONT_FAMILY, fontSize: '16px', fontWeight: 400, lineHeight: '24px' }}
      >
        {description}
      </p>
    </motion.div>
  );
}

// ─── Parallax grid gradients ───
const GRID_GRADIENTS = [
  'linear-gradient(135deg, #FFE8D6, #FFD4C4)',
  'linear-gradient(135deg, #E8F0FE, #D4E6F1)',
  'linear-gradient(135deg, #F0E6F6, #E6D9F0)',
  'linear-gradient(135deg, #E6F5E6, #D4ECD4)',
  'linear-gradient(135deg, #FFF8E1, #FFE8B2)',
  'linear-gradient(135deg, #FDEAEA, #F5D0D0)',
];

export default function Landing() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll progress for parallax
  const { scrollYProgress } = useScroll({ container: containerRef });

  // Parallax transforms for grid items (alternating up/down)
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y6 = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const parallaxValues = useMemo(() => [y1, y2, y3, y4, y5, y6], [y1, y2, y3, y4, y5, y6]);

  // Section refs for inView
  const aboutRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const synthesisRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const aboutInView = useInView(aboutRef, { once: true, amount: 0.3 });
  const howInView = useInView(howRef, { once: true, amount: 0.3 });
  const card1InView = useInView(card1Ref, { once: true, amount: 0.3 });
  const card2InView = useInView(card2Ref, { once: true, amount: 0.3 });
  const card3InView = useInView(card3Ref, { once: true, amount: 0.3 });
  const synthesisInView = useInView(synthesisRef, { once: true, amount: 0.3 });
  const servicesInView = useInView(servicesRef, { once: true, amount: 0.2 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  const typedInput = useTypingEffect('Should I quit? Pays well but feels empty...', 35, card1InView);

  // Nav scroll state
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  // Grid placement spec: 8 columns, items span different columns/rows
  const gridPlacements = [
    { gridColumn: '1 / 3', gridRow: '1 / 4', minHeight: '400px' },
    { gridColumn: '3 / 5', gridRow: '2 / 5', minHeight: '380px' },
    { gridColumn: '5 / 7', gridRow: '1 / 3', minHeight: '280px' },
    { gridColumn: '7 / 9', gridRow: '2 / 5', minHeight: '400px' },
    { gridColumn: '2 / 4', gridRow: '5 / 8', minHeight: '380px' },
    { gridColumn: '5 / 8', gridRow: '4 / 7', minHeight: '350px' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-cnx-light-grey">
      {/* ═══ FIXED NAV ═══ */}
      <nav
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center px-6 md:px-12 h-[80px]"
        style={{ fontFamily: FONT_FAMILY }}
      >
        {/* Glassmorphic pill container around nav buttons */}
        <div
          className={`hidden md:flex items-center gap-0 rounded-[100px] transition-all duration-500 ${
            scrolled
              ? 'backdrop-blur-[10px] bg-[rgba(247,247,247,0.2)] border border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(34,34,34,0.1)]'
              : 'bg-transparent border border-transparent'
          }`}
          style={{ padding: '6px 8px' }}
        >
          {/* Logo */}
          <button
            onClick={() => navigate('/landing')}
            className="px-5 py-2 outline-none focus:outline-none rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors"
          >
            <WordmarkLight className="h-5" />
          </button>

          {/* How It Works */}
          <button
            onClick={() => howRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors whitespace-nowrap"
            style={{ fontSize: '14px', fontWeight: 400, lineHeight: '20px', fontFamily: FONT_FAMILY }}
          >
            How It Works
          </button>

          {/* Pricing */}
          <button
            onClick={() => navigate('/upgrade')}
            className="px-5 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors"
            style={{ fontSize: '14px', fontWeight: 400, lineHeight: '20px', fontFamily: FONT_FAMILY }}
          >
            Pricing
          </button>

          {/* Get Started */}
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors whitespace-nowrap"
            style={{ fontSize: '14px', fontWeight: 400, lineHeight: '20px', fontFamily: FONT_FAMILY }}
          >
            Get Started
          </button>
        </div>

        {/* Mobile nav - shown on mobile only */}
        <div
          className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 rounded-[100px] p-2 backdrop-blur-[10px] bg-[rgba(247,247,247,0.6)] border border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(34,34,34,0.1)]"
        >
          <button onClick={() => navigate('/landing')} className="px-4 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors" style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>
            <WordmarkLight className="h-4" />
          </button>
          <button onClick={() => howRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-4 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors whitespace-nowrap" style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>How It Works</button>
          <button onClick={() => navigate('/upgrade')} className="px-4 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors" style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Pricing</button>
          <button onClick={() => navigate('/login')} className="px-4 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors whitespace-nowrap" style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Get Started</button>
        </div>
      </nav>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--cnx-border)) transparent' }}
      >
        {/* ═══ HERO (Createnix: 160px title, centered, full viewport) ═══ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-[80px]">
          <motion.div
            className="relative text-center inline-flex items-center justify-center rounded-[100px] px-12 py-6"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              background: 'rgba(247,247,247,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(34,34,34,0.1)',
              filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.06))',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* SVG wordmark with glassmorphic fill */}
            <svg
              viewBox="0 0 607.53 114.53"
              className="w-auto"
              style={{ height: 'clamp(48px, 10vw, 120px)' }}
              aria-label="Temple"
            >
              <defs>
                <linearGradient id="glass-highlight" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.25)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
                </linearGradient>
              </defs>
              {/* Letter paths from TEMPLE_wordmark_black-nobg.svg with glass fill */}
              <path fill="url(#glass-highlight)" d="M323.48,93.21v-43.18c-.25-1.64-.31-3.24-1.52-4.4-1.03-.99-2.74-1.47-4.25-1.47l-19.68.04c-2.55,0-5.2.7-7.22,2.13-1.46,1.03-2.65,2.11-4.03,3.26v43.61s-27.9,0-27.9,0v-43.56c-.26-1.52-.37-2.97-1.45-4.03-.97-.95-2.61-1.45-4.05-1.45l-19.69.03c-2.61,0-5.31.66-7.42,2.11-1.41.97-2.51,2.08-3.91,3.24v43.66s-28.01,0-28.01,0V22.05s23.46,0,23.46,0l2.15,7.83c4.51-3.63,8.05-6.24,13.83-7.18,2.59-.3,5.06-.63,7.72-.63l23.48.03c3.53,0,6.84.74,10.06,1.93,3.59,1.32,6.49,3.67,8.54,6.81,4.54-3.94,8.52-7.09,14.52-8.08,2.66-.33,5.21-.69,7.94-.69l23.71.03c3.6,0,6.97.77,10.23,2,8.67,3.28,11.03,11.72,11.38,20.27v48.83s-27.88,0-27.88,0Z"/>
              <path fill="url(#glass-highlight)" d="M460.18,44.69v25.74c0,3.86-.6,7.47-1.88,11-1.67,4.62-5,8.07-9.62,9.78-3.27,1.21-6.65,1.95-10.26,1.96l-28.5.04c-3.35-.17-6.43-.43-9.64-1.19-3.35-.96-6.14-2.7-9.04-4.73v27.25s-28.02,0-28.02,0V22.06s23.46-.02,23.46-.02l2.16,7.83c4.36-3.54,8.22-6.34,13.83-7.14,2.59-.37,5.06-.66,7.73-.66l28.02.02c3.55,0,6.87.73,10.09,1.89,4.62,1.67,8.01,5.07,9.71,9.67,1.3,3.5,1.95,7.07,1.95,11.04ZM426.09,71.84c1.75,0,3.52-.35,4.69-1.43,1.07-1,1.5-2.77,1.5-4.29v-17c0-1.5-.43-3.3-1.5-4.28-1.31-1.21-3.25-1.44-5.05-1.44h-21.82c-3.05.01-6.13.46-8.63,2.11-1.46.96-2.59,2.15-4.03,3.31v17.53c1.35,1.2,2.62,2.49,4.18,3.45,2.59,1.59,5.63,2.05,8.72,2.05h21.94Z"/>
              <path fill="url(#glass-highlight)" d="M154.06,72.55c2.52-.8,2.47-4.22,2.5-6.42h26.8s-.03,7.44-.03,7.44c-.01,3.02-.53,5.87-1.45,8.7-1.51,4.35-4.61,7.69-8.99,9.27-2.7.97-5.45,1.65-8.46,1.65h-55.1c-3.57-.01-6.86-.79-10.08-1.96-4.35-1.59-7.64-4.77-9.36-9.05-1.38-3.42-2.15-6.99-2.15-10.79v-27.51c0-3.8.77-7.37,2.15-10.79,1.7-4.22,4.91-7.36,9.18-8.98,3.26-1.23,6.62-2.02,10.25-2.02h52.22c3.58,0,6.88.75,10.1,1.9,4.66,1.67,8,5.13,9.75,9.72,1.25,3.5,1.91,7.06,1.92,10.87l.04,17h-67.75c.08,2.94-.66,8.29,1.74,10.15,1.34,1.03,3.15,1.33,4.91,1.33l28.27.02c1.25,0,2.4-.17,3.54-.53ZM156.53,47.92c.08-3.19.1-7.2-3.19-8.09-1.26-.34-2.6-.53-4-.53h-26.59c-1.4,0-2.74.2-3.99.55-3.4.94-3.29,5.34-3.09,8.08h40.86Z"/>
              <path fill="url(#glass-highlight)" d="M578.05,72.61c2.7-.77,2.64-4.17,2.67-6.48h26.8s-.03,7.44-.03,7.44c-.01,3.02-.53,5.87-1.45,8.7-1.51,4.35-4.61,7.69-8.99,9.27-2.7.97-5.45,1.65-8.46,1.65h-55.1c-3.57-.01-6.86-.79-10.08-1.96-4.35-1.59-7.64-4.77-9.36-9.05-1.38-3.42-2.15-6.99-2.15-10.79v-27.51c0-3.8.77-7.37,2.15-10.79,1.7-4.22,4.91-7.36,9.18-8.98,3.26-1.23,6.62-2.02,10.25-2.02h52.22c3.58,0,6.88.75,10.1,1.9,4.66,1.67,8,5.13,9.75,9.72,1.25,3.5,1.91,7.06,1.92,10.87l.04,17h-67.75c.08,2.94-.66,8.29,1.74,10.15,1.34,1.03,3.15,1.33,4.91,1.33l28.27.02c1.19,0,2.28-.16,3.36-.47ZM580.69,47.92c.08-3.19.1-7.2-3.19-8.09-1.26-.34-2.6-.53-4-.53h-26.59c-1.4,0-2.74.2-3.99.55-3.4.94-3.29,5.34-3.09,8.08h40.86Z"/>
              <path fill="url(#glass-highlight)" d="M79.72,71.88v21.32s-42.61-.03-42.61-.03c-3.06,0-5.87-.67-8.61-1.68-7.7-2.83-10.09-10.1-10.38-17.74v-30.64s-18.11,0-18.11,0v-21.08s18.11-.01,18.11-.01l5.32-15.81h22.57s.01,15.81.01,15.81h33.71s-.02,21.09-.02,21.09h-33.71s.02,23.84.02,23.84c0,1.43.53,2.69,1.31,3.78,1.29.73,2.6,1.12,4.16,1.12h28.23Z"/>
              <rect fill="url(#glass-highlight)" x="471.74" y="0" width="28.37" height="93.2"/>
            </svg>
          </motion.div>
          </motion.div>

          <motion.p
            className="text-cnx-black mt-6 text-center"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 'clamp(16px, 2vw, 20px)',
              fontWeight: 400,
              lineHeight: '28px',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Built for clarity.
          </motion.p>

          {/* Scroll indicator (Createnix: circle with arrow, 100% radius) */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <div className="w-[56px] h-[56px] rounded-full border border-cnx-border flex items-center justify-center bg-cnx-white">
              <ArrowDown size={20} className="text-cnx-black" />
            </div>
            <span
              className="text-cnx-grey"
              style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400 }}
            >
              Scroll Down
            </span>
          </motion.div>
        </section>

        {/* ═══ HERO GRID (Createnix: 8 cols, 16px gap, parallax image frames) ═══ */}
        <section className="px-4 md:px-12 pb-32 max-w-[1600px] mx-auto">
          <div
            className="hidden md:grid"
            style={{
              gridTemplateColumns: 'repeat(8, 1fr)',
              gridTemplateRows: 'repeat(8, auto)',
              rowGap: '16px',
              columnGap: '16px',
              position: 'relative',
            }}
          >
            {GRID_GRADIENTS.map((gradient, i) => (
              <motion.div
                key={i}
                className="rounded-[24px] w-full"
                style={{
                  gridColumn: gridPlacements[i].gridColumn,
                  gridRow: gridPlacements[i].gridRow,
                  minHeight: gridPlacements[i].minHeight,
                  background: gradient,
                  y: parallaxValues[i],
                  willChange: 'transform',
                }}
              />
            ))}
          </div>

          {/* Mobile: simple 2-column grid */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {GRID_GRADIENTS.map((gradient, i) => (
              <div
                key={i}
                className="rounded-[24px]"
                style={{ background: gradient, minHeight: '200px' }}
              />
            ))}
          </div>
        </section>

        {/* ═══ ABOUT / SHADOW TEXT (Createnix: duplicate text reveal) ═══ */}
        <section className="px-6 md:px-12 py-32 max-w-[1200px] mx-auto">
          <div ref={aboutRef} className="mb-16">
            <ShadowTextRow text="We've built Temple for" inView={aboutInView} delay={0} />
            <ShadowTextRow text="people who believe" inView={aboutInView} delay={0.1} />
            <ShadowTextRow text="clear thinking should" inView={aboutInView} delay={0.2} />
            <ShadowTextRow text="just work." inView={aboutInView} delay={0.3} />
          </div>

          {/* Stats row (Createnix-style) */}
          <div className="flex flex-col md:flex-row gap-16 md:gap-32 items-start">
            <div className="flex items-baseline gap-4">
              <span
                className="text-cnx-grey"
                style={{ fontFamily: FONT_FAMILY, fontSize: 'clamp(64px, 8vw, 128px)', fontWeight: 400, lineHeight: 1 }}
              >
                0
              </span>
              <motion.p
                className="text-cnx-black"
                style={{ fontFamily: FONT_FAMILY, fontSize: '16px', fontWeight: 400, lineHeight: '24px' }}
                initial={{ opacity: 0 }}
                animate={aboutInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Data retained
              </motion.p>
            </div>

            <motion.a
              href="/login"
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-[100px] border border-cnx-border bg-cnx-white text-cnx-black hover:bg-cnx-light-grey transition-colors"
              style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400, lineHeight: '20px' }}
              initial={{ opacity: 0 }}
              animate={aboutInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Try Temple
              <ArrowDown size={14} className="rotate-[-90deg]" />
            </motion.a>

            <div className="flex items-baseline gap-4">
              <span
                className="text-cnx-grey"
                style={{ fontFamily: FONT_FAMILY, fontSize: 'clamp(64px, 8vw, 128px)', fontWeight: 400, lineHeight: 1 }}
              >
                ∞
              </span>
              <motion.p
                className="text-cnx-black"
                style={{ fontFamily: FONT_FAMILY, fontSize: '16px', fontWeight: 400, lineHeight: '24px' }}
                initial={{ opacity: 0 }}
                animate={aboutInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Clarity moments
              </motion.p>
            </div>
          </div>
        </section>

        {/* ═══ INTRO TEXT (Createnix: p.text-size-medium.text-align-center) ═══ */}
        <section className="px-6 py-32 max-w-[800px] mx-auto text-center">
          <motion.p
            className="text-cnx-black"
            style={{ fontFamily: FONT_FAMILY, fontSize: '20px', fontWeight: 400, lineHeight: '28px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            We've been here before. You know what you want to say, but can't see what you're actually saying.
            Somewhere along the way, AI got complicated—endless chats, feature bloat, engagement traps.
            We think it's time to get back to basics.
          </motion.p>
          <motion.p
            className="text-cnx-black mt-8"
            style={{ fontFamily: FONT_FAMILY, fontSize: '20px', fontWeight: 400, lineHeight: '28px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Founded by filmmaker and creative director Emmanuel Adjei, we've built Temple for people
            who believe clear thinking should just work. No data training. Just your words, made visible.
          </motion.p>
        </section>

        {/* ═══ CARD 1 — Input ═══ */}
        <section className="py-32 px-6 flex flex-col items-center">
          <div ref={card1Ref} className="max-w-[1200px] w-full flex flex-col items-center">
            <IPhoneFrame caption="Paste your text—decision, message, situation" inView={card1InView}>
              <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #FFF5EE 0%, #FFE8D6 100%)' }}>
                <div className="pt-12 px-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-8" style={{ fontFamily: FONT_FAMILY, fontSize: '10px', color: 'hsl(var(--cnx-grey))' }}>
                    <span>9:41</span>
                    <span className="flex gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
                    </span>
                  </div>
                  <p style={{ fontFamily: FONT_FAMILY, fontSize: '18px', fontWeight: 600, color: 'hsl(var(--cnx-black))' }} className="mb-1">Temple</p>
                  <p style={{ fontFamily: FONT_FAMILY, fontSize: '12px', color: 'hsl(var(--cnx-grey))' }} className="mb-6">What's weighing on you?</p>
                  <div className="flex-1" />
                  <div className="bg-cnx-white/70 backdrop-blur-sm rounded-[24px] border border-cnx-border px-4 py-3 mb-6 shadow-sm">
                    <p style={{ fontFamily: FONT_FAMILY, fontSize: '13px', color: 'hsl(var(--cnx-black))', lineHeight: '1.6' }}>
                      {typedInput}
                      {typedInput.length < 44 && card1InView && (
                        <motion.span
                          className="inline-block w-[2px] h-[14px] bg-cnx-black/40 ml-0.5 align-text-bottom"
                          animate={{ opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                        />
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center pb-3">
                  <div className="w-[100px] h-[4px] rounded-full bg-cnx-black/20" />
                </div>
              </div>
            </IPhoneFrame>
          </div>
        </section>

        {/* ═══ HOW TEMPLE WORKS (Createnix service-card style) ═══ */}
        <section className="py-32 px-6 md:px-12 max-w-[1200px] mx-auto">
          <div ref={howRef}>
            <motion.div className="text-center mb-20">
              <motion.p
                className="text-cnx-grey uppercase tracking-[0.15em] mb-4"
                style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400, lineHeight: '20px' }}
                initial={{ opacity: 0 }}
                animate={howInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5 }}
              >
                How It Works
              </motion.p>
              <motion.h2
                className="text-cnx-black"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 'clamp(40px, 8vw, 128px)',
                  fontWeight: 400,
                  lineHeight: 1.2,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={howInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                The Colors
              </motion.h2>
            </motion.div>

            <motion.p
              className="text-cnx-black text-center max-w-[640px] mx-auto mb-16"
              style={{ fontFamily: FONT_FAMILY, fontSize: '20px', fontWeight: 400, lineHeight: '28px' }}
              initial={{ opacity: 0 }}
              animate={howInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Clarity doesn't need complexity. Temple reads it and highlights what matters.
              Every input becomes a mirror. Temple surfaces:
            </motion.p>

            {/* Color items in service-card style grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { color: 'red', word: 'pays well', label: 'Unexamined assumption', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
                { color: 'yellow', word: 'feels empty', label: 'Internal tension', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' },
                { color: 'green', word: 'quit', label: 'Truth you\'re circling', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
                { color: 'blue', word: 'whole text', label: 'Weight you\'re carrying', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
              ].map((item, i) => (
                <motion.div
                  key={item.color}
                  className={`rounded-[24px] border ${item.border} ${item.bg} p-8`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={howInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${item.dot}`} />
                    <span
                      className="text-cnx-black font-semibold uppercase tracking-wider"
                      style={{ fontFamily: FONT_FAMILY, fontSize: '14px' }}
                    >
                      {item.color}
                    </span>
                  </div>
                  <p style={{ fontFamily: FONT_FAMILY, fontSize: '24px', fontWeight: 400, lineHeight: '33.6px' }} className="text-cnx-black mb-2">
                    "{item.word}"
                  </p>
                  <p style={{ fontFamily: FONT_FAMILY, fontSize: '16px', fontWeight: 400, lineHeight: '24px' }} className="text-cnx-dark-grey/60">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CARD 2 — Colors Active ═══ */}
        <section className="py-32 px-6 flex flex-col items-center">
          <div ref={card2Ref} className="max-w-[1200px] w-full flex flex-col items-center">
            <IPhoneFrame caption="Each color opens its own path" inView={card2InView}>
              <div className="w-full h-full flex flex-col bg-cnx-light-grey">
                <div className="pt-12 px-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-5" style={{ fontFamily: FONT_FAMILY, fontSize: '10px', color: 'hsl(var(--cnx-grey))' }}>
                    <span>9:41</span>
                    <span>Temple</span>
                    <span />
                  </div>
                  <div className="bg-cnx-black text-cnx-white px-3.5 py-2.5 rounded-[24px] rounded-br-md text-[12px] leading-[1.7] mb-3" style={{ fontFamily: FONT_FAMILY }}>
                    Should I <span className="bg-green-500/30 px-0.5 rounded">quit</span> my job? It{' '}
                    <span className="bg-red-500/30 px-0.5 rounded">pays well</span> but{' '}
                    <span className="bg-yellow-500/30 px-0.5 rounded">feels empty</span>. Not sure if I'm ready.
                    <div className="mt-1 h-[2px] bg-blue-400/60 rounded-full" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {['Assumption', 'Tension', 'Truth', 'Weight'].map((label, i) => {
                      const colors = ['bg-red-100 text-red-700', 'bg-yellow-100 text-yellow-700', 'bg-green-100 text-green-700', 'bg-blue-100 text-blue-700'];
                      return (
                        <span key={label} className={`${colors[i]} px-2 py-0.5 rounded-full font-medium`} style={{ fontFamily: FONT_FAMILY, fontSize: '9px' }}>
                          {label}
                        </span>
                      );
                    })}
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-[24px] px-3 py-2.5 mb-3">
                    <p className="text-red-500 font-semibold uppercase tracking-wider mb-1" style={{ fontFamily: FONT_FAMILY, fontSize: '9px' }}>Assumption</p>
                    <p className="text-red-800" style={{ fontFamily: FONT_FAMILY, fontSize: '12px', lineHeight: '1.6' }}>"pays well" — Money = security. Is that true for you?</p>
                  </div>
                  <div className="flex-1" />
                  <div className="flex justify-center pb-3">
                    <div className="w-[100px] h-[4px] rounded-full bg-cnx-black/20" />
                  </div>
                </div>
              </div>
            </IPhoneFrame>
          </div>
        </section>

        {/* ═══ SYNTHESIS TEXT ═══ */}
        <section className="py-32 px-6 max-w-[800px] mx-auto">
          <div ref={synthesisRef}>
            <motion.p
              className="text-cnx-black text-center"
              style={{ fontFamily: FONT_FAMILY, fontSize: '20px', fontWeight: 400, lineHeight: '28px' }}
              initial={{ opacity: 0, y: 16 }}
              animate={synthesisInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              Each color opens its own path. Weave it together and hit "Synthesis" to merge all paths into one clear statement:
            </motion.p>
            <motion.blockquote
              className="mt-10 text-cnx-black border-l-4 border-cnx-black pl-8"
              style={{ fontFamily: FONT_FAMILY, fontSize: '24px', fontWeight: 400, lineHeight: '33.6px', fontStyle: 'italic' }}
              initial={{ opacity: 0, x: -20 }}
              animate={synthesisInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              "You're ready to quit because it feels empty, even though the paychecks scare you into staying. Change matters more than stability right now."
            </motion.blockquote>
          </div>
        </section>

        {/* ═══ CARD 3 — Synthesis Complete ═══ */}
        <section className="py-32 px-6 flex flex-col items-center">
          <div ref={card3Ref} className="max-w-[1200px] w-full flex flex-col items-center">
            <IPhoneFrame caption="Your clarity, copy-paste ready" inView={card3InView}>
              <div className="w-full h-full flex flex-col bg-cnx-light-grey">
                <div className="pt-12 px-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-5" style={{ fontFamily: FONT_FAMILY, fontSize: '10px', color: 'hsl(var(--cnx-grey))' }}>
                    <span>9:41</span>
                    <span>Synthesis</span>
                    <span />
                  </div>
                  <div className="bg-cnx-white rounded-[24px] border border-cnx-border shadow-sm px-4 py-4 mb-4">
                    <p className="text-cnx-grey uppercase tracking-wider font-semibold mb-2" style={{ fontFamily: FONT_FAMILY, fontSize: '9px' }}>Your Clarity</p>
                    <p className="text-cnx-black" style={{ fontFamily: FONT_FAMILY, fontSize: '12px', lineHeight: '1.8', fontStyle: 'italic' }}>
                      "You're ready to quit because it feels empty, even though the paychecks scare you into staying. Change matters more than stability right now."
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-cnx-black text-cnx-white rounded-[24px] py-2.5 text-center" style={{ fontFamily: FONT_FAMILY, fontSize: '11px', fontWeight: 500 }}>Copy</div>
                    <div className="flex-1 bg-cnx-white border border-cnx-border text-cnx-black rounded-[24px] py-2.5 text-center" style={{ fontFamily: FONT_FAMILY, fontSize: '11px', fontWeight: 500 }}>Share</div>
                    <div className="flex-1 bg-cnx-white border border-cnx-border text-cnx-grey rounded-[24px] py-2.5 text-center" style={{ fontFamily: FONT_FAMILY, fontSize: '11px', fontWeight: 500 }}>Exit</div>
                  </div>
                  <div className="flex-1" />
                  <div className="flex justify-center pb-3">
                    <div className="w-[100px] h-[4px] rounded-full bg-cnx-black/20" />
                  </div>
                </div>
              </div>
            </IPhoneFrame>
          </div>
        </section>

        {/* ═══ SERVICES / FEATURES (Createnix service-card: 24px radius, border) ═══ */}
        <section className="py-32 px-6 md:px-12 max-w-[1200px] mx-auto">
          <div ref={servicesRef}>
            <div className="text-center mb-20">
              <p
                className="text-cnx-grey uppercase tracking-[0.15em] mb-4"
                style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400 }}
              >
                Features
              </p>
              <h2
                className="text-cnx-black"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 'clamp(40px, 8vw, 128px)',
                  fontWeight: 400,
                  lineHeight: 1.2,
                }}
              >
                How It Feels
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ServiceCard
                title="A Canvas, Not a Chatbot"
                description="Temple has a single job: show you your own thinking. No lengthy threads. No endless suggestions."
                inView={servicesInView}
                delay={0}
              />
              <ServiceCard
                title="Paste & See"
                description="Paste your words. See the colors. Pick your path. Weave your clarity. Exit when you're done."
                inView={servicesInView}
                delay={0.1}
              />
              <ServiceCard
                title="Zero Retention"
                description="Your words are yours. Nothing is stored, trained on, or shared. Ever."
                inView={servicesInView}
                delay={0.2}
              />
              <ServiceCard
                title="The Backend"
                description="Temple runs on Perplexity because clear thinking deserves fast infrastructure."
                inView={servicesInView}
                delay={0.3}
              />
              <ServiceCard
                title="Modern by Design"
                description="AI hasn't changed much, but how we think has. Precise analysis, instant visuals, zero retention."
                inView={servicesInView}
                delay={0.4}
              />
              <ServiceCard
                title="It Just Works"
                description="Every interaction earns its place by getting out of your way. Nothing extra."
                inView={servicesInView}
                delay={0.5}
              />
            </div>
          </div>
        </section>

        {/* ═══ CTA (Createnix shadow text + button) ═══ */}
        <section className="py-32 px-6 md:px-12 max-w-[1200px] mx-auto">
          <div ref={ctaRef}>
            <div className="text-center mb-16">
              <p
                className="text-cnx-grey uppercase tracking-[0.15em] mb-4"
                style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400 }}
              >
                Let's Begin
              </p>
            </div>

            <div className="mb-16">
              <ShadowTextRow text="Ready to see" inView={ctaInView} delay={0} />
              <ShadowTextRow text="your own" inView={ctaInView} delay={0.1} />
              <ShadowTextRow text="thinking?" inView={ctaInView} delay={0.2} />
            </div>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button
                onClick={() => navigate('/chat')}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-[100px] text-cnx-black transition-all hover:shadow-lg hover:scale-[1.02]"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  background: 'linear-gradient(135deg, #FFE8D6, #FFD4C4)',
                }}
              >
                Start reflecting
                <ArrowDown size={14} className="rotate-[-90deg]" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ═══ FOOTER (Createnix: 32px radius, border) ═══ */}
        <footer className="mx-4 md:mx-12 mb-8 rounded-[32px] border border-cnx-border bg-cnx-white px-8 md:px-16 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <WordmarkLight className="h-5" />
            <div className="flex items-center gap-6">
              <a
                href="/privacy-policy"
                className="text-cnx-grey hover:text-cnx-black transition-colors"
                style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400 }}
              >
                Privacy
              </a>
              <a
                href="/usage-policy"
                className="text-cnx-grey hover:text-cnx-black transition-colors"
                style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400 }}
              >
                Usage Policy
              </a>
              <a
                href="/about"
                className="text-cnx-grey hover:text-cnx-black transition-colors"
                style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400 }}
              >
                About
              </a>
            </div>
            <p className="text-cnx-grey" style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400 }}>
              © 2026 Temple
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
