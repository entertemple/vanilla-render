import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import WordmarkLight from '../components/WordmarkLight';
import WordmarkDark from '../components/WordmarkDark';

const features = [
  'Unlimited conversations',
  'Full beat system',
  'Daily Oracle card',
  'Silence timer',
  'Visual anchor journal',
];

export default function Pricing() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { plan } = useProfile();
  const navigate = useNavigate();
  const isDark = theme !== 'light';

  const isPro = plan === 'pro' || plan === 'pro_annual';

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedColor = isDark ? 'text-[rgba(255,255,255,0.35)]' : 'text-[rgba(0,0,0,0.35)]';

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link to="/" className="w-[100px]">
          {isDark ? <WordmarkLight /> : <WordmarkDark />}
        </Link>
        {!user && (
          <div className="flex items-center gap-4">
            <Link to="/login" className={`font-['Geist_Mono',_monospace] text-[0.75rem] ${mutedColor} hover:opacity-60 transition-opacity`}>Log In</Link>
            <Link to="/signup" className={`font-['Geist_Mono',_monospace] text-[0.75rem] px-4 py-1.5 rounded-full border ${isDark ? 'border-[rgba(255,255,255,0.15)] text-white' : 'border-[rgba(0,0,0,0.15)] text-gray-900'}`}>Sign Up</Link>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <p
          className={`${textColor} text-center mb-12`}
          style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '1.75rem' }}
        >
          For when you need to hear yourself think.
        </p>

        {isPro ? (
          <div className="text-center">
            <p
              className={`${textColor} opacity-70 mb-6`}
              style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '1.5rem' }}
            >
              You're on Pro.
            </p>
            <button
              onClick={() => navigate('/chat')}
              className={`font-['Geist_Mono',_monospace] text-[0.75rem] px-5 py-2 rounded-full border ${isDark ? 'border-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.06)]' : 'border-[rgba(0,0,0,0.15)] text-gray-900 hover:bg-[rgba(0,0,0,0.04)]'} transition-colors`}
            >
              Manage subscription →
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-4 max-w-[640px] w-full">
              {/* Monthly */}
              <div
                className="flex-1 rounded-[16px] p-8 flex flex-col"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.1em] opacity-40" style={{ color: isDark ? '#fff' : '#000' }}>MONTHLY</p>
                <p className={`${textColor} my-2`} style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '3rem' }}>$15</p>
                <p className="font-['Geist_Mono',_monospace] text-[0.75rem] opacity-35" style={{ color: isDark ? '#fff' : '#000' }}>per month</p>
                <div className="my-5 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                <div className="space-y-2 flex-1">
                  {features.map(f => (
                    <p key={f} className="font-['Geist_Mono',_monospace] text-[0.75rem] opacity-55 leading-[2]" style={{ color: isDark ? '#fff' : '#000' }}>· {f}</p>
                  ))}
                </div>
                <button
                  onClick={() => toast('Coming soon.')}
                  className={`w-full mt-6 py-3 rounded-[12px] font-['Geist_Mono',_monospace] text-[0.75rem] transition-colors ${textColor}`}
                  style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}` }}
                >
                  Choose Monthly
                </button>
              </div>

              {/* Annual */}
              <div
                className="flex-1 rounded-[16px] p-8 flex flex-col relative"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(200,150,60,0.25)',
                }}
              >
                <span
                  className="absolute top-4 right-4 font-['Geist_Mono',_monospace] text-[0.6rem] px-2 py-1 rounded"
                  style={{ color: 'rgba(200,150,60,1)', background: 'rgba(200,150,60,0.12)' }}
                >
                  Save $81
                </span>
                <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.1em] opacity-40" style={{ color: isDark ? '#fff' : '#000' }}>ANNUAL</p>
                <p className={`${textColor} my-2`} style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '3rem' }}>$99</p>
                <p className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-35" style={{ color: isDark ? '#fff' : '#000' }}>per year · $8.25/mo</p>
                <div className="my-5 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                <div className="space-y-2 flex-1">
                  {[...features, 'Full year visual journal'].map(f => (
                    <p key={f} className="font-['Geist_Mono',_monospace] text-[0.75rem] opacity-55 leading-[2]" style={{ color: isDark ? '#fff' : '#000' }}>· {f}</p>
                  ))}
                </div>
                <button
                  onClick={() => toast('Coming soon.')}
                  className={`w-full mt-6 py-3 rounded-[12px] font-['Geist_Mono',_monospace] text-[0.75rem] transition-colors ${textColor}`}
                  style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}
                >
                  Choose Annual
                </button>
              </div>
            </div>

            <p className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-25 text-center mt-6" style={{ color: isDark ? '#fff' : '#000' }}>
              Cancel anytime. Your history stays.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
