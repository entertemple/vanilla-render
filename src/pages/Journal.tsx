import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface JournalEntry {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface Attachment {
  id: string;
  entry_id: string;
  type: string;
  name: string;
  url: string;
  size: number;
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const PaperclipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 7.5l-5.8 5.8a3.2 3.2 0 01-4.5-4.5l5.8-5.8a2 2 0 012.8 2.8L6 11.6a.8.8 0 01-1.1-1.1L10.2 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const MicIcon = ({ active }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" stroke={active ? '#ef4444' : 'currentColor'} strokeWidth="1.2"/>
    <path d="M3 7.5a5 5 0 0010 0M8 13v2" stroke={active ? '#ef4444' : 'currentColor'} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const ImageIconSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="5" cy="6" r="1.2" stroke="currentColor" strokeWidth="1"/>
    <path d="M1.5 11l3.5-3 3 2.5 2-1.5 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6.5 9.5a3 3 0 004.2.3l2-2a3 3 0 00-4.2-4.3l-1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M9.5 6.5a3 3 0 00-4.2-.3l-2 2a3 3 0 004.2 4.3l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

function formatEntryDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const date = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${day} ${date} ${month} · ${time}`;
}

function formatEditorDate(dateStr: string) {
  const d = new Date(dateStr);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const day = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const year = d.getFullYear();
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${weekday} · ${day} ${month} ${year} · ${time}`;
}

export default function Journal() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setEntries(data as JournalEntry[]);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!activeId) { setAttachments([]); return; }
    const load = async () => {
      const { data } = await supabase
        .from('journal_attachments')
        .select('*')
        .eq('entry_id', activeId);
      if (data) setAttachments(data as Attachment[]);
    };
    load();
  }, [activeId]);

  const selectEntry = (entry: JournalEntry) => {
    setActiveId(entry.id);
    setTitle(entry.title);
    setBody(entry.body);
  };

  const autoSave = useCallback((newTitle: string, newBody: string) => {
    if (!activeId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await supabase
        .from('journal_entries')
        .update({ title: newTitle, body: newBody, updated_at: new Date().toISOString() })
        .eq('id', activeId);
      setEntries(prev => prev.map(e => e.id === activeId ? { ...e, title: newTitle, body: newBody, updated_at: new Date().toISOString() } : e));
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    }, 1200);
  }, [activeId]);

  const handleTitleChange = (val: string) => { setTitle(val); autoSave(val, body); };
  const handleBodyChange = (val: string) => { setBody(val); autoSave(title, val); };

  const createEntry = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ user_id: user.id, title: '', body: '' })
      .select()
      .single();
    if (data && !error) {
      const newEntry = data as JournalEntry;
      setEntries(prev => [newEntry, ...prev]);
      selectEntry(newEntry);
    }
  };

  const removeAttachment = async (att: Attachment) => {
    if (att.url && att.type !== 'link') {
      const path = att.url.split('/journal-attachments/')[1];
      if (path) await supabase.storage.from('journal-attachments').remove([path]);
    }
    await supabase.from('journal_attachments').delete().eq('id', att.id);
    setAttachments(prev => prev.filter(a => a.id !== att.id));
  };

  const uploadFile = async (file: File, type: 'file' | 'image' | 'audio') => {
    if (!activeId || !user) return;
    const filePath = `${user.id}/${activeId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('journal-attachments').upload(filePath, file);
    if (uploadError) { console.error('Upload error:', uploadError); return; }
    const { data: urlData } = supabase.storage.from('journal-attachments').getPublicUrl(filePath);
    const { data, error } = await supabase.from('journal_attachments').insert({
      entry_id: activeId, type, name: file.name, url: urlData.publicUrl, size: file.size,
    }).select().single();
    if (data && !error) setAttachments(prev => [...prev, data as Attachment]);
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        uploadFile(file, 'audio');
        setRecordingDuration(0);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  };

  const addLink = async () => {
    if (!activeId || !linkUrl.trim()) return;
    const { data, error } = await supabase.from('journal_attachments').insert({
      entry_id: activeId, type: 'link', name: linkUrl.trim(), url: linkUrl.trim(), size: 0,
    }).select().single();
    if (data && !error) setAttachments(prev => [...prev, data as Attachment]);
    setLinkUrl('');
    setLinkInputOpen(false);
  };

  const filtered = searchQuery
    ? entries.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.body.toLowerCase().includes(searchQuery.toLowerCase()))
    : entries;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && searchOpen) { setSearchOpen(false); setSearchQuery(''); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  useEffect(() => { if (searchOpen && searchInputRef.current) searchInputRef.current.focus(); }, [searchOpen]);

  const activeEntry = entries.find(e => e.id === activeId);
  const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)';
  const textMuted = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const textSub = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)';
  const borderBase = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="w-full h-full flex flex-col" style={{ minHeight: '100%' }}>
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3" style={{ borderBottom: `1px solid ${borderBase}` }}>
        <span style={{ fontFamily: '"DM Sans", Arial, sans-serif', fontSize: '1.1rem', fontWeight: 200, fontStyle: 'italic', color: textPrimary }}>
          Journal
        </span>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '0.65rem', color: textMuted, opacity: savedIndicator ? 1 : 0, transition: 'opacity 300ms ease' }}>Saved</span>
          <button onClick={createEntry} className="attach-btn" title="New Entry" style={{ opacity: 0.5 }}><PlusIcon /></button>
          <button onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(''); }} className="attach-btn" title="Search" style={{ opacity: 0.5 }}><SearchIcon /></button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ overflow: 'hidden', maxHeight: searchOpen ? 48 : 0, transition: 'max-height 300ms ease', borderBottom: searchOpen ? `1px solid ${borderBase}` : 'none' }}>
        <input ref={searchInputRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search entries..."
          style={{ width: '100%', padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', outline: 'none', fontFamily: '"Geist Mono", monospace', fontSize: '0.8rem', color: textPrimary }} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Entry list */}
        <div className="flex-shrink-0 overflow-y-auto" style={{ width: 280, borderRight: `1px solid ${borderBase}`, scrollbarWidth: 'thin', scrollbarColor: isDark ? 'rgba(255,255,255,0.15) transparent' : 'rgba(0,0,0,0.1) transparent' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: '0.75rem', color: textMuted }}>No entries</div>
          )}
          {filtered.map(entry => (
            <div key={entry.id} onClick={() => selectEntry(entry)} className={`journal-entry-card ${entry.id === activeId ? 'active' : ''}`}>
              <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: textMuted, marginBottom: '0.35rem' }}>
                {formatEntryDate(entry.created_at)}
              </div>
              <div style={{ fontFamily: '"DM Sans", Arial, sans-serif', fontSize: '0.85rem', color: textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.title || entry.body?.slice(0, 60) || 'Untitled'}
              </div>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          {!activeEntry ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div style={{ fontFamily: '"DM Sans", Arial, sans-serif', fontSize: '1.25rem', fontWeight: 200, fontStyle: 'italic', color: textPrimary, opacity: 0.2 }}>Nothing written yet.</div>
              <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '0.75rem', color: textPrimary, opacity: 0.15, marginTop: '0.75rem' }}>Begin.</div>
            </div>
          ) : (
            <div className="journal-editor">
              <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: textMuted, marginBottom: '2.5rem' }}>
                {formatEditorDate(activeEntry.created_at)}
              </div>
              <input className="entry-title" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Title..." />
              <textarea className="entry-body" value={body} onChange={e => handleBodyChange(e.target.value)} placeholder="Write..." />

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 mb-2">
                  {attachments.map(att => (
                    <span key={att.id} className="attachment-chip">
                      <span>{att.type === 'audio' ? '🎙' : att.type === 'image' ? '🖼' : att.type === 'link' ? '🔗' : '📎'}</span>
                      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                      <button onClick={() => removeAttachment(att)} style={{ opacity: 0.5, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', padding: 0, display: 'flex' }}><CloseIcon /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="attachment-bar">
                <button className="attach-btn" title="Attach file" onClick={() => fileInputRef.current?.click()}><PaperclipIcon /></button>
                <button className="attach-btn" title={recording ? 'Stop recording' : 'Record audio'} onClick={toggleRecording}><MicIcon active={recording} /></button>
                {recording && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                    <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '0.7rem', color: textMuted }}>
                      {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
                    </span>
                  </span>
                )}
                <button className="attach-btn" title="Add image" onClick={() => imageInputRef.current?.click()}><ImageIconSvg /></button>
                <button className="attach-btn" title="Add link" onClick={() => setLinkInputOpen(!linkInputOpen)}><LinkIcon /></button>
                {linkInputOpen && (
                  <form onSubmit={e => { e.preventDefault(); addLink(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.25rem' }}>
                    <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." autoFocus
                      style={{ background: 'transparent', border: `1px solid ${borderBase}`, borderRadius: 4, padding: '0.2rem 0.5rem', fontFamily: '"Geist Mono", monospace', fontSize: '0.7rem', color: textPrimary, outline: 'none', width: 180 }} />
                  </form>
                )}
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'file'); e.target.value = ''; }} />
                <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'image'); e.target.value = ''; }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
