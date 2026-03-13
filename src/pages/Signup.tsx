import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WordmarkLight from '@/components/WordmarkLight';
import WordmarkDark from '@/components/WordmarkDark';

const FONT = "'DM Sans', Arial, sans-serif";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
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
    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <button onClick={() => navigate('/landing')} className="mb-12 outline-none">
          <WordmarkLight className="h-6 dark:hidden" />
          <WordmarkDark className="h-6 hidden dark:block" />
        </button>

        <div
          className="w-full max-w-[400px] rounded-3xl border border-border p-7 text-center"
          style={{ background: 'transparent' }}
        >
          <h2
            className="text-foreground mb-3"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '24px', fontWeight: 400 }}
          >
            Check your email
          </h2>
          <p
            className="text-muted-foreground mb-6"
            style={{ fontFamily: FONT, fontSize: '14px', lineHeight: 1.6 }}
          >
            We sent a verification link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.
          </p>
          <Link
            to="/login"
            className="inline-block w-full h-[52px] leading-[52px] rounded-2xl bg-foreground text-background hover:opacity-90 transition-opacity"
            style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 500 }}
          >
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <button onClick={() => navigate('/landing')} className="mb-12 outline-none">
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
        Begin here
      </h1>
      <p
        className="text-muted-foreground text-center mb-10"
        style={{ fontFamily: FONT, fontSize: '16px', fontWeight: 400 }}
      >
        Create your Temple account
      </p>

      <div
        className="w-full max-w-[400px] rounded-3xl border border-border p-7"
        style={{ background: 'transparent' }}
      >
        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full h-[52px] px-5 rounded-2xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors"
            style={{ fontFamily: FONT, fontSize: '15px' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
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
            <p className="text-destructive text-center" style={{ fontFamily: FONT, fontSize: '13px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] rounded-2xl bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 500 }}
          >
            {loading ? '...' : 'Create account'}
          </button>
        </form>

        <p
          className="text-muted-foreground text-center mt-5"
          style={{ fontFamily: FONT, fontSize: '13px' }}
        >
          Already have an account?{' '}
          <Link to="/login" className="text-foreground hover:opacity-80 transition-opacity underline">
            Log in
          </Link>
        </p>

        <p
          className="text-muted-foreground text-center mt-4"
          style={{ fontFamily: FONT, fontSize: '12px', lineHeight: 1.6 }}
        >
          By continuing, you acknowledge Temple's{' '}
          <Link to="/privacy-policy" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>
          {' '}and agree to the{' '}
          <Link to="/terms-of-service" className="underline hover:text-foreground transition-colors">Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}
