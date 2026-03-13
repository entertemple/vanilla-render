import { useState } from 'react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const FONT_HEADING = "'DM Sans', Arial, sans-serif";
const FONT_BODY = "'Geist Mono', monospace";

// Minimal Temple glyphs as SVG
function TempleGlyphSimple() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1" className="text-cnx-grey">
      <circle cx="16" cy="16" r="10" />
      <line x1="16" y1="6" x2="16" y2="26" />
    </svg>
  );
}

function TempleGlyphComplex() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1" className="text-cnx-grey">
      <circle cx="16" cy="16" r="10" />
      <line x1="16" y1="6" x2="16" y2="26" />
      <line x1="6" y1="16" x2="26" y2="16" />
      <circle cx="16" cy="16" r="4" />
    </svg>
  );
}

const TRIAL_FEATURES = [
  'Every conversation, every beat',
  'Full beat system',
  'Daily Oracle card',
  'Silence timer',
  'History saved',
];

const PRO_FEATURES = [
  'Everything in Trial, plus:',
  'Unlimited conversations',
  'Full conversation history',
  'Visual anchor journal',
  'Your interior life across 365 days',
];

export default function LandingPricing() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section ref={ref} className="py-48 px-6 md:px-12 max-w-[760px] mx-auto">
      {/* Intro */}
      <motion.p
        className="text-center mb-16 tracking-[0.2em] uppercase text-muted-foreground"
        style={{ fontFamily: FONT_BODY, fontSize: '0.7rem', fontWeight: 400 }}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        For when you need to hear yourself think.
      </motion.p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* TRIAL */}
        <motion.div
          className="flex flex-col rounded-[4px] border border-border bg-card p-8 dark:border-[rgba(255,255,255,0.08)] dark:bg-[hsl(0,0%,8%)]"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="flex justify-center mb-6">
            <TempleGlyphSimple />
          </div>

          <p
            className="text-muted-foreground uppercase tracking-[0.15em] mb-1"
            style={{ fontFamily: FONT_BODY, fontSize: '0.65rem' }}
          >
            Trial
          </p>
          <p
            className="text-foreground mb-4"
            style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', lineHeight: 1.6 }}
          >
            The full experience, free for 7 days.
          </p>

          <p
            className="text-foreground mb-1"
            style={{ fontFamily: FONT_HEADING, fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, lineHeight: 1 }}
          >
            $0
          </p>
          <p
            className="text-muted-foreground mb-8"
            style={{ fontFamily: FONT_BODY, fontSize: '0.7rem' }}
          >
            No card required
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 border border-border text-foreground rounded-none hover:bg-muted transition-colors mb-8"
            style={{ fontFamily: FONT_BODY, fontSize: '0.75rem', fontWeight: 400 }}
          >
            Start your trial
          </button>

          <ul className="space-y-3 mt-auto">
            {TRIAL_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5" style={{ fontFamily: FONT_BODY, fontSize: '0.72rem', lineHeight: 1.7 }}>
                <Check size={14} className="text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                <span className="text-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* PRO */}
        <motion.div
          className="flex flex-col rounded-[4px] border border-border bg-card p-8 dark:border-[rgba(255,255,255,0.12)] dark:bg-[hsl(0,0%,10%)]"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="flex justify-center mb-6">
            <TempleGlyphComplex />
          </div>

          <p
            className="text-muted-foreground uppercase tracking-[0.15em] mb-1"
            style={{ fontFamily: FONT_BODY, fontSize: '0.65rem' }}
          >
            Pro
          </p>
          <p
            className="text-foreground mb-4"
            style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', lineHeight: 1.6 }}
          >
            Unlimited access to your interior life.
          </p>

          {/* Price with toggle */}
          <div className="mb-1">
            <p
              className="text-foreground"
              style={{ fontFamily: FONT_HEADING, fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, lineHeight: 1 }}
            >
              {isAnnual ? '$99' : '$15'}
            </p>
          </div>
          <p
            className="text-muted-foreground mb-3"
            style={{ fontFamily: FONT_BODY, fontSize: '0.7rem' }}
          >
            {isAnnual ? 'USD / year · Save $81' : 'USD / month'}
          </p>

          {/* Toggle */}
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`text-xs ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
              style={{ fontFamily: FONT_BODY, fontSize: '0.65rem' }}
            >
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span
              className={`text-xs ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
              style={{ fontFamily: FONT_BODY, fontSize: '0.65rem' }}
            >
              Annual
            </span>
          </div>

          {!isAnnual && (
            <p
              className="text-muted-foreground mb-6"
              style={{ fontFamily: FONT_BODY, fontSize: '0.62rem' }}
            >
              Pay annually to save 46%.
            </p>
          )}
          {isAnnual && <div className="mb-6" />}

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 rounded-none bg-foreground text-background hover:opacity-90 transition-opacity mb-8"
            style={{ fontFamily: FONT_BODY, fontSize: '0.75rem', fontWeight: 400 }}
          >
            Enter Temple
          </button>

          <ul className="space-y-3 mt-auto">
            {PRO_FEATURES.map((f, i) => (
              <li key={f} className="flex items-start gap-2.5" style={{ fontFamily: FONT_BODY, fontSize: '0.72rem', lineHeight: 1.7 }}>
                <Check size={14} className={`mt-0.5 shrink-0 ${i === 0 ? 'text-transparent' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                <span className={`text-foreground ${i === 0 ? 'text-muted-foreground' : ''}`}>{f}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Footer note */}
      <motion.p
        className="text-center mt-12 text-muted-foreground"
        style={{ fontFamily: FONT_BODY, fontSize: '0.68rem' }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        Cancel anytime. Your history stays.
      </motion.p>
    </section>
  );
}