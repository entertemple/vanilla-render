import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface PrivacyTabProps {
  textColor: string;
  textSecondary: string;
  borderColor: string;
  inputBg: string;
  hoverBg: string;
  showSaved: (msg?: string) => void;
  onClose: () => void;
}

export default function PrivacyTab({ textColor, textSecondary, borderColor, inputBg, hoverBg, showSaved, onClose }: PrivacyTabProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [oracleHistoryEnabled, setOracleHistoryEnabled] = useState(true);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [mirrorEnabled, setMirrorEnabled] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('history_enabled, oracle_history_enabled, memory_enabled, mirror_enabled').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setHistoryEnabled((data as any).history_enabled ?? true);
          setOracleHistoryEnabled((data as any).oracle_history_enabled ?? true);
          setMemoryEnabled((data as any).memory_enabled ?? true);
          setMirrorEnabled((data as any).mirror_enabled ?? false);
        }
      });
  }, [user]);

  const saveField = async (field: string, value: boolean) => {
    if (!user) return;
    await supabase.from('profiles').update({ [field]: value } as any).eq('user_id', user.id);
    showSaved();
  };

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );

  const handleExport = async () => {
    if (!user) return;
    const [convos, msgs, entries] = await Promise.all([
      supabase.from('conversations').select('*').eq('user_id', user.id),
      supabase.from('messages').select('*'),
      supabase.from('journal_entries').select('*').eq('user_id', user.id),
    ]);
    const profile = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    const blob = new Blob([JSON.stringify({ profile: profile.data, conversations: convos.data, messages: msgs.data, journal_entries: entries.data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'temple-export.json'; a.click();
    URL.revokeObjectURL(url);
    showSaved('Exported');
  };

  const dataRows = [
    {
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12v8H2z" strokeLinejoin="round"/><path d="M2 6h12"/></svg>,
      label: 'Conversation History',
      sub: 'Save and sync your conversations',
      enabled: historyEnabled,
      onToggle: () => { setHistoryEnabled(!historyEnabled); saveField('history_enabled', !historyEnabled); },
    },
    {
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/></svg>,
      label: 'Oracle Card History',
      sub: 'Store your daily Oracle pulls',
      enabled: oracleHistoryEnabled,
      onToggle: () => { setOracleHistoryEnabled(!oracleHistoryEnabled); saveField('oracle_history_enabled', !oracleHistoryEnabled); },
    },
    {
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l4-2 4 2v4c0 3-4 6-4 6s-4-3-4-6V4z"/></svg>,
      label: 'Memory',
      sub: 'Temple remembers context across sessions',
      enabled: memoryEnabled,
      onToggle: () => { setMemoryEnabled(!memoryEnabled); saveField('memory_enabled', !memoryEnabled); },
    },
  ];

  return (
    <>
      {/* Data Section */}
      <div>
        <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Data</h3>
        <div className="space-y-2">
          {dataRows.map(row => (
            <div key={row.label} className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
              <div className="flex items-center gap-3">
                <span className={textColor}>{row.icon}</span>
                <div>
                  <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>{row.label}</p>
                  <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>{row.sub}</p>
                </div>
              </div>
              <Toggle enabled={row.enabled} onToggle={row.onToggle} />
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div>
        <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Export</h3>
        <div className={`flex items-center justify-between p-4 rounded-[16px] ${inputBg} border ${borderColor}`}>
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={textColor}>
              <path d="M8 3v8M5 8l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12h10" strokeLinecap="round"/>
            </svg>
            <div>
              <p className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>Export My Data</p>
              <p className={`font-['Inter',_sans-serif] text-[11px] ${textSecondary}`}>Download all your data as JSON</p>
            </div>
          </div>
          <button onClick={handleExport} className={`font-['Geist_Mono',_monospace] text-[12px] ${textSecondary} ${hoverBg} px-3 py-1 rounded-[8px] transition-colors`}>
            Export
          </button>
        </div>
      </div>

      {/* Legal */}
      <div>
        <h3 className={`font-['Inter',_sans-serif] font-medium text-[14px] mb-3 ${textColor}`}>Legal</h3>
        <div className="space-y-2">
          {[
            { label: 'Privacy Policy', path: '/privacy' },
            { label: 'Terms of Service', path: '/terms' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => { onClose(); navigate(item.path); }}
              className={`w-full flex items-center justify-between p-3 rounded-[12px] ${hoverBg} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={textColor}>
                  <path d="M4 2h6l3 3v9H4V2z" strokeLinejoin="round"/>
                  <path d="M6 8h4M6 10.5h3"/>
                </svg>
                <span className={`font-['Inter',_sans-serif] text-[13px] ${textColor}`}>{item.label}</span>
              </div>
              <span className={textSecondary}>→</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
