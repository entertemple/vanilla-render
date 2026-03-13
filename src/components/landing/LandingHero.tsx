import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';

const FONT_HEADING = "'DM Sans', Arial, sans-serif";
const FONT_BODY = "'Geist Mono', monospace";

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

export default function LandingHero() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailContinue = async () => {
    if (!email.trim()) return;
    // Navigate to signup with email pre-filled
    navigate(`/signup?email=${encodeURIComponent(email)}`);
  };

  const handleGoogleSignIn = () => {
    // Will be wired to Google OAuth
    navigate('/login');
  };

  return (
    <section className="min-h-screen flex items-center px-6 md:px-12 lg:px-20 pt-[100px] pb-20">
      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* LEFT COLUMN — Copy + Signup */}
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1
            className="text-foreground mb-4"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Built for clarity.
          </h1>

          <p
            className="text-muted-foreground mb-10"
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
            className="text-muted-foreground max-w-[320px]"
            style={{ fontFamily: FONT_BODY, fontSize: '0.62rem', lineHeight: 1.5 }}
          >
            By continuing you agree to Temple's{' '}
            <a href="/terms-of-service" className="underline hover:text-foreground transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy-policy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
          </p>
        </motion.div>

        {/* RIGHT COLUMN — Conversation Preview Card */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            className="rounded-[20px] p-6 md:p-8 overflow-hidden max-h-[680px] overflow-y-auto"
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
              scrollbarWidth: 'none',
            }}
          >
            {/* User message */}
            <div className="flex justify-end mb-8">
              <div
                className="rounded-2xl px-5 py-3.5 max-w-[85%]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: FONT_BODY,
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.6,
                }}
              >
                {PREVIEW_USER_MSG}
              </div>
            </div>

            {/* Temple response */}
            <div className="space-y-6">
              {/* Anchor */}
              <h2
                style={{
                  fontFamily: FONT_HEADING,
                  fontSize: 'clamp(1.8rem, 3vw, 3rem)',
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: 1.15,
                }}
              >
                {PREVIEW_ANCHOR}
              </h2>

              {/* Keywords */}
              <div className="flex items-center gap-2">
                {PREVIEW_KEYWORDS.map((kw, i) => (
                  <span key={kw}>
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.45)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase' as const,
                      }}
                    >
                      {kw}
                    </span>
                    {i < PREVIEW_KEYWORDS.length - 1 && (
                      <span style={{ color: 'rgba(255,255,255,0.25)', margin: '0 6px' }}>·</span>
                    )}
                  </span>
                ))}
              </div>

              {/* Body */}
              <div className="space-y-2">
                {PREVIEW_BODY.map((line) => (
                  <p
                    key={line}
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 1.9,
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>

              {/* Invitation */}
              <p
                style={{
                  fontFamily: FONT_HEADING,
                  fontSize: '1.3rem',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.4,
                }}
              >
                {PREVIEW_INVITATION}
              </p>

              {/* GO DEEPER card */}
              <div
                className="rounded-[15px] p-5 mt-4"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p
                  className="mb-3"
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                  }}
                >
                  GO DEEPER
                </p>
                <p style={{ fontFamily: FONT_BODY, fontSize: '0.8rem', lineHeight: 1.8 }}>
                  {PREVIEW_USER_MSG.split(/(\bsomething to say\b|\bwithout it going wrong\b|\bI don't know how to say it\b)/g).map((part, i) => {
                    const isHighlighted = GO_DEEPER_PHRASES.some(p => p.text === part);
                    return (
                      <span
                        key={i}
                        style={{
                          color: isHighlighted ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                          fontWeight: isHighlighted ? 600 : 400,
                          cursor: isHighlighted ? 'pointer' : 'default',
                        }}
                      >
                        {part}
                      </span>
                    );
                  })}
                </p>
              </div>

              {/* TO PONDER card */}
              <div
                className="rounded-[15px] p-5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p
                  className="mb-2"
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                  }}
                >
                  TO PONDER
                </p>
                <p
                  className="mb-1"
                  style={{
                    fontFamily: FONT_HEADING,
                    fontSize: '1.1rem',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  Phoebe Bridgers — Savior Complex
                </p>
                <p
                  className="mb-2"
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.5,
                  }}
                >
                  The story we tell ourselves about why we stay quiet.
                </p>
                <a
                  href="https://open.spotify.com/search/Phoebe%20Bridgers%20Savior%20Complex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '0.62rem',
                    color: 'rgba(255,255,255,0.3)',
                    textDecoration: 'underline',
                  }}
                >
                  Listen on Spotify →
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
