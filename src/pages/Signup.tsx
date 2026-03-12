import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      navigate('/chat');
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-full max-w-md mx-auto px-8">
        <h1 className="text-[24px] font-light text-white text-center mb-10 font-['Inter',_sans-serif] tracking-[-0.02em]">
          Temple
        </h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-transparent border border-[rgba(255,255,255,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] outline-none text-[15px] font-['Inter',_sans-serif]"
            style={{ borderRadius: 0 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-transparent border border-[rgba(255,255,255,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] outline-none text-[15px] font-['Inter',_sans-serif]"
            style={{ borderRadius: 0 }}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-transparent border border-[rgba(255,255,255,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] outline-none text-[15px] font-['Inter',_sans-serif]"
            style={{ borderRadius: 0 }}
          />
          {error && (
            <p className="text-[13px] text-red-400 font-['Inter',_sans-serif]">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black border border-[rgba(255,255,255,0.15)] text-white text-[15px] font-['Inter',_sans-serif] hover:bg-[rgba(255,255,255,0.05)] transition-colors disabled:opacity-50"
            style={{ borderRadius: 0 }}
          >
            {loading ? '...' : 'Enter'}
          </button>
        </form>
        <p className="text-center mt-6 text-[13px] text-[rgba(255,255,255,0.4)] font-['Inter',_sans-serif]">
          Already have an account?{' '}
          <Link to="/login" className="text-[rgba(255,255,255,0.6)] hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
