import { useState } from 'react';
import { useNavigate } from 'react-router';
import LoginBackground from '../components/LoginBackground';
import { useTheme } from '../contexts/ThemeContext';

export default function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/chat');
  };

  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const inputBg = theme === 'light' ? 'bg-[rgba(255,255,255,0.2)]' : 'bg-[rgba(255,255,255,0.1)]';
  const borderColor = theme === 'light' ? 'border-[rgba(200,200,200,0.4)]' : 'border-[rgba(255,255,255,0.18)]';

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <LoginBackground />
      <div className={`relative z-10 w-full max-w-md mx-auto p-8 rounded-[32px] backdrop-blur-[64px] ${inputBg} border ${borderColor}`}>
        <h1 className={`text-2xl font-semibold ${textColor} text-center mb-6 font-['Inter',_sans-serif]`}>Welcome to Temple</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-[16px] ${inputBg} border ${borderColor} ${textColor} placeholder-gray-400 outline-none`}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-3 rounded-[16px] ${inputBg} border ${borderColor} ${textColor} placeholder-gray-400 outline-none`}
          />
          <button
            type="submit"
            className={`w-full py-3 rounded-[16px] bg-white/20 border ${borderColor} ${textColor} hover:bg-white/30 transition-colors font-['Inter',_sans-serif]`}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
