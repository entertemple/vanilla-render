import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_LAUNCH_DATE = new Date('2026-03-14');

export async function checkOnboarding(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_complete, created_at')
    .eq('user_id', userId)
    .single();

  // No row exists yet
  if (error || !data) {
    await supabase.from('profiles').insert({
      user_id: userId,
      onboarding_complete: false,
      created_at: new Date().toISOString(),
    });
    return false;
  }

  if (data.onboarding_complete === true) {
    return true;
  }

  // Row exists but onboarding not complete — check account age
  const accountCreatedAt = new Date(data.created_at);
  if (accountCreatedAt < ONBOARDING_LAUNCH_DATE) {
    await supabase.from('profiles').update({
      onboarding_complete: true,
    }).eq('user_id', userId);
    return true;
  }

  return false;
}
