import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const FONT_HEADING = "'DM Sans', Arial, sans-serif";
const FONT_BODY = "'Geist Mono', monospace";

const TRIAL_FEATURES = [
  'Every conversation, every beat',
  'Full beat system',
  'Daily Oracle card',
  'Silence timer',
  'History saved',
];

const MEMBER_FEATURES = [
  'Everything in Trial, plus:',
  'Unlimited conversations',
  'Full conversation history',
  'Visual anchor journal',
  'Your interior life across 365 days',
];

function GlassPricingCard({
  children,
  delay,
  inView,
}: {
  children: React.ReactNode;
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.div
      className="rounded-2xl p-8 md:p-10 flex flex-col relative overflow-hidden"
      style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
    >
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: 'rgba(255,255,255,0.45)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 'inherit',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.06)',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'inherit',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)',
        }}
      />
      <div className="relative z-10 flex flex-col flex-1">{children}</div>
    </motion.div>
  );
}

export default function LandingPricing() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section ref={ref} className="py-48 px-6 md:px-12 max-w-[800px] mx-auto">
      <p
        className="text-center text-muted-foreground mb-16 uppercase tracking-[0.2em]"
        style={{ fontFamily: FONT_BODY, fontSize: '0.68rem' }}
      >
        For when you need to hear yourself think.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TRIAL */}
        <GlassPricingCard delay={0.1} inView={inView}>
          <div className="mb-2">
            <p
              className="text-foreground uppercase tracking-[0.08em]"
              style={{ fontFamily: FONT_BODY, fontSize: '0.9rem', fontWeight: 600 }}
            >
              TRIAL
            </p>
          </div>
          <p
            className="text-muted-foreground mb-8"
            style={{ fontFamily: FONT_BODY, fontSize: '0.72rem', lineHeight: 1.5 }}
          >
            Full experience, free for 7 days.
          </p>

          <div className="flex items-baseline gap-2 mb-10">
            <p
              className="text-foreground"
              style={{ fontFamily: FONT_HEADING, fontSize: '64px', fontWeight: 400, lineHeight: 1 }}
            >
              $0
            </p>
            <p
              className="text-muted-foreground"
              style={{ fontFamily: FONT_BODY, fontSize: '0.85rem' }}
            >
              USD
            </p>
          </div>

          <ul className="space-y-5 flex-1 mb-10">
            {TRIAL_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3" style={{ fontFamily: FONT_BODY, fontSize: '0.82rem', lineHeight: 1.5 }}>
                <Check size={16} className="text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                <span className="text-foreground font-semibold">{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors uppercase tracking-[0.1em]"
            style={{ fontFamily: FONT_BODY, fontSize: '0.72rem', fontWeight: 400 }}
          >
            START YOUR TRIAL
          </button>
        </GlassPricingCard>

        {/* MEMBER */}
        <GlassPricingCard delay={0.25} inView={inView}>
          <div className="mb-2">
            <p
              className="text-foreground uppercase tracking-[0.08em]"
              style={{ fontFamily: FONT_BODY, fontSize: '0.9rem', fontWeight: 600 }}
            >
              MEMBER
            </p>
          </div>
          <p
            className="text-muted-foreground mb-8"
            style={{ fontFamily: FONT_BODY, fontSize: '0.72rem', lineHeight: 1.5 }}
          >
            Unlimited access to your interior life.
          </p>

          <div className="flex items-baseline gap-2 mb-4">
            <p
              className="text-foreground"
              style={{ fontFamily: FONT_HEADING, fontSize: '64px', fontWeight: 400, lineHeight: 1 }}
            >
              {isAnnual ? '$99' : '$15'}
            </p>
            <p
              className="text-muted-foreground"
              style={{ fontFamily: FONT_BODY, fontSize: '0.85rem' }}
            >
              {isAnnual ? 'USD / year · Save $81' : 'USD / month'}
            </p>
          </div>

          <div className="flex items-center gap-3 mb-10">
            <span
              className="text-muted-foreground"
              style={{ fontFamily: FONT_BODY, fontSize: '0.68rem' }}
            >
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span
              className="text-muted-foreground"
              style={{ fontFamily: FONT_BODY, fontSize: '0.68rem' }}
            >
              Annual
            </span>
            {!isAnnual && (
              <span
                className="text-muted-foreground ml-1"
                style={{ fontFamily: FONT_BODY, fontSize: '0.62rem', opacity: 0.7 }}
              >
                Pay annually to save 46%.
              </span>
            )}
          </div>

          <ul className="space-y-5 flex-1 mb-10">
            {MEMBER_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3" style={{ fontFamily: FONT_BODY, fontSize: '0.82rem', lineHeight: 1.5 }}>
                <Check size={16} className="text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                <span className="text-foreground font-semibold">{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 rounded-full transition-colors uppercase tracking-[0.1em] bg-foreground text-background hover:opacity-90"
            style={{ fontFamily: FONT_BODY, fontSize: '0.72rem', fontWeight: 400 }}
          >
            ENTER TEMPLE
          </button>
        </GlassPricingCard>
      </div>
    </section>
  );
}
