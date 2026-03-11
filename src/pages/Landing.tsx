import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import WordmarkLight from '@/components/WordmarkLight';

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

// ─── iPhone Frame ───
function IPhoneFrame({ children, caption, inView, delay = 0 }: {
  children: React.ReactNode; caption: string; inView: boolean; delay?: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
    >
      <motion.div
        className="relative w-[300px] sm:w-[340px] md:w-[375px] rounded-[40px] border-[6px] border-[#1a1a1a] bg-[#fafafa] shadow-[0_40px_100px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden"
        style={{ aspectRatio: '375/812' }}
        whileHover={{ y: -4, transition: { duration: 0.3 } }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#1a1a1a] rounded-b-2xl z-10" />
        {/* Screen glare */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none z-20" />
        {/* Content */}
        <div className="relative w-full h-full overflow-hidden">
          {children}
        </div>
      </motion.div>
      <motion.p
        className="mt-6 text-[15px] text-[#888] italic font-light text-center max-w-[320px]"
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
function ColorItem({ color, word, label, inView, delay }: {
  color: string; word: string; label: string; inView: boolean; delay: number;
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
        <span className={`inline-block px-2 py-0.5 rounded-md ${s.bg} ${s.text} text-[14px] font-semibold mr-2`}>
          "{word}"
        </span>
        <span className="text-[15px] text-[#555]">— {label}</span>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

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
    <div id="landing-scroll" className="w-full min-h-screen overflow-y-auto overflow-x-hidden bg-white" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>

      {/* ═══ FIXED NAV ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 md:px-12 transition-all duration-300 ${scrolled ? 'h-[64px] bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]' : 'h-[80px] bg-transparent'}`}>
        <button onClick={() => navigate('/landing')} className="outline-none focus:outline-none">
          <WordmarkLight className="h-5 md:h-6" />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-[13px] font-medium text-[#1a1a1a] border border-[#ddd] rounded-full hover:bg-[#f5f5f5] transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-[13px] font-medium text-[#1a1a1a] rounded-full transition-all hover:shadow-md"
            style={{ background: 'linear-gradient(135deg, #FFE4D6, #FFD4C4)' }}
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-[100px] pb-24" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #F0F8FF 30%, #E8F4FD 50%, #FFF1F0 70%, #ffffff 100%)' }}>
        <div ref={heroRef} className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.h1
            className="text-[48px] md:text-[72px] font-bold text-[#1a1a1a] leading-[1.05] mb-4"
            style={{ textShadow: '0 2px 30px rgba(0,0,0,0.05)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            Temple
          </motion.h1>
          <motion.p
            className="text-[20px] md:text-[26px] text-[#666] mb-10 max-w-lg leading-relaxed"
            style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Built for clarity.
          </motion.p>
          <motion.div
            className="max-w-[600px] text-[16px] md:text-[18px] text-[#555] font-light leading-[1.8] text-center space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <p>
              We've been here before. You know what you want to say, but can't see what you're actually saying. Somewhere along the way, AI got complicated—endless chats, feature bloat, engagement traps. We think it's time to get back to basics.
            </p>
            <p>
              Founded by filmmaker and creative director Emmanuel Adjei, we've built Temple for people who believe clear thinking should just work. No data training. Just your words, made visible.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </motion.div>
      </section>

      {/* ═══ CARD 1 — Input ═══ */}
      <section className="py-32 md:py-40 px-6 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #FFF8F3 0%, #FFF1E8 30%, #FFE8D6 60%, #FFF1E8 100%)' }}>
        <div ref={card1Ref} className="max-w-[1200px] w-full flex flex-col items-center">
          <IPhoneFrame caption="Paste your text—decision, message, situation" inView={card1InView}>
            <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #FFF5EE 0%, #FFE8D6 100%)' }}>
              <div className="pt-12 px-6 flex-1 flex flex-col">
                {/* Status bar mock */}
                <div className="flex justify-between items-center mb-8 text-[11px] text-[#999]">
                  <span>9:41</span>
                  <span className="flex gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#999"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#999"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                  </span>
                </div>
                <p className="text-[22px] font-semibold text-[#1a1a1a] mb-2">Temple</p>
                <p className="text-[13px] text-[#999] mb-6">What's weighing on you?</p>
                <div className="flex-1" />
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#e5e5e5] px-4 py-3 mb-6 shadow-sm">
                  <p className="text-[14px] text-[#1a1a1a] leading-relaxed">
                    {typedInput}
                    {typedInput.length < 44 && card1InView && (
                      <motion.span
                        className="inline-block w-[2px] h-[16px] bg-[#1a1a1a]/40 ml-0.5 align-text-bottom"
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                    )}
                  </p>
                </div>
              </div>
              {/* Home indicator */}
              <div className="flex justify-center pb-3">
                <div className="w-[120px] h-[4px] rounded-full bg-[#1a1a1a]/20" />
              </div>
            </div>
          </IPhoneFrame>
        </div>
      </section>

      {/* ═══ HOW TEMPLE WORKS ═══ */}
      <section className="py-32 md:py-40 px-6" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #F9FAFB 50%, #ffffff 100%)' }}>
        <div ref={howRef} className="max-w-[720px] mx-auto">
          <motion.h2
            className="text-[32px] md:text-[44px] font-bold text-[#1a1a1a] mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            How Temple Works
          </motion.h2>
          <motion.p
            className="text-[17px] md:text-[19px] text-[#555] font-light leading-[1.8] text-center mb-6"
            initial={{ opacity: 0 }}
            animate={howInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Clarity doesn't need complexity. Temple reads it and highlights what matters.
          </motion.p>
          <motion.p
            className="text-[17px] md:text-[19px] text-[#555] font-light leading-[1.8] text-center mb-14"
            initial={{ opacity: 0 }}
            animate={howInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Here's the core concept: every input becomes a mirror. Temple surfaces:
          </motion.p>

          <div className="space-y-5 max-w-[520px] mx-auto">
            <ColorItem color="red" word="pays well" label="Unexamined assumption" inView={howInView} delay={0.4} />
            <ColorItem color="yellow" word="feels empty" label="Internal tension" inView={howInView} delay={0.55} />
            <ColorItem color="green" word="quit" label="Truth you're circling" inView={howInView} delay={0.7} />
            <ColorItem color="blue" word="whole text" label="Weight you're carrying" inView={howInView} delay={0.85} />
          </div>
        </div>
      </section>

      {/* ═══ CARD 2 — Colors Active ═══ */}
      <section className="py-32 md:py-40 px-6 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #F0F8FF 0%, #E8F4FD 30%, #FFF1F0 60%, #FEF5E7 100%)' }}>
        <div ref={card2Ref} className="max-w-[1200px] w-full flex flex-col items-center">
          <IPhoneFrame caption="Each color opens its own path" inView={card2InView}>
            <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F0F4F8 100%)' }}>
              <div className="pt-12 px-5 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6 text-[11px] text-[#999]">
                  <span>9:41</span>
                  <span>Temple</span>
                  <span />
                </div>

                {/* User message with highlights */}
                <div className="bg-[#1a1a1a] text-white px-4 py-3 rounded-2xl rounded-br-md text-[13px] leading-[1.7] mb-4">
                  Should I <span className="bg-green-500/30 px-1 rounded">quit</span> my job? It <span className="bg-red-500/30 px-1 rounded">pays well</span> but <span className="bg-yellow-500/30 px-1 rounded">feels empty</span>. Not sure if I'm ready.
                  <div className="mt-1 h-[2px] bg-blue-400/60 rounded-full" />
                </div>

                {/* Color tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Assumption</span>
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Tension</span>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Truth</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Weight</span>
                </div>

                {/* RED tooltip expanded */}
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
                  <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wider mb-1">Assumption</p>
                  <p className="text-[13px] text-red-800 leading-relaxed">"pays well" — Money = security. Is that true for you?</p>
                </div>

                <div className="flex-1" />
                <div className="flex justify-center pb-3">
                  <div className="w-[120px] h-[4px] rounded-full bg-[#1a1a1a]/20" />
                </div>
              </div>
            </div>
          </IPhoneFrame>
        </div>
      </section>

      {/* ═══ SYNTHESIS TEXT ═══ */}
      <section className="py-32 md:py-40 px-6" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #FEFEFE 100%)' }}>
        <div ref={synthesisRef} className="max-w-[680px] mx-auto text-center">
          <motion.p
            className="text-[17px] md:text-[19px] text-[#555] font-light leading-[1.9]"
            initial={{ opacity: 0, y: 16 }}
            animate={synthesisInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            Each color opens its own path. Weave it together and hit "Synthesis" to merge all paths into one clear statement:
          </motion.p>
          <motion.blockquote
            className="mt-8 text-[18px] md:text-[22px] text-[#1a1a1a] font-medium leading-[1.7] border-l-4 border-[#1a1a1a] pl-6 text-left max-w-[560px] mx-auto"
            style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
            initial={{ opacity: 0, x: -20 }}
            animate={synthesisInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            "You're ready to quit because it feels empty, even though the paychecks scare you into staying. Change matters more than stability right now."
          </motion.blockquote>
        </div>
      </section>

      {/* ═══ CARD 3 — Synthesis Complete ═══ */}
      <section className="py-32 md:py-40 px-6 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #FEF5E7 0%, #FFF1F0 50%, #F0F8FF 100%)' }}>
        <div ref={card3Ref} className="max-w-[1200px] w-full flex flex-col items-center">
          <IPhoneFrame caption="Your clarity, copy-paste ready" inView={card3InView}>
            <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #FAFBFC 0%, #F5F5F7 100%)' }}>
              <div className="pt-12 px-5 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6 text-[11px] text-[#999]">
                  <span>9:41</span>
                  <span>Synthesis</span>
                  <span />
                </div>

                <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm px-5 py-5 mb-5">
                  <p className="text-[10px] text-[#999] uppercase tracking-wider font-semibold mb-3">Your Clarity</p>
                  <p className="text-[13px] text-[#1a1a1a] leading-[1.8]" style={{ fontFamily: "'Georgia', serif" }}>
                    "You're ready to quit because it feels empty, even though the paychecks scare you into staying. Change matters more than stability right now."
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#1a1a1a] text-white text-[12px] font-medium rounded-xl py-3 text-center">Copy</div>
                  <div className="flex-1 bg-white border border-[#ddd] text-[#1a1a1a] text-[12px] font-medium rounded-xl py-3 text-center">Share</div>
                  <div className="flex-1 bg-white border border-[#ddd] text-[#888] text-[12px] font-medium rounded-xl py-3 text-center">Exit</div>
                </div>

                <div className="flex-1" />
                <div className="flex justify-center pb-3">
                  <div className="w-[120px] h-[4px] rounded-full bg-[#1a1a1a]/20" />
                </div>
              </div>
            </div>
          </IPhoneFrame>
        </div>
      </section>

      {/* ═══ A CANVAS, NOT A CHATBOT ═══ */}
      <section className="py-32 md:py-40 px-6" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #F9FAFB 50%, #ffffff 100%)' }}>
        <div ref={canvasRef} className="max-w-[680px] mx-auto">
          <motion.h2
            className="text-[32px] md:text-[44px] font-bold text-[#1a1a1a] mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={canvasInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            A Canvas, Not a Chatbot
          </motion.h2>
          <motion.div
            className="text-[17px] md:text-[19px] text-[#555] font-light leading-[1.9] text-center space-y-6"
            initial={{ opacity: 0 }}
            animate={canvasInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p>
              Temple has a single job: show you your own thinking. No lengthy threads. No endless suggestions. Every interaction earns its place by getting out of your way.
            </p>
            <p>
              Paste your words. See the colors. Pick your path. Weave your clarity. Exit when you're done. It just works.
            </p>
          </motion.div>

          {/* Backend + Modern */}
          <motion.div
            className="mt-20 space-y-12"
            initial={{ opacity: 0 }}
            animate={canvasInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="text-center">
              <h3 className="text-[20px] md:text-[24px] font-semibold text-[#1a1a1a] mb-3">The Backend</h3>
              <p className="text-[16px] md:text-[17px] text-[#666] font-light leading-[1.8]">
                Temple runs on Perplexity because clear thinking deserves fast infrastructure.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-[20px] md:text-[24px] font-semibold text-[#1a1a1a] mb-3">Modern by Design</h3>
              <p className="text-[16px] md:text-[17px] text-[#666] font-light leading-[1.8]">
                AI hasn't changed much, but how we think has. We're building Temple with the latest: precise analysis, instant visuals, zero retention.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 md:py-40 px-6 flex flex-col items-center" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #E8F4FD 20%, #FFF1F0 40%, #FEF5E7 60%, #F0F8FF 80%, #ffffff 100%)' }}>
        <div ref={ctaRef} className="text-center max-w-[600px]">
          <motion.h2
            className="text-[36px] md:text-[52px] font-bold text-[#1a1a1a] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            Start reflecting
          </motion.h2>
          <motion.p
            className="text-[18px] md:text-[22px] text-[#666] font-light mb-14"
            style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your words. Your clarity. Nothing else.
          </motion.p>
          <motion.button
            className="px-12 py-4 text-[17px] font-medium text-[#1a1a1a] rounded-full transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #FFE4D6, #FFD4C4)', boxShadow: '0 8px 30px rgba(255, 180, 140, 0.3)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => navigate('/chat')}
          >
            Start reflecting
          </motion.button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-10 text-center border-t border-[#f0f0f0] bg-white">
        <p className="text-[12px] text-[#bbb] tracking-[0.15em] uppercase">
          Built in LA &nbsp;·&nbsp;{' '}
          <a href="/privacy-policy" className="hover:text-[#999] transition-colors underline">Privacy</a>
        </p>
      </footer>
    </div>
  );
}
