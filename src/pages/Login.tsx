import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WordmarkLight from '@/components/WordmarkLight';
import WordmarkDark from '@/components/WordmarkDark';
import GoogleButton from '@/components/GoogleButton';
import AuthDivider from '@/components/AuthDivider';

const FONT = "'DM Sans', Arial, sans-serif";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/chat', { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/chat');
    }
  };

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
        Built for clarity
      </h1>
      <p
        className="text-muted-foreground text-center mb-10"
        style={{ fontFamily: FONT, fontSize: '16px', fontWeight: 400 }}
      >
        Unravel with Temple
      </p>

      <div
        className="w-full max-w-[400px] rounded-3xl border border-border p-7"
        style={{ background: 'transparent' }}
      >
        <GoogleButton />
        <AuthDivider />
        <form onSubmit={handleLogin} className="space-y-3">
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
            {loading ? '...' : 'Log in'}
          </button>
        </form>

        <p
          className="text-muted-foreground text-center mt-5"
          style={{ fontFamily: FONT, fontSize: '13px' }}
        >
          Don't have an account?{' '}
          <Link to="/signup" className="text-foreground hover:opacity-80 transition-opacity underline">
            Sign up
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
