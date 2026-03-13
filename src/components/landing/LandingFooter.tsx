import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FONT_HEADING = "'DM Sans', Arial, sans-serif";

export default function LandingFooter() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [showNewsletterInput, setShowNewsletterInput] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const pillClass = `inline-block px-5 py-2.5 rounded-full text-sm transition-colors cursor-pointer ${
    isDark
      ? 'bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.14)]'
      : 'bg-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.65)] hover:bg-[rgba(0,0,0,0.1)]'
  }`;

  const headerClass = `text-xs tracking-[0.15em] uppercase mb-5 ${
    isDark ? 'text-[rgba(255,255,255,0.35)]' : 'text-[rgba(0,0,0,0.35)]'
  }`;

  return (
    <footer className="px-8 md:px-16 pt-16 pb-16">
      {/* Footer columns */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
        {/* About */}
        <div>
          <p className={headerClass} style={{ fontFamily: "'Geist Mono', monospace" }}>about</p>
          <div className="flex flex-col items-start gap-3">
            <button onClick={() => navigate('/terms-of-service')} className={pillClass} style={{ fontFamily: FONT_HEADING }}>
              Terms of Service
            </button>
            <button onClick={() => navigate('/privacy-policy')} className={pillClass} style={{ fontFamily: FONT_HEADING }}>
              Privacy Notice
            </button>
          </div>
        </div>

        {/* Community */}
        <div>
          <p className={headerClass} style={{ fontFamily: "'Geist Mono', monospace" }}>community</p>
          <div className="flex flex-col items-start gap-3">
            <a href="#" className={pillClass} style={{ fontFamily: FONT_HEADING }}>Events</a>
            <a href="#" className={pillClass} style={{ fontFamily: FONT_HEADING }}>Sounds</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={pillClass} style={{ fontFamily: FONT_HEADING }}>
              Instagram
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className={headerClass} style={{ fontFamily: "'Geist Mono', monospace" }}>contact</p>
          <div className="flex flex-col items-start gap-3">
            {!showNewsletterInput ? (
              <button
                onClick={() => setShowNewsletterInput(true)}
                className={`relative rounded-2xl px-6 py-4 text-left transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)]'
                    : 'bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.06)] hover:bg-[rgba(0,0,0,0.05)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  <span className={`text-xs ${isDark ? 'text-[rgba(255,255,255,0.4)]' : 'text-[rgba(0,0,0,0.4)]'}`} style={{ fontFamily: FONT_HEADING }}>
                    Newsletter
                  </span>
                </div>
                <span className="text-sm text-foreground" style={{ fontFamily: FONT_HEADING, fontWeight: 500 }}>
                  Sign up for Temple updates
                </span>
              </button>
            ) : (
              <div
                className={`rounded-2xl px-6 py-4 w-full max-w-[320px] ${
                  isDark
                    ? 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]'
                    : 'bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.06)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  <span className={`text-xs ${isDark ? 'text-[rgba(255,255,255,0.4)]' : 'text-[rgba(0,0,0,0.4)]'}`} style={{ fontFamily: FONT_HEADING }}>
                    Newsletter
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoFocus
                    className="flex-1 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground outline-none py-1 text-sm"
                    style={{ fontFamily: FONT_HEADING }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setShowNewsletterInput(false);
                        setNewsletterEmail('');
                      }
                      if (e.key === 'Escape') {
                        setShowNewsletterInput(false);
                      }
                    }}
                  />
                  <button
                    onClick={() => { setShowNewsletterInput(false); setNewsletterEmail(''); }}
                    className="text-foreground text-sm px-3 py-1 rounded-full border border-border hover:bg-muted/50 transition-colors"
                    style={{ fontFamily: FONT_HEADING }}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
