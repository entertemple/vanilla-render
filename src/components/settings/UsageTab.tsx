import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UsageTabProps {
  textColor: string;
  textSecondary: string;
  borderColor: string;
  inputBg: string;
  theme: 'light' | 'dark';
}

export default function UsageTab({ textColor, textSecondary, borderColor, inputBg, theme }: UsageTabProps) {
  const { user } = useAuth();
  const [convCount, setConvCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [storageMB, setStorageMB] = useState(0);
  const [oracleCount, setOracleCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

    const load = async () => {
      const [convRes, journalRes, storageRes, allConvRes] = await Promise.all([
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfMonth),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfMonth),
        supabase.from('journal_attachments').select('size'),
        supabase.from('conversations').select('created_at').eq('user_id', user.id).gte('created_at', sixMonthsAgo),
      ]);

      setConvCount(convRes.count || 0);
      setJournalCount(journalRes.count || 0);

      const totalBytes = (storageRes.data || []).reduce((sum, a) => sum + (a.size || 0), 0);
      setStorageMB(parseFloat((totalBytes / 1024 / 1024).toFixed(1)));

      // Group conversations by month
      const months: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months[key] = 0;
      }
      (allConvRes.data || []).forEach(c => {
        const d = new Date(c.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (months[key] !== undefined) months[key]++;
      });
      setMonthlyData(Object.entries(months).map(([month, count]) => ({ month, count })));

      // Oracle pulls - table may not exist
      try {
        const { count } = await supabase.from('oracle_cards' as any).select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth);
        setOracleCount(count || 0);
      } catch { setOracleCount(0); }
    };
    load();
  }, [user]);

  const rows = [
    { label: 'Conversations', count: convCount, max: 100, display: `${convCount} conversations` },
    { label: 'Oracle Pulls', count: oracleCount, max: 30, display: `${oracleCount} pulls` },
    { label: 'Journal Entries', count: journalCount, max: 50, display: `${journalCount} entries` },
    { label: 'Storage', count: storageMB, max: 1024, display: `${storageMB} MB / 1 GB` },
  ];

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);
  const barColor = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
  const barActiveColor = theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  const trackBg = theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const fillBg = theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)';

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <>
      {/* This Month */}
      <div>
        <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>This Month</h3>
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.label} className={`flex items-center gap-3 p-3 rounded-[12px] ${inputBg} border ${borderColor}`}>
              <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor} w-28 flex-shrink-0`}>{row.label}</span>
              <div className="flex-1 mx-2" style={{ height: 3, background: trackBg, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((row.count / row.max) * 100, 100)}%`,
                  background: fillBg,
                  borderRadius: 2,
                  transition: 'width 900ms cubic-bezier(0.16,1,0.3,1)',
                }} />
              </div>
              <span className={`font-['Geist_Mono',_monospace] text-[11px] ${textSecondary} w-28 text-right flex-shrink-0`}>{row.display}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Activity */}
      <div>
        <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Monthly Activity</h3>
        <div className={`p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
          <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
            {monthlyData.map((d, i) => {
              const isCurrentMonth = i === monthlyData.length - 1;
              const height = maxCount > 0 ? (d.count / maxCount) * 64 : 0;
              const monthIndex = parseInt(d.month.split('-')[1]) - 1;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                    <div
                      className="w-full rounded-[2px]"
                      style={{
                        height: Math.max(height, 2),
                        background: isCurrentMonth ? barActiveColor : barColor,
                        transition: 'height 600ms cubic-bezier(0.16,1,0.3,1)',
                      }}
                    />
                  </div>
                  <span className="font-['Geist_Mono',_monospace] text-[0.6rem] opacity-30" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                    {monthLabels[monthIndex]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
