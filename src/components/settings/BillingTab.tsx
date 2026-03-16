import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface BillingTabProps {
  textColor: string;
  textSecondary: string;
  borderColor: string;
  inputBg: string;
  hoverBg: string;
  theme: 'light' | 'dark';
}

const features = [
  'Unlimited conversations',
  'Full beat system',
  'Daily Oracle card',
  'Silence timer',
  'Visual anchor journal',
];

export default function BillingTab({ textColor, textSecondary, borderColor, inputBg, hoverBg, theme }: BillingTabProps) {
  const { user } = useAuth();
  const { plan } = useProfile();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const isPro = plan === 'pro' || plan === 'pro_annual';
  const isAnnual = plan === 'pro_annual';

  const pillBg = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const pillBorder = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
  const cardBg = theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.4)';
  const dividerColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const dimColor = theme === 'dark' ? '#fff' : '#000';

  // STATE B — Active subscription
  if (isPro) {
    return (
      <>
        {/* Plan */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={textSecondary}>
              <rect x="2" y="4" width="12" height="8" rx="1.5" />
              <line x1="2" y1="7" x2="14" y2="7" />
            </svg>
            <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] ${textColor}`}>Pro Plan</h3>
          </div>
          <div className={`flex items-center justify-between p-5 rounded-[12px] border ${borderColor}`} style={{ background: cardBg }}>
            <div>
              <p className="font-['Geist_Mono',_monospace] text-[0.82rem]" style={{ color: dimColor }}>
                {isAnnual ? 'Annual' : 'Monthly'}
              </p>
              <p className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-40 mt-0.5" style={{ color: dimColor }}>
                Your subscription will auto renew on renewal date.
              </p>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="font-['Geist_Mono',_monospace] text-[0.75rem] px-3.5 py-1.5 rounded-[8px] transition-colors"
              style={{ border: `1px solid ${pillBorder}`, color: dimColor }}
            >
              Adjust plan
            </button>
          </div>
        </div>

        <div className="h-px" style={{ background: dividerColor }} />

        {/* Payment */}
        <div>
          <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Payment</h3>
          <div className={`flex items-center justify-between p-5 rounded-[12px] border ${borderColor}`} style={{ background: cardBg }}>
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: dimColor, opacity: 0.5 }}>
                <rect x="2" y="4" width="12" height="8" rx="1.5" />
                <line x1="2" y1="7" x2="14" y2="7" />
                <line x1="4.5" y1="10" x2="7" y2="10" />
              </svg>
              <p className="font-['Geist_Mono',_monospace] text-[0.82rem]" style={{ color: dimColor }}>
                Visa •••• 4242
              </p>
            </div>
            <button
              className="font-['Geist_Mono',_monospace] text-[0.75rem] px-3.5 py-1.5 rounded-[8px] transition-colors"
              style={{ border: `1px solid ${pillBorder}`, color: dimColor }}
            >
              Update
            </button>
          </div>
        </div>

        <div className="h-px" style={{ background: dividerColor }} />

        {/* Invoices */}
        <div>
          <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Invoices</h3>
          <p className="font-['Geist_Mono',_monospace] text-[0.75rem] opacity-30" style={{ color: dimColor }}>
            No invoices yet.
          </p>
        </div>

        <div className="h-px" style={{ background: dividerColor }} />

        {/* Cancellation */}
        <div>
          <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Cancellation</h3>
          <div className={`flex items-center justify-between p-5 rounded-[12px] border ${borderColor}`} style={{ background: cardBg }}>
            <p className="font-['Geist_Mono',_monospace] text-[0.82rem]" style={{ color: dimColor }}>
              Cancel plan
            </p>
            {!showCancelDialog ? (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="font-['Geist_Mono',_monospace] text-[0.75rem] px-3.5 py-1.5 rounded-[8px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-['Geist_Mono',_monospace] text-[0.7rem] text-red-400">Are you sure?</span>
                <button
                  onClick={() => setShowCancelDialog(false)}
                  className="font-['Geist_Mono',_monospace] text-[0.7rem] px-2.5 py-1 rounded-[6px] transition-colors"
                  style={{ border: `1px solid ${pillBorder}`, color: dimColor }}
                >
                  No
                </button>
                <button
                  className="font-['Geist_Mono',_monospace] text-[0.7rem] px-2.5 py-1 rounded-[6px] bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Yes, cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // STATE A — Free Trial
  return (
    <>
      <div>
        <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Plans</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Monthly */}
          <div className={`p-5 rounded-[12px] border ${borderColor}`} style={{ background: cardBg }}>
            <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.1em] opacity-40 mb-2" style={{ color: dimColor }}>MONTHLY</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '2rem' }} className={textColor}>$15</p>
            <p className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-40 mb-4" style={{ color: dimColor }}>per month</p>
            <div className="space-y-1.5 mb-4">
              {features.map(f => (
                <p key={f} className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-50" style={{ color: dimColor }}>· {f}</p>
              ))}
            </div>
            <button
              onClick={() => navigate('/pricing')}
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
            <p className="font-['Geist_Mono',_monospace] text-[0.65rem] uppercase tracking-[0.1em] opacity-40 mb-2" style={{ color: dimColor }}>ANNUAL</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 200, fontSize: '2rem' }} className={textColor}>$99</p>
            <p className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-40 mb-4" style={{ color: dimColor }}>per year · $8.25/mo</p>
            <div className="space-y-1.5 mb-4">
              {[...features, 'Full year visual journal'].map(f => (
                <p key={f} className="font-['Geist_Mono',_monospace] text-[0.72rem] opacity-50" style={{ color: dimColor }}>· {f}</p>
              ))}
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className={`w-full py-2.5 rounded-[12px] font-['Geist_Mono',_monospace] text-[0.75rem] transition-colors ${textColor}`}
              style={{ background: pillBg }}
            >
              Choose Annual
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
