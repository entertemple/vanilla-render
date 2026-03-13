import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import WordmarkLight from '@/components/WordmarkLight';
import LandingPricing from '@/components/landing/LandingPricing';

const FONT_FAMILY = "'DM Sans', Arial, sans-serif";

// ─── Shadow Text Row (Createnix double-text reveal) ───
function ShadowTextRow({ text, inView, delay = 0, className = '' }: {text: string;inView: boolean;delay?: number;className?: string;}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <h2
        className="text-cnx-grey select-none"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 'clamp(32px, 6vw, 80px)',
          fontWeight: 400,
          lineHeight: 1.15
        }}>
        {text}
      </h2>
      <motion.h2
        className="absolute inset-0 text-cnx-black text-lg"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 'clamp(32px, 6vw, 80px)',
          fontWeight: 400,
          lineHeight: 1.15
        }}
        initial={{ y: '100%' }}
        animate={inView ? { y: '0%' } : {}}
        transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
        {text}
      </motion.h2>
    </div>);

}

// ─── Parallax blank cards ───
const GRID_PLACEMENTS = [
{ gridColumn: '1 / 3', gridRow: '1 / 4', minHeight: '400px' },
{ gridColumn: '3 / 5', gridRow: '2 / 5', minHeight: '380px' },
{ gridColumn: '5 / 7', gridRow: '1 / 3', minHeight: '280px' },
{ gridColumn: '7 / 9', gridRow: '2 / 5', minHeight: '400px' },
{ gridColumn: '2 / 4', gridRow: '5 / 8', minHeight: '380px' },
{ gridColumn: '5 / 8', gridRow: '4 / 7', minHeight: '350px' },
{ gridColumn: '1 / 3', gridRow: '8 / 10', minHeight: '300px' },
{ gridColumn: '6 / 9', gridRow: '7 / 10', minHeight: '340px' }];


export default function Landing() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 350]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y6 = useTransform(scrollYProgress, [0, 1], [0, 450]);
  const y7 = useTransform(scrollYProgress, [0, 1], [0, -350]);
  const y8 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const parallaxValues = useMemo(() => [y1, y2, y3, y4, y5, y6, y7, y8], [y1, y2, y3, y4, y5, y6, y7, y8]);

  // Section refs
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.2 });
  const pricingInView = useInView(pricingRef, { once: true, amount: 0.3 });
  const finalInView = useInView(finalRef, { once: true, amount: 0.3 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  // Nav scroll glassmorphism
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-cnx-white">
      {/* ═══ FIXED NAV ═══ */}
      <nav
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center px-6 md:px-12 h-[80px]"
        style={{ fontFamily: FONT_FAMILY }}>
        <div
          className={`hidden md:flex items-center gap-0 rounded-[100px] transition-all duration-500 ${
          scrolled ?
          'backdrop-blur-[10px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(34,34,34,0.08)]' :
          'bg-transparent border border-transparent'}`
          }
          style={{ padding: '6px 8px' }}>
          <button
            onClick={() => navigate('/landing')}
            className="px-5 py-2 outline-none focus:outline-none rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors">
            <WordmarkLight className="h-5" />
          </button>
          <button
            onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors"
            style={{ fontSize: '14px', fontWeight: 400 }}>
            How It Works
          </button>
          <button
            onClick={() => pricingRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors"
            style={{ fontSize: '14px', fontWeight: 400 }}>
            Pricing
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-cnx-black rounded-[100px] border border-cnx-border hover:bg-cnx-light-grey/50 transition-colors whitespace-nowrap"
            style={{ fontSize: '14px', fontWeight: 400 }}>
            Get Started
          </button>
        </div>

        {/* Mobile nav */}
        <div
          className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-[100px] p-2 backdrop-blur-[10px] bg-[rgba(255,255,255,0.6)] border border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(34,34,34,0.08)]">
          <button onClick={() => navigate('/landing')} className="px-3 py-2 rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors">
            <WordmarkLight className="h-4" />
          </button>
          <button onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-3 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors" style={{ fontSize: '12px' }}>How It Works</button>
          <button onClick={() => pricingRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-3 py-2 text-cnx-black rounded-[100px] hover:bg-cnx-light-grey/50 transition-colors" style={{ fontSize: '12px' }}>Pricing</button>
          <button onClick={() => navigate('/login')} className="px-3 py-2 text-cnx-black rounded-[100px] border border-cnx-border hover:bg-cnx-light-grey/50 transition-colors whitespace-nowrap" style={{ fontSize: '12px' }}>Get Started</button>
        </div>
      </nav>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--cnx-border)) transparent' }}>

        {/* ═══ HERO ═══ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-[80px]" ref={heroRef}>
          <motion.h1
            className="text-cnx-black text-center"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 'clamp(56px, 12vw, 160px)',
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: '-0.02em'
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}>
            Built for clarity.
          </motion.h1>

          <motion.p
            className="text-cnx-black mt-8 text-center max-w-[640px]"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 'clamp(16px, 2vw, 20px)',
              fontWeight: 400,
              lineHeight: '1.6'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}>
            You know what you want to say. <br />
            You just can't see what you're actually saying yet.
          </motion.p>

          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}>
            <div className="w-[56px] h-[56px] rounded-full border border-cnx-border flex items-center justify-center bg-cnx-white">
              <ArrowDown size={20} className="text-cnx-black" />
            </div>
          </motion.div>
        </section>

        {/* ═══ PARALLAX GRID — Blank cards ═══ */}
        <section className="px-4 md:px-12 pb-32 max-w-[1600px] mx-auto">
          <div
            className="hidden md:grid"
            style={{
              gridTemplateColumns: 'repeat(8, 1fr)',
              gridTemplateRows: 'repeat(10, auto)',
              gap: '16px'
            }}>
            {GRID_PLACEMENTS.map((placement, i) =>
            <motion.div
              key={i}
              className="rounded-[24px] bg-cnx-light-grey w-full"
              style={{
                gridColumn: placement.gridColumn,
                gridRow: placement.gridRow,
                minHeight: placement.minHeight,
                y: parallaxValues[i],
                willChange: 'transform'
              }} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {GRID_PLACEMENTS.map((_, i) =>
            <div key={i} className="rounded-[24px] bg-cnx-light-grey" style={{ minHeight: '180px' }} />
            )}
          </div>
        </section>

        {/* ═══ ABOUT — Temple introduction ═══ */}
        <section className="px-6 md:px-12 py-48 max-w-[1200px] mx-auto" ref={aboutRef}>
          <motion.p
            className="text-cnx-grey"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 'clamp(40px, 8vw, 128px)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={aboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3 }}>
            A beautifully designed AI for people who need to think something through.
          </motion.p>
        </section>

        {/* ═══ PRICING ═══ */}
        <div ref={pricingRef}>
          <LandingPricing />
        </div>

        {/* ═══ FINAL STATEMENT ═══ */}
        <section className="py-48 px-6 flex items-center justify-center min-h-[70vh]" ref={finalRef}>
          <motion.h1
            className="text-cnx-black text-center"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 'clamp(56px, 12vw, 160px)',
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: '-0.02em'
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={finalInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}>
            It just works.
          </motion.h1>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-32 px-6 flex justify-center" ref={ctaRef}>
          <motion.button
            onClick={() => navigate('/chat')}
            className="px-12 py-5 rounded-[100px] bg-cnx-black text-cnx-white transition-all hover:shadow-[0_20px_60px_rgba(14,14,14,0.3)] hover:scale-[1.02]"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: '16px',
              fontWeight: 400,
              letterSpacing: '0.02em'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}>
            Enter Temple
          </motion.button>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="mx-4 md:mx-12 mb-8 rounded-[32px] border border-cnx-border bg-cnx-white px-8 md:px-16 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <WordmarkLight className="h-5" />
            <div className="flex items-center gap-6">
              <a href="/privacy-policy" className="text-cnx-grey hover:text-cnx-black transition-colors" style={{ fontFamily: FONT_FAMILY, fontSize: '14px' }}>Privacy</a>
              <a href="/usage-policy" className="text-cnx-grey hover:text-cnx-black transition-colors" style={{ fontFamily: FONT_FAMILY, fontSize: '14px' }}>Usage Policy</a>
              <a href="/about" className="text-cnx-grey hover:text-cnx-black transition-colors" style={{ fontFamily: FONT_FAMILY, fontSize: '14px' }}>About</a>
            </div>
            <p className="text-cnx-grey" style={{ fontFamily: FONT_FAMILY, fontSize: '14px' }}>© 2026 Temple</p>
          </div>
        </footer>
      </div>
    </div>);
}
