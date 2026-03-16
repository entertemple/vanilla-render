import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkOnboarding } from '@/utils/checkOnboarding';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let handled = false;

    const handleAuthCallback = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session && !handled) {
            handled = true;
            subscription.unsubscribe();
            const isComplete = await checkOnboarding(session.user.id);
            navigate(isComplete ? '/chat' : '/onboarding', { replace: true });
          }
        }
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (session && !handled) {
        handled = true;
        subscription.unsubscribe();
        const isComplete = await checkOnboarding(session.user.id);
        navigate(isComplete ? '/chat' : '/onboarding', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-background">
      <span className="text-muted-foreground text-[13px]" style={{ fontFamily: "'DM Sans', Arial, sans-serif" }}>
        {error || 'Signing you in...'}
      </span>
    </div>
  );
}
