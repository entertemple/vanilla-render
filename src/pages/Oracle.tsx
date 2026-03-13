import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SacredGeometry from '../components/oracle/SacredGeometry';
import { TextShimmer } from '../components/ui/text-shimmer';

interface OracleCard {
  anchor: string;
  body: string;
}

export default function Oracle() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [card, setCard] = useState<OracleCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardVisible, setCardVisible] = useState(false);
  const [anchorVisible, setAnchorVisible] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);

  const dayIndex = new Date().getDay();
  const isDark = theme === 'dark';
  const strokeColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const fetchCard = async () => {
      try {
        // Try to get recent conversation anchors
        let recentAnchors = '';
        if (user) {
          const { data: messages } = await supabase
            .from('messages')
            .select('content, conversation_id')
            .eq('role', 'assistant')
            .order('created_at', { ascending: false })
            .limit(10);

          if (messages && messages.length > 0) {
            // Extract anchor words from responses
            const anchors = messages
              .map((m) => {
                const match = m.content.match(/ANCHOR:\s*(.+)/);
                return match ? match[1].trim() : null;
              })
              .filter(Boolean);
            if (anchors.length > 0) {
              recentAnchors = anchors.join(', ');
            }
          }
        }

        const { data, error } = await supabase.functions.invoke('oracle-card', {
          body: { recentAnchors },
        });

        if (error) throw error;
        if (data?.anchor && data?.body) {
          setCard({ anchor: data.anchor, body: data.body });
        }
      } catch (err) {
        console.error('Oracle card error:', err);
        // Fallback card
        setCard({
          anchor: 'Stillness',
          body: 'What you are looking for is not ahead of you. It has been here the entire time, waiting for you to stop moving long enough to notice.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [user]);

  // Staggered reveal
  useEffect(() => {
    if (loading) return;
    const t1 = setTimeout(() => setCardVisible(true), 400);
    const t2 = setTimeout(() => setAnchorVisible(true), 1600);
    const t3 = setTimeout(() => setBodyVisible(true), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [loading]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{ minHeight: '100%' }}
    >
      {/* Oracle Card */}
      <div
        className="relative"
        style={{
          width: 380,
          height: 560,
          maxWidth: 'calc(100vw - 3rem)',
          maxHeight: 'calc(100vh - 12rem)',
          borderRadius: 4,
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          backdropFilter: 'blur(12px)',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: cardVisible || loading ? 1 : 0,
          transform: cardVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1), transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* SVG Geometry — top 55% */}
        <div style={{ flex: '0 0 55%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SacredGeometry dayIndex={dayIndex} strokeColor={strokeColor} />
        </div>

        {/* Anchor + Body */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {loading ? (
            <TextShimmer
              duration={2.5}
              className="font-['DM_Sans'] italic text-2xl font-light [--base-color:rgba(255,255,255,0.2)] [--base-gradient-color:rgba(255,255,255,0.7)]"
            >
              Reading...
            </TextShimmer>
          ) : (
            <>
              {/* Anchor Word */}
              <div
                style={{
                  fontFamily: '"DM Sans", Arial, sans-serif',
                  fontSize: '2rem',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  textAlign: 'center',
                  letterSpacing: '0.02em',
                  marginTop: '1.5rem',
                  color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
                  opacity: anchorVisible ? 1 : 0,
                  transition: 'opacity 1000ms ease',
                }}
              >
                {card?.anchor}
              </div>

              {/* Body Text */}
              <div
                style={{
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '0.8rem',
                  lineHeight: 1.7,
                  textAlign: 'center',
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  marginTop: '0.875rem',
                  maxWidth: 280,
                  opacity: bodyVisible ? 1 : 0,
                  transition: 'opacity 800ms ease',
                }}
              >
                {card?.body}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4"
      >
        <span
          style={{
            fontFamily: '"DM Sans", Arial, sans-serif',
            fontSize: '0.85rem',
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
          }}
        >
          {dateStr}
        </span>
        <span
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: '0.75rem',
            opacity: 0.4,
            color: isDark ? '#fff' : '#000',
          }}
        >
          A new card on every visit
        </span>
      </div>
    </div>
  );
}
