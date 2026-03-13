import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const FONT_BODY = "'DM Sans', Arial, sans-serif";

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
    <section className="min-h-screen flex items-start justify-start px-6 md:px-12 lg:px-20 pt-[140px] pb-20">
      <motion.div
        className="flex flex-col items-start max-w-[600px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1
          className="text-foreground mb-4"
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          Built for clarity
        </h1>

        <p
          className="text-muted-foreground mb-12"
          style={{
            fontFamily: FONT_BODY,
            fontSize: 'clamp(16px, 1.5vw, 20px)',
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Unravel with Temple
        </p>

        {/* Login card */}
        <div
          className="w-full max-w-[480px] rounded-2xl border border-border p-8 md:p-10"
          style={{ background: 'transparent' }}
        >
          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-4 rounded-xl border border-border text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-3 mb-5"
            style={{ fontFamily: FONT_BODY, fontSize: '16px', fontWeight: 400 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground uppercase tracking-widest" style={{ fontFamily: FONT_BODY, fontSize: '12px' }}>or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full py-4 px-5 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground mb-4 outline-none focus:border-foreground transition-colors"
            style={{ fontFamily: FONT_BODY, fontSize: '16px' }}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
          />

          <button
            onClick={handleEmailContinue}
            className="w-full py-4 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity mb-6"
            style={{ fontFamily: FONT_BODY, fontSize: '16px', fontWeight: 500 }}
          >
            Continue with email
          </button>

          {/* Legal */}
          <p
            className="text-muted-foreground text-center"
            style={{ fontFamily: FONT_BODY, fontSize: '12px', lineHeight: 1.6 }}
          >
            By continuing, you acknowledge Temple's{' '}
            <a href="/privacy-policy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
            {' '}and agree to the{' '}
            <a href="/terms-of-service" className="underline hover:text-foreground transition-colors">Terms of Service</a>.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
