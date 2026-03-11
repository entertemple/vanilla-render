import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';

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

// ─── Color paint highlight ───
function PaintHighlight({ children, color, label, inView, delay = 0 }: {
  children: string; color: string; label: string; inView: boolean; delay?: number;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <span className="relative inline-block group">
      <motion.span
        className={`relative z-10 px-1.5 py-0.5 rounded-md ${c.bg}`}
        initial={{ backgroundSize: '0% 100%' }}
        animate={inView ? { backgroundSize: '100% 100%' } : {}}
        transition={{ duration: 0.5, ease: 'easeOut', delay }}
      >
        {children}
      </motion.span>
      <motion.span
        className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] font-medium px-3 py-1.5 rounded-lg ${c.bg} ${c.text} border ${c.border} shadow-sm`}
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: delay + 0.3 }}
      >
        {label}
      </motion.span>
    </span>
  );
}

// ─── Chat bubble mock ───
function ChatBubble({ text, isUser, inView, delay = 0 }: {
  text: React.ReactNode; isUser?: boolean; inView: boolean; delay?: number;
}) {
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
        isUser
          ? 'bg-[#1a1a1a] text-white rounded-br-md'
          : 'bg-white/80 text-[#1a1a1a] border border-[#e5e5e5] rounded-bl-md shadow-sm'
      }`}>
        {text}
      </div>
    </motion.div>
  );
}

// ─── App window chrome ───
function AppWindow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative rounded-2xl border border-[#e0e0e0] bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.08)] overflow-hidden ${className}`}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[11px] text-[#999] font-medium tracking-wide">TEMPLE</span>
      </div>
      <div className="p-6 md:p-8">{children}</div>
    </motion.div>
  );
}

// ─── Section wrapper with gradient ───
function Section({ children, gradient, className = '', id }: {
  children: React.ReactNode; gradient?: string; className?: string; id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative min-h-screen flex flex-col items-center justify-center px-6 py-24 md:py-32 ${className}`}
      style={gradient ? { background: gradient } : undefined}
    >
      {children}
    </section>
  );
}

const FULL_TEXT = "Should I quit my job? It pays well but feels empty. Not sure if I'm ready.";

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const frame2Ref = useRef<HTMLDivElement>(null);
  const frame3Ref = useRef<HTMLDivElement>(null);
  const frame4Ref = useRef<HTMLDivElement>(null);
  const frame5Ref = useRef<HTMLDivElement>(null);
  const frame6Ref = useRef<HTMLDivElement>(null);
  const frame7Ref = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.5 });
  const f2InView = useInView(frame2Ref, { once: true, amount: 0.4 });
  const f3InView = useInView(frame3Ref, { once: true, amount: 0.4 });
  const f4InView = useInView(frame4Ref, { once: true, amount: 0.4 });
  const f5InView = useInView(frame5Ref, { once: true, amount: 0.4 });
  const f6InView = useInView(frame6Ref, { once: true, amount: 0.4 });
  const f7InView = useInView(frame7Ref, { once: true, amount: 0.4 });

  const typedText = useTypingEffect(FULL_TEXT, 35, f2InView);
  const aiReply = useTypingEffect("You're balancing stability against purpose. What feels heaviest?", 30, f6InView);

  return (
    <div className="w-full min-h-screen overflow-y-auto overflow-x-hidden bg-white" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>

      {/* ═══ FRAME 1 — Hero ═══ */}
      <Section
        id="hero"
        gradient="linear-gradient(180deg, #ffffff 0%, #F0F8FF 30%, #E8F4FD 50%, #FFF1F0 70%, #ffffff 100%)"
      >
        <div ref={heroRef} className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.p
            className="text-[14px] md:text-[16px] tracking-[0.25em] uppercase text-[#999] mb-6 font-light"
            initial={{ opacity: 0, y: 10 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            An AI clarity tool built for reflection
          </motion.p>

          <motion.h1
            className="text-[42px] md:text-[64px] font-bold text-[#1a1a1a] leading-[1.1] mb-6"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            See your thinking<br />clearly.
          </motion.h1>

          <motion.p
            className="text-[18px] md:text-[22px] text-[#666] font-light mb-10 max-w-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Temple helps you untangle what you're really feeling—through color-coded reflection.
          </motion.p>

          <motion.button
            className="px-8 py-3.5 bg-[#1a1a1a] text-white rounded-full text-[15px] font-medium hover:bg-[#333] transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.45 }}
            onClick={() => window.location.href = '/chat'}
          >
            Start reflecting
          </motion.button>

          {/* Input preview */}
          <motion.div
            className="mt-14 w-full max-w-[520px]"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-white/60 backdrop-blur-lg rounded-full border border-[#e5e5e5] px-6 py-4 flex items-center shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
              <span className="text-[15px] text-[#bbb] flex-1 text-left">What's on your mind?</span>
              <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-6 h-6 text-[#ccc]" />
        </motion.div>
      </Section>

      {/* ═══ FRAME 2 — Typing ═══ */}
      <Section gradient="linear-gradient(180deg, #ffffff 0%, #FEF5E7 50%, #ffffff 100%)">
        <div ref={frame2Ref} className="max-w-2xl w-full mx-auto text-center">
          <motion.h2
            className="text-[28px] md:text-[40px] font-semibold text-[#1a1a1a] mb-4"
            initial={{ opacity: 0 }}
            animate={f2InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
          >
            Temple is for Thinking
          </motion.h2>
          <motion.p
            className="text-[16px] text-[#888] mb-12"
            initial={{ opacity: 0 }}
            animate={f2InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Start typing. Temple listens.
          </motion.p>

          <AppWindow className="max-w-[540px] mx-auto">
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-[#1a1a1a] text-white px-5 py-3.5 rounded-2xl rounded-br-md text-[15px] leading-relaxed max-w-[85%] text-left">
                  {typedText}
                  {typedText.length < FULL_TEXT.length && (
                    <motion.span
                      className="inline-block w-[2px] h-[18px] bg-white/70 ml-0.5 align-text-bottom"
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    />
                  )}
                </div>
              </div>
            </div>
          </AppWindow>
        </div>
      </Section>

      {/* ═══ FRAME 3 — Neutral input ═══ */}
      <Section gradient="linear-gradient(180deg, #ffffff 0%, #E8F4FD 50%, #ffffff 100%)">
        <div ref={frame3Ref} className="max-w-2xl w-full mx-auto text-center">
          <motion.h2
            className="text-[28px] md:text-[40px] font-semibold text-[#1a1a1a] mb-4"
            initial={{ opacity: 0 }}
            animate={f3InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
          >
            Temple sees patterns
          </motion.h2>
          <motion.p
            className="text-[16px] text-[#888] mb-12"
            initial={{ opacity: 0 }}
            animate={f3InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your words reveal more than you think.
          </motion.p>

          <AppWindow className="max-w-[540px] mx-auto">
            <ChatBubble
              isUser
              inView={f3InView}
              text="Should I quit my job? It pays well but feels empty. Not sure if I'm ready."
            />
          </AppWindow>
        </div>
      </Section>

      {/* ═══ FRAME 4 — RED highlight: "pays well" ═══ */}
      <Section gradient="linear-gradient(180deg, #ffffff 0%, #FFF1F0 50%, #ffffff 100%)">
        <div ref={frame4Ref} className="max-w-2xl w-full mx-auto text-center">
          <motion.h2
            className="text-[28px] md:text-[40px] font-semibold text-[#1a1a1a] mb-4"
            initial={{ opacity: 0 }}
            animate={f4InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
          >
            Assumptions surface
          </motion.h2>
          <motion.p
            className="text-[16px] text-[#888] mb-12"
            initial={{ opacity: 0 }}
            animate={f4InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            What you take for granted gets gently questioned.
          </motion.p>

          <AppWindow className="max-w-[540px] mx-auto">
            <ChatBubble
              isUser
              inView={f4InView}
              text={
                <span>
                  Should I quit my job? It{' '}
                  <PaintHighlight color="red" label="Assumption: Money = security" inView={f4InView} delay={0.4}>
                    pays well
                  </PaintHighlight>{' '}
                  but feels empty. Not sure if I'm ready.
                </span>
              }
            />
          </AppWindow>
        </div>
      </Section>

      {/* ═══ FRAME 5 — YELLOW + GREEN ═══ */}
      <Section gradient="linear-gradient(180deg, #ffffff 0%, #FEF5E7 30%, #F0FFF4 70%, #ffffff 100%)">
        <div ref={frame5Ref} className="max-w-2xl w-full mx-auto text-center">
          <motion.h2
            className="text-[28px] md:text-[40px] font-semibold text-[#1a1a1a] mb-4"
            initial={{ opacity: 0 }}
            animate={f5InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
          >
            Tensions & truths emerge
          </motion.h2>
          <motion.p
            className="text-[16px] text-[#888] mb-12"
            initial={{ opacity: 0 }}
            animate={f5InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            The conflict becomes visible. So does what matters.
          </motion.p>

          <AppWindow className="max-w-[540px] mx-auto">
            <ChatBubble
              isUser
              inView={f5InView}
              text={
                <span>
                  Should I{' '}
                  <PaintHighlight color="green" label="Truth: Change is the question" inView={f5InView} delay={0.6}>
                    quit
                  </PaintHighlight>{' '}
                  my job? It{' '}
                  <PaintHighlight color="red" label="Assumption" inView={f5InView} delay={0.3}>
                    pays well
                  </PaintHighlight>{' '}
                  but{' '}
                  <PaintHighlight color="yellow" label="Tension: Logic vs feeling" inView={f5InView} delay={0.9}>
                    feels empty
                  </PaintHighlight>
                  . Not sure if I'm ready.
                </span>
              }
            />
          </AppWindow>
        </div>
      </Section>

      {/* ═══ FRAME 6 — BLUE underline + AI reply ═══ */}
      <Section gradient="linear-gradient(180deg, #ffffff 0%, #F0F8FF 50%, #ffffff 100%)">
        <div ref={frame6Ref} className="max-w-2xl w-full mx-auto text-center">
          <motion.h2
            className="text-[28px] md:text-[40px] font-semibold text-[#1a1a1a] mb-4"
            initial={{ opacity: 0 }}
            animate={f6InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
          >
            Weight becomes clear
          </motion.h2>
          <motion.p
            className="text-[16px] text-[#888] mb-12"
            initial={{ opacity: 0 }}
            animate={f6InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Temple reflects it back. No advice. Just clarity.
          </motion.p>

          <AppWindow className="max-w-[540px] mx-auto">
            <div className="space-y-4">
              {/* User message with blue underline */}
              <ChatBubble
                isUser
                inView={f6InView}
                text={
                  <span className="relative">
                    <motion.span
                      className="absolute bottom-0 left-0 h-[2px] bg-blue-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={f6InView ? { width: '100%' } : {}}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      style={{ display: 'block', position: 'absolute' }}
                    />
                    Should I quit my job? It pays well but feels empty. Not sure if I'm ready.
                  </span>
                }
              />

              {/* Blue weight tooltip */}
              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0 }}
                animate={f6InView ? { opacity: 1 } : {}}
                transition={{ delay: 1 }}
              >
                <span className="text-[12px] text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Weight: Fear of the unknown
                </span>
              </motion.div>

              {/* AI reply */}
              <ChatBubble
                inView={f6InView}
                delay={1.2}
                text={
                  <span>
                    {aiReply}
                    {aiReply.length < 62 && f6InView && (
                      <motion.span
                        className="inline-block w-[2px] h-[16px] bg-[#999] ml-0.5 align-text-bottom"
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                    )}
                  </span>
                }
              />
            </div>
          </AppWindow>
        </div>
      </Section>

      {/* ═══ FRAME 7 — CTA ═══ */}
      <Section gradient="linear-gradient(180deg, #ffffff 0%, #E8F4FD 20%, #FFF1F0 40%, #FEF5E7 60%, #F0F8FF 80%, #ffffff 100%)">
        <div ref={frame7Ref} className="max-w-2xl w-full mx-auto text-center">
          <motion.h2
            className="text-[36px] md:text-[52px] font-bold text-[#1a1a1a] mb-4 leading-[1.15]"
            initial={{ opacity: 0, y: 20 }}
            animate={f7InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Clarity, not chatter.
          </motion.h2>
          <motion.p
            className="text-[18px] md:text-[22px] text-[#666] font-light mb-12 max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={f7InView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Temple doesn't tell you what to think. It helps you see what you already know.
          </motion.p>

          {/* Feature bullets */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-14"
            initial={{ opacity: 0, y: 10 }}
            animate={f7InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {[
              { color: 'bg-red-200 text-red-800', label: 'Surface assumptions' },
              { color: 'bg-yellow-200 text-yellow-800', label: 'Name tensions' },
              { color: 'bg-green-200 text-green-800', label: 'Find truths' },
              { color: 'bg-blue-200 text-blue-800', label: 'Feel the weight' },
            ].map((item) => (
              <span
                key={item.label}
                className={`px-4 py-2 rounded-full text-[13px] font-medium ${item.color}`}
              >
                {item.label}
              </span>
            ))}
          </motion.div>

          <motion.button
            className="px-10 py-4 bg-[#1a1a1a] text-white rounded-full text-[17px] font-medium hover:bg-[#333] transition-all shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-[1.02]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={f7InView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            onClick={() => window.location.href = '/chat'}
          >
            Start reflecting
          </motion.button>
        </div>
      </Section>

      {/* ═══ Footer ═══ */}
      <footer className="py-10 text-center border-t border-[#f0f0f0] bg-white">
        <p className="text-[12px] text-[#bbb] tracking-[0.15em] uppercase">
          Built in LA &nbsp;·&nbsp;{' '}
          <a href="/privacy-policy" className="hover:text-[#999] transition-colors underline">Privacy</a>
        </p>
      </footer>
    </div>
  );
}
