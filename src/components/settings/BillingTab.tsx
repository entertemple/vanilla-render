import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BillingTabProps {
  textColor: string;
  textSecondary: string;
  borderColor: string;
  inputBg: string;
  hoverBg: string;
  theme: 'light' | 'dark';
}

const STRIPE_MONTHLY_PRICE_ID = 'price_xxx'; // Replace with real Stripe price ID
const STRIPE_ANNUAL_PRICE_ID = 'price_xxx'; // Replace with real Stripe price ID

export default function BillingTab({ textColor, textSecondary, borderColor, inputBg, hoverBg, theme }: BillingTabProps) {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState('free');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('plan').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setCurrentPlan((data as any).plan || 'free'); });
  }, [user]);

  const handleCheckout = async (priceId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, userId: user.id },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      console.error('Checkout error:', e);
    }
  };

  const features = [
    'Unlimited conversations',
    'Full beat system',
    'Daily Oracle card',
    'Silence timer',
    'Visual anchor journal',
  ];

  const pillBg = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const pillBorder = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
  const cardBg = theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.4)';
  const filledBtnBg = theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

  return (
    <>
      {/* Current Plan */}
      <div>
        <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Current Plan</h3>
        <div className={`flex items-center justify-between p-5 rounded-[12px] border ${borderColor}`} style={{ background: cardBg }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '1rem' }} className={textColor}>
              Free Trial
            </p>
            <p className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-40" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
              7 days remaining
            </p>
          </div>
          <button
            className="font-['Geist_Mono',_monospace] text-[0.75rem] px-3.5 py-1.5 rounded-[20px]"
            style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: theme === 'dark' ? '#fff' : '#000' }}
          >
            Upgrade
          </button>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Plans</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Monthly */}
          <div className={`p-5 rounded-[12px] border ${borderColor}`} style={{ background: cardBg }}>
            <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.1em] opacity-40 mb-2"
              style={{ color: theme === 'dark' ? '#fff' : '#000' }}>MONTHLY</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '2rem' }} className={textColor}>$15</p>
            <p className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-40 mb-4"
              style={{ color: theme === 'dark' ? '#fff' : '#000' }}>per month</p>
            <div className="space-y-1.5 mb-4">
              {features.map(f => (
                <p key={f} className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-50"
                  style={{ color: theme === 'dark' ? '#fff' : '#000' }}>· {f}</p>
              ))}
            </div>
            <button
              onClick={() => handleCheckout(STRIPE_MONTHLY_PRICE_ID)}
              className={`w-full py-2.5 rounded-[12px] font-['Geist_Mono',_monospace] text-[0.75rem] transition-colors ${textColor}`}
              style={{ border: `1px solid ${pillBorder}` }}
            >
              Choose Monthly
            </button>
          </div>

          {/* Annual */}
          <div className={`p-5 rounded-[12px] border ${borderColor} relative`} style={{ background: cardBg }}>
            <span className="absolute top-3 right-3 font-['Geist_Mono',_monospace] text-[0.6rem] px-1.5 py-0.5 rounded"
              style={{ color: 'rgba(200,150,60,1)', background: 'rgba(200,150,60,0.1)' }}>
              Save $81
            </span>
            <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.1em] opacity-40 mb-2"
              style={{ color: theme === 'dark' ? '#fff' : '#000' }}>ANNUAL</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '2rem' }} className={textColor}>$99</p>
            <p className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-40 mb-4"
              style={{ color: theme === 'dark' ? '#fff' : '#000' }}>per year · $8.25/mo</p>
            <div className="space-y-1.5 mb-4">
              {[...features, 'Full year visual journal'].map(f => (
                <p key={f} className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-50"
                  style={{ color: theme === 'dark' ? '#fff' : '#000' }}>· {f}</p>
              ))}
            </div>
            <button
              onClick={() => handleCheckout(STRIPE_ANNUAL_PRICE_ID)}
              className={`w-full py-2.5 rounded-[12px] font-['Geist_Mono',_monospace] text-[0.75rem] transition-colors ${textColor}`}
              style={{ background: filledBtnBg }}
            >
              Choose Annual
            </button>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div>
        <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Invoices</h3>
        <p className="font-['Geist_Mono',_monospace] text-[0.75rem] opacity-30" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
          No invoices yet.
        </p>
      </div>
    </>
  );
}
