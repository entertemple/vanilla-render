import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import WordmarkLight from '@/components/WordmarkLight';
import WordmarkDark from '@/components/WordmarkDark';
import { showToast } from '@/components/AppToast';

const FONT = "'DM Sans', Arial, sans-serif";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isUpdateMode = searchParams.get('mode') === 'update';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle recovery event from URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      // Supabase will auto-set the session from the recovery link
    }
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?mode=update`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
      setResendCooldown(60);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?mode=update`,
    });
    setResendCooldown(60);
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      showToast('Password updated.');
      navigate('/chat', { replace: true });
    }
  };

  // Update mode — set new password
  if (isUpdateMode) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <button onClick={() => navigate('/')} className="mb-12 outline-none">
          <WordmarkLight className="h-6 dark:hidden" />
          <WordmarkDark className="h-6 hidden dark:block" />
        </button>

        <h1
          className="text-foreground text-center mb-2"
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          Choose a new password
        </h1>
        <p className="text-muted-foreground text-center mb-10" style={{ fontFamily: FONT, fontSize: '16px' }}>
          Enter a new password below
        </p>

        <div className="w-full max-w-[400px] rounded-3xl border border-border p-7" style={{ background: 'transparent' }}>
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              className="w-full h-[52px] px-5 rounded-2xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors"
              style={{ fontFamily: FONT, fontSize: '15px' }}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              className="w-full h-[52px] px-5 rounded-2xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors"
              style={{ fontFamily: FONT, fontSize: '15px' }}
            />

            {error && (
              <p className="text-destructive text-center" style={{ fontFamily: FONT, fontSize: '13px' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] rounded-2xl bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 500 }}
            >
              {loading ? '...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Request mode — sent confirmation
  if (sent) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <button onClick={() => navigate('/')} className="mb-12 outline-none">
          <WordmarkLight className="h-6 dark:hidden" />
          <WordmarkDark className="h-6 hidden dark:block" />
        </button>

        <div className="w-full max-w-[400px] rounded-3xl border border-border p-7 text-center" style={{ background: 'transparent' }}>
          <div className="mb-4">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="mx-auto text-muted-foreground">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>

          <h2
            className="text-foreground mb-3"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '24px', fontWeight: 400 }}
          >
            Check your inbox
          </h2>
          <p className="text-muted-foreground mb-6" style={{ fontFamily: FONT, fontSize: '14px', lineHeight: 1.6 }}>
            We sent a reset link to <strong className="text-foreground">{email}</strong>
          </p>

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className="w-full h-[52px] rounded-2xl bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 500 }}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
          </button>

          <p className="text-muted-foreground text-center mt-5" style={{ fontFamily: FONT, fontSize: '13px' }}>
            <Link to="/login" className="text-foreground hover:opacity-80 transition-opacity underline">
              ← Back to log in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Request mode — form
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <button onClick={() => navigate('/')} className="mb-12 outline-none">
        <WordmarkLight className="h-6 dark:hidden" />
        <WordmarkDark className="h-6 hidden dark:block" />
      </button>

      <h1
        className="text-foreground text-center mb-2"
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
        }}
      >
        Forgot your password
      </h1>
      <p className="text-muted-foreground text-center mb-10" style={{ fontFamily: FONT, fontSize: '16px' }}>
        We'll send a reset link
      </p>

      <div className="w-full max-w-[400px] rounded-3xl border border-border p-7" style={{ background: 'transparent' }}>
        <form onSubmit={handleRequestReset} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full h-[52px] px-5 rounded-2xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors"
            style={{ fontFamily: FONT, fontSize: '15px' }}
          />

          {error && (
            <p className="text-destructive text-center" style={{ fontFamily: FONT, fontSize: '13px' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] rounded-2xl bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 500 }}
          >
            {loading ? '...' : 'Send reset link'}
          </button>
        </form>

        <p className="text-muted-foreground text-center mt-5" style={{ fontFamily: FONT, fontSize: '13px' }}>
          <Link to="/login" className="text-foreground hover:opacity-80 transition-opacity underline">
            ← Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
