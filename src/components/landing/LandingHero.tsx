import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const FONT_HEADING = "'DM Sans', Arial, sans-serif";
const FONT_BODY = "'Geist Mono', monospace";
const FONT_SERIF = "'DM Serif Display', Georgia, serif";

// Static conversation preview data
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

// Animation timing constants (matching live chat)
const INITIAL_DELAY = 0.6;
const USER_MSG_DELAY = INITIAL_DELAY;
const ANCHOR_DELAY = USER_MSG_DELAY + 1.2;
const KEYWORDS_DELAY = ANCHOR_DELAY + 0.8;
const BODY_START_DELAY = KEYWORDS_DELAY + 0.5;
const BODY_STAGGER = 0.35;
const INVITATION_DELAY = BODY_START_DELAY + PREVIEW_BODY.length * BODY_STAGGER + 0.6;
const GO_DEEPER_DELAY = INVITATION_DELAY + 1.0;
const TO_PONDER_DELAY = GO_DEEPER_DELAY + 0.6;

export default function LandingHero() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');

  const handleEmailContinue = async () => {
    if (!email.trim()) return;
    navigate(`/signup?email=${encodeURIComponent(email)}`);
  };

  const handleGoogleSignIn = () => {
    navigate('/login');
  };

  return (
    <section className="min-h-screen flex items-center px-6 md:px-12 lg:px-20 pt-[100px] pb-20">
      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* LEFT COLUMN — Copy + Signup */}
        <motion.div
          className="flex flex-col items-center lg:items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1
            className="text-foreground mb-4 text-center"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Built for clarity.
          </h1>

          <p
            className="text-muted-foreground mb-10 text-center"
            style={{
              fontFamily: FONT_BODY,
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              lineHeight: 1.6,
            }}
          >
            Unravel with Temple.
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full max-w-[320px] py-3.5 rounded-full border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-3 mb-4"
            style={{ fontFamily: FONT_BODY, fontSize: '0.82rem' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 max-w-[320px] mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground" style={{ fontFamily: FONT_BODY, fontSize: '0.7rem' }}>or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full max-w-[320px] py-3.5 px-4 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground mb-3 outline-none focus:border-foreground transition-colors"
            style={{ fontFamily: FONT_BODY, fontSize: '0.82rem' }}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
          />

          <button
            onClick={handleEmailContinue}
            className="w-full max-w-[320px] py-3.5 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity mb-4"
            style={{ fontFamily: FONT_BODY, fontSize: '0.82rem' }}
          >
            Continue with email
          </button>

          {/* Legal */}
          <p
            className="text-muted-foreground max-w-[320px] text-center"
            style={{ fontFamily: FONT_BODY, fontSize: '0.62rem', lineHeight: 1.5 }}
          >
            By continuing you agree to Temple's{' '}
            <a href="/terms-of-service" className="underline hover:text-foreground transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy-policy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
          </p>
        </motion.div>

        {/* RIGHT COLUMN — Animated Conversation Preview Card */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="rounded-2xl p-8 md:p-10 bg-card border border-border dark:bg-[rgba(30,30,30,0.95)] dark:border-[rgba(255,255,255,0.12)]">
            {/* User message */}
            <motion.div
              className="flex justify-end mb-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: USER_MSG_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div
                className="rounded-2xl px-5 py-3.5 max-w-[85%] bg-muted dark:bg-[rgba(255,255,255,0.06)] border border-border dark:border-[rgba(255,255,255,0.08)]"
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                }}
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: ANCHOR_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: '2.5rem',
                  fontWeight: 400,
                  lineHeight: 1.15,
                }}
              >
                {PREVIEW_ANCHOR}
              </motion.h2>

              {/* Keywords */}
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: KEYWORDS_DELAY }}
              >
                {PREVIEW_KEYWORDS.map((kw, i) => (
                  <span key={kw}>
                    <span
                      className="text-muted-foreground"
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase' as const,
                      }}
                    >
                      {kw}
                    </span>
                    {i < PREVIEW_KEYWORDS.length - 1 && (
                      <span className="text-muted-foreground/40" style={{ margin: '0 6px' }}>·</span>
                    )}
                  </span>
                ))}
              </motion.div>

              {/* Body — staggered lines */}
              <div className="space-y-2">
                {PREVIEW_BODY.map((line, i) => (
                  <motion.p
                    key={line}
                    className="text-foreground/80"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: BODY_START_DELAY + i * BODY_STAGGER, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                      fontFamily: FONT_HEADING,
                      fontSize: '1rem',
                      fontWeight: 600,
                      lineHeight: 1.9,
                    }}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>

              {/* Invitation */}
              <motion.p
                className="text-foreground/70"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: INVITATION_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: '1.75rem',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                }}
              >
                {PREVIEW_INVITATION}
              </motion.p>

              {/* GO DEEPER card */}
              <motion.div
                className="rounded-[15px] p-5 mt-4 bg-muted dark:bg-[rgba(255,255,255,0.04)] border border-border dark:border-[rgba(255,255,255,0.08)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: GO_DEEPER_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <p
                  className="mb-3 text-muted-foreground"
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                  }}
                >
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

              {/* TO PONDER card */}
              <motion.div
                className="rounded-[15px] p-5 bg-muted dark:bg-[rgba(255,255,255,0.04)] border border-border dark:border-[rgba(255,255,255,0.08)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: TO_PONDER_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <p
                  className="mb-2 text-muted-foreground"
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                  }}
                >
                  TO PONDER
                </p>
                <p
                  className="mb-1 text-foreground/75"
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: '1.1rem',
                    fontWeight: 400,
                    fontStyle: 'italic',
                  }}
                >
                  Phoebe Bridgers — Savior Complex
                </p>
                <p
                  className="mb-2 text-muted-foreground"
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '0.72rem',
                    lineHeight: 1.5,
                  }}
                >
                  The story we tell ourselves about why we stay quiet.
                </p>
                <a
                  href="https://open.spotify.com/search/Phoebe%20Bridgers%20Savior%20Complex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-muted-foreground/60 underline"
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '0.62rem',
                  }}
                >
                  Listen on Spotify →
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
