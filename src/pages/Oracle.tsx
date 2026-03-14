import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { TextShimmer } from '../components/ui/text-shimmer';

interface OracleCard {
  anchor: string;
  body: string;
  imageIndex: number;
}

export default function Oracle() {
  const { theme } = useTheme();
  const [card, setCard] = useState<OracleCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardVisible, setCardVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [anchorVisible, setAnchorVisible] = useState(false);
  const [dividerVisible, setDividerVisible] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);
  const [bottomVisible, setBottomVisible] = useState(false);

  const isDark = theme === 'dark';

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  useEffect(() => {
    const fetchCard = async () => {
      try {
        // Image index: daily base + random rotation
        const dayBase = new Date().getDay() % 9;
        const offset = Math.floor(Math.random() * 8) + 1;
        const imageIndex = (dayBase + offset) % 9;

        const { data, error } = await supabase.functions.invoke('oracle-card', {
          body: { imageIndex },
        });

        if (error) throw error;
        if (data?.anchor && data?.body) {
          setCard({
            anchor: data.anchor,
            body: data.body,
            imageIndex: typeof data.imageIndex === 'number' ? data.imageIndex : imageIndex,
          });
        }
      } catch (err) {
        console.error('Oracle card error:', err);
        setCard({
          anchor: 'Stillness',
          body: 'What you are looking for is not ahead of you. It has been here the entire time, waiting for you to stop moving long enough to notice.',
          imageIndex: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, []);

  // Staggered reveal
  useEffect(() => {
    if (loading) return;
    const t1 = setTimeout(() => setCardVisible(true), 300);
    const t1b = setTimeout(() => setImageVisible(true), 700);
    const t2 = setTimeout(() => setAnchorVisible(true), 2100);
    const t3 = setTimeout(() => setDividerVisible(true), 2500);
    const t4 = setTimeout(() => setBodyVisible(true), 2750);
    const t5 = setTimeout(() => setBottomVisible(true), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t1b);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [loading]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{ minHeight: '100%' }}
    >
      {/* Ambient orbs */}
      <div className="oracle-bg-orb-1" />
      <div className="oracle-bg-orb-2" />

      {/* Grain overlay */}
      <div className="oracle-grain" />

      {/* Oracle Card */}
      <div className="oracle-card-outer">
        <div
          className="oracle-card"
          style={{
            opacity: cardVisible || loading ? 1 : 0,
            transform: cardVisible
              ? 'translateY(0) scale(1)'
              : 'translateY(24px) scale(0.97)',
            transition:
              'opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1), transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Image area — top 55% */}
          <div className="oracle-image-container">
            <img
              src={`/oracle/symbol-${card?.imageIndex ?? 0}.jpg`}
              alt=""
              className={`oracle-image ${loading ? 'loading' : ''}`}
              style={{
                opacity: loading ? 0.15 : imageVisible ? 0.92 : 0,
                filter: loading ? 'blur(12px)' : 'none',
                transition: 'opacity 900ms ease, filter 900ms ease',
              }}
            />
          </div>

          {/* Anchor + Body */}
          <div
            style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '1.75rem 2.25rem 2rem',
            }}
          >
            {loading ? (
              <TextShimmer
                duration={3}
                className="font-['DM_Sans'] italic font-extralight text-[1.875rem] tracking-[0.05em] [--base-color:rgba(0,0,0,0.08)] [--base-gradient-color:rgba(0,0,0,0.4)]"
              >
                Reading...
              </TextShimmer>
            ) : (
              <>
                {/* Anchor Word */}
                <div
                  style={{
                    fontFamily: '"DM Sans", Arial, sans-serif',
                    fontSize: '1.875rem',
                    fontWeight: 200,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    letterSpacing: '0.05em',
                    color: 'rgba(0,0,0,0.88)',
                    lineHeight: 1.1,
                    opacity: anchorVisible ? 1 : 0,
                    transform: anchorVisible ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity 900ms ease, transform 900ms ease',
                  }}
                >
                  {card?.anchor}
                </div>

                {/* Divider */}
                <div
                  className="oracle-divider"
                  style={{
                    width: dividerVisible ? 28 : 0,
                    transition: 'width 500ms ease',
                  }}
                />

                {/* Body Text */}
                <div
                  style={{
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '0.75rem',
                    lineHeight: 1.9,
                    textAlign: 'center',
                    color: 'rgba(0,0,0,0.45)',
                    maxWidth: 280,
                    margin: '0 auto',
                    letterSpacing: '0.025em',
                    opacity: bodyVisible ? 1 : 0,
                    transition: 'opacity 700ms ease',
                  }}
                >
                  {card?.body}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar — date only */}
      <div
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          padding: '0 2.5rem 2rem',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          opacity: bottomVisible ? 1 : 0,
          transition: 'opacity 500ms ease',
        }}
      >
        <span>{dateStr}</span>
      </div>
    </div>
  );
}
