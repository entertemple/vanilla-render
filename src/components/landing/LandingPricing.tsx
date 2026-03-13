import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const FONT_HEADING = "'DM Sans', Arial, sans-serif";
const FONT_BODY = "'Geist Mono', monospace";

const FREE_FEATURES = [
  'Basic spiritual guidance',
  '10 messages per day',
  'Access to core teachings',
  'Community support',
];

const PRO_FEATURES = [
  'Unlimited messages',
  'Advanced spiritual insights',
  'Priority response times',
  'Access to all teachings',
  'Personalized guidance',
  'Early access to new features',
  'Download conversation history',
  'Custom meditation guides',
];

export default function LandingPricing() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-48 px-6 md:px-12 max-w-[800px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FREE */}
        <motion.div
          className="rounded-2xl p-8 md:p-10 flex flex-col bg-card border border-border dark:bg-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.12)] dark:backdrop-blur-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-8">
            <p
              className="text-foreground uppercase tracking-[0.08em]"
              style={{ fontFamily: FONT_BODY, fontSize: '0.9rem', fontWeight: 600 }}
            >
              FREE
            </p>
          </div>

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
              forever
            </p>
          </div>

          <ul className="space-y-5 flex-1 mb-10">
            {FREE_FEATURES.map((f) => (
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
            CURRENT PLAN
          </button>
        </motion.div>

        {/* PRO */}
        <motion.div
          className="rounded-2xl p-8 md:p-10 flex flex-col bg-card border border-border dark:bg-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.15)] dark:backdrop-blur-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-8">
            <p
              className="text-foreground uppercase tracking-[0.08em]"
              style={{ fontFamily: FONT_BODY, fontSize: '0.9rem', fontWeight: 600 }}
            >
              PRO
            </p>
          </div>

          <div className="flex items-baseline gap-2 mb-10">
            <p
              className="text-foreground"
              style={{ fontFamily: FONT_HEADING, fontSize: '64px', fontWeight: 400, lineHeight: 1 }}
            >
              $12
            </p>
            <p
              className="text-muted-foreground"
              style={{ fontFamily: FONT_BODY, fontSize: '0.85rem' }}
            >
              per month
            </p>
          </div>

          <ul className="space-y-5 flex-1 mb-10">
            {PRO_FEATURES.map((f) => (
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
            UPGRADE TO PRO
          </button>
        </motion.div>
      </div>
    </section>
  );
}