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
    const { data: authData } = await supabase.auth.getUser();
    const accountCreatedAt = new Date(authData?.user?.created_at ?? '');

    if (accountCreatedAt < ONBOARDING_LAUNCH_DATE) {
      await supabase.from('profiles').upsert({
        user_id: userId,
        onboarding_complete: true,
      });
      return true;
    }

    // New user — row should be created by trigger, but ensure onboarding_complete is false
    await supabase.from('profiles').upsert({
      user_id: userId,
      onboarding_complete: false,
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
