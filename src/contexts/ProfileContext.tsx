import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  display_name: string;
  avatar_url: string | null;
  email: string;
  plan: string;
}

interface ProfileContextType extends ProfileData {
  refresh: () => Promise<void>;
  updateProfile: (fields: Partial<ProfileData>) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    display_name: '',
    avatar_url: null,
    email: '',
    plan: 'free',
  });

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, plan')
      .eq('user_id', user.id)
      .single();

    setProfile({
      display_name: (data as any)?.display_name || '',
      avatar_url: (data as any)?.avatar_url || null,
      email: user.email || '',
      plan: (data as any)?.plan || 'free',
    });
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateProfile = (fields: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...fields }));
  };

  return (
    <ProfileContext.Provider value={{ ...profile, refresh, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
