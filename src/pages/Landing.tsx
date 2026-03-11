import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import WordmarkLight from '@/components/WordmarkLight';
import ShaderBackground from '@/components/ShaderBackground';

// ─── Typing animation hook ───
function useTypingEffect(text: string, speed = 40, startTyping = false) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!startTyping) {setDisplayed('');return;}
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

// ─── Glassmorphic Card ───
function GlassCard({ children, className = '' }: {children: React.ReactNode;className?: string;}) {
  return (
    <div className={`backdrop-blur-[64px] bg-[rgba(255,255,255,0.75)] border border-[rgba(255,255,255,0.6)] rounded-[32px] ${className}`}>
      {children}
    </div>);

}

// ─── iPhone Frame ───
function IPhoneFrame({ children, caption, inView, delay = 0

}: {children: React.ReactNode;caption: string;inView: boolean;delay?: number;}) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}>
      
      <motion.div
        className="relative w-[280px] sm:w-[320px] md:w-[340px] rounded-[36px] border-[5px] border-[#1a1a1a] bg-[#fafafa] shadow-[0_40px_100px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden"
        style={{ aspectRatio: '375/812' }}
        whileHover={{ y: -4, transition: { duration: 0.3 } }}>
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[24px] bg-[#1a1a1a] rounded-b-xl z-10" />
        {/* Screen glare */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none z-20" />
        <div className="relative w-full h-full overflow-hidden">
          {children}
        </div>
      </motion.div>
      <motion.p
        className="mt-5 text-[14px] text-gray-500 italic font-light text-center max-w-[300px]"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: delay + 0.3 }}>
        
        {caption}
      </motion.p>
    </motion.div>);

}

// ─── Color Legend Item ───
function ColorItem({ color, word, label, inView, delay

}: {color: string;word: string;label: string;inView: boolean;delay: number;}) {
  const styles: Record<string, {bg: string;text: string;dot: string;}> = {
    red: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    green: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' }
  };
  const s = styles[color];
  return (
    <motion.div
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}>
      
      <div className={`w-3 h-3 rounded-full ${s.dot} mt-1.5 shrink-0`} />
      <div>
        <span className={`inline-block px-2 py-0.5 rounded-md ${s.bg} ${s.text} text-[14px] font-semibold mr-2`}>
          "{word}"
        </span>
        <span className="text-[15px] text-gray-600">— {label}</span>
      </div>
    </motion.div>);

}

// ─── Viewport size hook ───
function useViewportSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { width, height } = useViewportSize();

  const heroRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const synthesisRef = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.4 });
  const card1InView = useInView(card1Ref, { once: true, amount: 0.3 });
  const howInView = useInView(howRef, { once: true, amount: 0.4 });
  const card2InView = useInView(card2Ref, { once: true, amount: 0.3 });
  const synthesisInView = useInView(synthesisRef, { once: true, amount: 0.4 });
  const card3InView = useInView(card3Ref, { once: true, amount: 0.3 });
  const canvasInView = useInView(canvasRef, { once: true, amount: 0.4 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.4 });

  const typedInput = useTypingEffect("Should I quit? Pays well but feels empty...", 35, card1InView);

  useEffect(() => {
    const el = document.getElementById('landing-scroll');
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      {/* Iridescent shader background — same as /chat light theme */}
      <ShaderBackground
        width={width}
        height={height}
        colors={['#FFB347', '#FF6B81', '#FFC107']}
        theme="light" />
      

      {/* Scrollable content over shader */}
      <div
        id="landing-scroll"
        className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
        
        {/* ═══ FIXED NAV ═══ */}
        <nav className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 md:px-12 transition-all duration-300 ${
        scrolled ?
        'h-[64px] backdrop-blur-[64px] bg-[rgba(255,255,255,0.6)] shadow-[0_1px_0_rgba(0,0,0,0.06)]' :
        'h-[80px] bg-transparent'}`
        }>
          <button onClick={() => navigate('/landing')} className="outline-none focus:outline-none">
            <WordmarkLight className="h-5 md:h-6" />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-[13px] font-medium text-gray-900 border border-[rgba(0,0,0,0.12)] rounded-full backdrop-blur-xl bg-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.6)] transition-colors">
              
              Log in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-[13px] font-medium text-gray-900 rounded-full transition-all hover:shadow-md backdrop-blur-xl"
              style={{ background: 'linear-gradient(135deg, rgba(255,228,214,0.8), rgba(255,212,196,0.8))' }}>
              
              Sign up
            </button>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-[100px] pb-24">
          <div ref={heroRef} className="flex flex-col items-center text-center max-w-3xl mx-auto">
            






            
            <motion.p
              className="text-[20px] mb-10 max-w-lg leading-relaxed md:text-7xl text-black font-sans"
              style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
              initial={{ opacity: 0, y: 16 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}>Built for clarity


            </motion.p>
            <motion.div
              className="max-w-[600px] text-[16px] md:text-[18px] text-gray-600 font-light leading-[1.8] text-center space-y-6"
              initial={{ opacity: 0, y: 16 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.35 }}>
              
              <GlassCard className="p-8 md:p-10 text-left">
                <p className="mb-6">
                  We've been here before. You know what you want to say, but can't see what you're actually saying. Somewhere along the way, AI got complicated—endless chats, feature bloat, engagement traps. We think it's time to get back to basics.
                </p>
                <p>
                  Founded by filmmaker and creative director Emmanuel Adjei, we've built Temple for people who believe clear thinking should just work. No data training. Just your words, made visible.
                </p>
              </GlassCard>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}>
            
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </motion.div>
        </section>

        {/* ═══ CARD 1 — Input ═══ */}
        <section className="py-24 md:py-32 px-6 flex flex-col items-center">
          <div ref={card1Ref} className="max-w-[1200px] w-full flex flex-col items-center">
            <IPhoneFrame caption="Paste your text—decision, message, situation" inView={card1InView}>
              <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #FFF5EE 0%, #FFE8D6 100%)' }}>
                <div className="pt-12 px-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-8 text-[10px] text-gray-400">
                    <span>9:41</span>
                    <span className="flex gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
                    </span>
                  </div>
                  <p className="text-[18px] font-semibold text-gray-900 mb-1">Temple</p>
                  <p className="text-[12px] text-gray-400 mb-6">What's weighing on you?</p>
                  <div className="flex-1" />
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 px-4 py-3 mb-6 shadow-sm">
                    <p className="text-[13px] text-gray-900 leading-relaxed">
                      {typedInput}
                      {typedInput.length < 44 && card1InView &&
                      <motion.span
                        className="inline-block w-[2px] h-[14px] bg-gray-900/40 ml-0.5 align-text-bottom"
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }} />

                      }
                    </p>
                  </div>
                </div>
                <div className="flex justify-center pb-3">
                  <div className="w-[100px] h-[4px] rounded-full bg-gray-900/20" />
                </div>
              </div>
            </IPhoneFrame>
          </div>
        </section>

        {/* ═══ HOW TEMPLE WORKS ═══ */}
        <section className="py-24 md:py-32 px-6">
          <div ref={howRef} className="max-w-[720px] mx-auto">
            <GlassCard className="p-8 md:p-12">
              <motion.h2
                className="text-[28px] mb-6 text-center font-sans font-normal md:text-5xl text-black"
                initial={{ opacity: 0, y: 20 }}
                animate={howInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}>
                
                How Temple Works
              </motion.h2>
              <motion.p
                className="text-[16px] md:text-[18px] text-gray-600 font-light leading-[1.8] text-center mb-4"
                initial={{ opacity: 0 }}
                animate={howInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}>
                
                Clarity doesn't need complexity. Temple reads it and highlights what matters.
              </motion.p>
              <motion.p
                className="text-[16px] md:text-[18px] text-gray-600 font-light leading-[1.8] text-center mb-10"
                initial={{ opacity: 0 }}
                animate={howInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}>
                
                Here's the core concept: every input becomes a mirror. Temple surfaces:
              </motion.p>

              <div className="space-y-5 max-w-[480px] mx-auto">
                <ColorItem color="red" word="pays well" label="Unexamined assumption" inView={howInView} delay={0.4} />
                <ColorItem color="yellow" word="feels empty" label="Internal tension" inView={howInView} delay={0.55} />
                <ColorItem color="green" word="quit" label="Truth you're circling" inView={howInView} delay={0.7} />
                <ColorItem color="blue" word="whole text" label="Weight you're carrying" inView={howInView} delay={0.85} />
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ═══ CARD 2 — Colors Active ═══ */}
        <section className="py-24 md:py-32 px-6 flex flex-col items-center">
          <div ref={card2Ref} className="max-w-[1200px] w-full flex flex-col items-center">
            <IPhoneFrame caption="Each color opens its own path" inView={card2InView}>
              <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F0F4F8 100%)' }}>
                <div className="pt-12 px-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-5 text-[10px] text-gray-400">
                    <span>9:41</span>
                    <span>Temple</span>
                    <span />
                  </div>

                  <div className="bg-gray-900 text-white px-3.5 py-2.5 rounded-2xl rounded-br-md text-[12px] leading-[1.7] mb-3">
                    Should I <span className="bg-green-500/30 px-0.5 rounded">quit</span> my job? It <span className="bg-red-500/30 px-0.5 rounded">pays well</span> but <span className="bg-yellow-500/30 px-0.5 rounded">feels empty</span>. Not sure if I'm ready.
                    <div className="mt-1 h-[2px] bg-blue-400/60 rounded-full" />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Assumption</span>
                    <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Tension</span>
                    <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Truth</span>
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Weight</span>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-3">
                    <p className="text-[9px] text-red-500 font-semibold uppercase tracking-wider mb-1">Assumption</p>
                    <p className="text-[12px] text-red-800 leading-relaxed">"pays well" — Money = security. Is that true for you?</p>
                  </div>

                  <div className="flex-1" />
                  <div className="flex justify-center pb-3">
                    <div className="w-[100px] h-[4px] rounded-full bg-gray-900/20" />
                  </div>
                </div>
              </div>
            </IPhoneFrame>
          </div>
        </section>

        {/* ═══ SYNTHESIS TEXT ═══ */}
        <section className="py-24 md:py-32 px-6">
          <div ref={synthesisRef} className="max-w-[680px] mx-auto">
            <GlassCard className="p-8 md:p-12">
              <motion.p
                className="text-[16px] md:text-[18px] text-gray-600 font-light leading-[1.9] text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={synthesisInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}>
                
                Each color opens its own path. Weave it together and hit "Synthesis" to merge all paths into one clear statement:
              </motion.p>
              <motion.blockquote
                className="mt-8 text-[17px] md:text-[20px] text-gray-900 font-medium leading-[1.7] border-l-4 border-gray-900 pl-6 text-left"
                style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
                initial={{ opacity: 0, x: -20 }}
                animate={synthesisInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}>
                
                "You're ready to quit because it feels empty, even though the paychecks scare you into staying. Change matters more than stability right now."
              </motion.blockquote>
            </GlassCard>
          </div>
        </section>

        {/* ═══ CARD 3 — Synthesis Complete ═══ */}
        <section className="py-24 md:py-32 px-6 flex flex-col items-center">
          <div ref={card3Ref} className="max-w-[1200px] w-full flex flex-col items-center">
            <IPhoneFrame caption="Your clarity, copy-paste ready" inView={card3InView}>
              <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #FAFBFC 0%, #F5F5F7 100%)' }}>
                <div className="pt-12 px-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-5 text-[10px] text-gray-400">
                    <span>9:41</span>
                    <span>Synthesis</span>
                    <span />
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4 mb-4">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Your Clarity</p>
                    <p className="text-[12px] text-gray-900 leading-[1.8]" style={{ fontFamily: "'Georgia', serif" }}>
                      "You're ready to quit because it feels empty, even though the paychecks scare you into staying. Change matters more than stability right now."
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-900 text-white text-[11px] font-medium rounded-xl py-2.5 text-center">Copy</div>
                    <div className="flex-1 bg-white border border-gray-200 text-gray-900 text-[11px] font-medium rounded-xl py-2.5 text-center">Share</div>
                    <div className="flex-1 bg-white border border-gray-200 text-gray-400 text-[11px] font-medium rounded-xl py-2.5 text-center">Exit</div>
                  </div>

                  <div className="flex-1" />
                  <div className="flex justify-center pb-3">
                    <div className="w-[100px] h-[4px] rounded-full bg-gray-900/20" />
                  </div>
                </div>
              </div>
            </IPhoneFrame>
          </div>
        </section>

        {/* ═══ A CANVAS, NOT A CHATBOT ═══ */}
        <section className="py-24 md:py-32 px-6">
          <div ref={canvasRef} className="max-w-[680px] mx-auto">
            <GlassCard className="p-8 md:p-12">
              <motion.h2
                className="text-[28px] mb-8 text-center font-normal md:text-5xl text-black"
                initial={{ opacity: 0, y: 20 }}
                animate={canvasInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}>
                
                A Canvas, Not a Chatbot
              </motion.h2>
              <motion.div
                className="text-[16px] md:text-[18px] text-gray-600 font-light leading-[1.9] text-center space-y-6"
                initial={{ opacity: 0 }}
                animate={canvasInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}>
                
                <p>
                  Temple has a single job: show you your own thinking. No lengthy threads. No endless suggestions. Every interaction earns its place by getting out of your way.
                </p>
                <p>
                  Paste your words. See the colors. Pick your path. Weave your clarity. Exit when you're done. It just works.
                </p>
              </motion.div>

              <motion.div
                className="mt-14 space-y-8"
                initial={{ opacity: 0 }}
                animate={canvasInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.4 }}>
                
                <div className="text-center">
                  <h3 className="text-[18px] md:text-[22px] font-semibold text-gray-900 mb-2">The Backend</h3>
                  <p className="text-[15px] md:text-[16px] text-gray-500 font-light leading-[1.8]">
                    Temple runs on Perplexity because clear thinking deserves fast infrastructure.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-[18px] md:text-[22px] font-semibold text-gray-900 mb-2">Modern by Design</h3>
                  <p className="text-[15px] md:text-[16px] text-gray-500 font-light leading-[1.8]">
                    AI hasn't changed much, but how we think has. We're building Temple with the latest: precise analysis, instant visuals, zero retention.
                  </p>
                </div>
              </motion.div>
            </GlassCard>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-24 md:py-32 px-6 flex flex-col items-center">
          <div ref={ctaRef} className="text-center max-w-[600px]">
            <GlassCard className="p-10 md:p-14">
              <motion.h2
                className="text-[32px] mb-5 text-black md:text-5xl font-sans font-normal"
                initial={{ opacity: 0, y: 20 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}>
                
                Start reflecting
              </motion.h2>
              <motion.p
                className="text-[17px] md:text-[20px] text-gray-500 font-light mb-10"
                style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
                initial={{ opacity: 0 }}
                animate={ctaInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}>
                
                Your words. Your clarity. Nothing else.
              </motion.p>
              <motion.button
                className="px-10 py-3.5 text-[16px] font-medium text-gray-900 rounded-full transition-all hover:shadow-lg hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #FFE4D6, #FFD4C4)', boxShadow: '0 8px 30px rgba(255, 180, 140, 0.25)' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                onClick={() => navigate('/chat')}>
                
                Start reflecting
              </motion.button>
            </GlassCard>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="py-10 text-center">
          <p className="text-[12px] text-gray-400 tracking-[0.15em] uppercase">
            Built in LA &nbsp;·&nbsp;{' '}
            <a href="/privacy-policy" className="hover:text-gray-600 transition-colors underline">Privacy</a>
          </p>
        </footer>
      </div>
    </div>);

}