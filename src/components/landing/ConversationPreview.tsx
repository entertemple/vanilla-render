import { motion } from 'motion/react';

const FONT_HEADING = "'DM Sans', Arial, sans-serif";
const FONT_BODY = "'Geist Mono', monospace";
const FONT_SERIF = "'DM Serif Display', Georgia, serif";

const PREVIEW_USER_MSG = "I have something to say and I don't know how to say it without it going wrong.";
const PREVIEW_ANCHOR = "Silence is also a sentence.";
const PREVIEW_KEYWORDS = ["REHEARSAL", "THE UNSENT", "TIMING"];
const PREVIEW_BODY = [
  "You have written this conversation seventeen times in your head.",
  "What you're really asking is whether you will survive being honest.",
  "You will. And so will they.",
];
const PREVIEW_INVITATION = "What becomes possible the moment you finally say it?";

const GO_DEEPER_PHRASES = [
  { text: "something to say", highlighted: true },
  { text: "without it going wrong", highlighted: true },
  { text: "I don't know how to say it", highlighted: true },
];

const INITIAL_DELAY = 0.6;
const USER_MSG_DELAY = INITIAL_DELAY;
const ANCHOR_DELAY = USER_MSG_DELAY + 1.2;
const KEYWORDS_DELAY = ANCHOR_DELAY + 0.8;
const BODY_START_DELAY = KEYWORDS_DELAY + 0.5;
const BODY_STAGGER = 0.35;
const INVITATION_DELAY = BODY_START_DELAY + PREVIEW_BODY.length * BODY_STAGGER + 0.6;
const GO_DEEPER_DELAY = INVITATION_DELAY + 1.0;
const TO_PONDER_DELAY = GO_DEEPER_DELAY + 0.6;

export default function ConversationPreview() {
  return (
    <div className="w-full max-w-[700px] mx-auto">
      <div className="rounded-2xl p-8 md:p-10 bg-card border border-border dark:bg-[rgba(30,30,30,0.95)] dark:border-[rgba(255,255,255,0.12)]">
        {/* User message */}
        <motion.div
          className="flex justify-end mb-8"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: USER_MSG_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            className="rounded-2xl px-5 py-3.5 max-w-[85%] bg-muted dark:bg-[rgba(255,255,255,0.06)] border border-border dark:border-[rgba(255,255,255,0.08)]"
            style={{ fontFamily: FONT_BODY, fontSize: '0.9rem', lineHeight: 1.6 }}
          >
            <span className="text-foreground">{PREVIEW_USER_MSG}</span>
          </div>
        </motion.div>

        {/* Temple response */}
        <div className="space-y-6">
          {/* Anchor */}
          <motion.h2
            className="text-foreground"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.4, delay: ANCHOR_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: FONT_SERIF, fontSize: '2.5rem', fontWeight: 400, lineHeight: 1.15 }}
          >
            {PREVIEW_ANCHOR}
          </motion.h2>

          {/* Keywords */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: KEYWORDS_DELAY }}
          >
            {PREVIEW_KEYWORDS.map((kw, i) => (
              <span key={kw}>
                <span
                  className="text-muted-foreground"
                  style={{ fontFamily: FONT_BODY, fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}
                >
                  {kw}
                </span>
                {i < PREVIEW_KEYWORDS.length - 1 && (
                  <span className="text-muted-foreground/40" style={{ margin: '0 6px' }}>·</span>
                )}
              </span>
            ))}
          </motion.div>

          {/* Body */}
          <div className="space-y-2">
            {PREVIEW_BODY.map((line, i) => (
              <motion.p
                key={line}
                className="text-foreground/80"
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: BODY_START_DELAY + i * BODY_STAGGER, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ fontFamily: FONT_HEADING, fontSize: '1rem', fontWeight: 600, lineHeight: 1.9 }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* Invitation */}
          <motion.p
            className="text-foreground/70"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.4, delay: INVITATION_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: FONT_SERIF, fontSize: '1.75rem', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.4 }}
          >
            {PREVIEW_INVITATION}
          </motion.p>

          {/* GO DEEPER */}
          <motion.div
            className="rounded-[15px] p-5 mt-4 bg-muted dark:bg-[rgba(255,255,255,0.04)] border border-border dark:border-[rgba(255,255,255,0.08)]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: GO_DEEPER_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="mb-3 text-muted-foreground" style={{ fontFamily: FONT_BODY, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
              GO DEEPER
            </p>
            <p className="text-foreground/80" style={{ fontFamily: FONT_BODY, fontSize: '0.8rem', lineHeight: 1.8 }}>
              {PREVIEW_USER_MSG.split(/(\bsomething to say\b|\bwithout it going wrong\b|\bI don't know how to say it\b)/g).map((part, i) => {
                const isHighlighted = GO_DEEPER_PHRASES.some(p => p.text === part);
                return (
                  <span
                    key={i}
                    className={isHighlighted ? 'text-foreground font-semibold' : 'text-muted-foreground/50'}
                    style={{ cursor: isHighlighted ? 'pointer' : 'default' }}
                  >
                    {part}
                  </span>
                );
              })}
            </p>
          </motion.div>

          {/* TO PONDER */}
          <motion.div
            className="rounded-[15px] p-5 bg-muted dark:bg-[rgba(255,255,255,0.04)] border border-border dark:border-[rgba(255,255,255,0.08)]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: TO_PONDER_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="mb-2 text-muted-foreground" style={{ fontFamily: FONT_BODY, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
              TO PONDER
            </p>
            <p className="mb-1 text-foreground/75" style={{ fontFamily: FONT_SERIF, fontSize: '1.1rem', fontWeight: 400, fontStyle: 'italic' }}>
              Phoebe Bridgers — Savior Complex
            </p>
            <p className="mb-2 text-muted-foreground" style={{ fontFamily: FONT_BODY, fontSize: '0.72rem', lineHeight: 1.5 }}>
              The story we tell ourselves about why we stay quiet.
            </p>
            <a
              href="https://open.spotify.com/search/Phoebe%20Bridgers%20Savior%20Complex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-muted-foreground/60 underline"
              style={{ fontFamily: FONT_BODY, fontSize: '0.62rem' }}
            >
              Listen on Spotify →
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
