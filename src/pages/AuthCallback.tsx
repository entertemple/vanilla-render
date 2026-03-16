import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkOnboarding } from '@/utils/checkOnboarding';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
          return;
        }

        if (!session) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const { data: { session: retrySession } } = await supabase.auth.getSession();

          if (!retrySession) {
            setError('Authentication failed. Please try again.');
            setTimeout(() => navigate('/login', { replace: true }), 2000);
            return;
          }

          const isComplete = await checkOnboarding(retrySession.user.id);
          navigate(isComplete ? '/chat' : '/onboarding', { replace: true });
          return;
        }

        const isComplete = await checkOnboarding(session.user.id);
        navigate(isComplete ? '/chat' : '/onboarding', { replace: true });
      } catch {
        setError('Something went wrong.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-background">
      <span className="text-muted-foreground text-[13px]" style={{ fontFamily: "'DM Sans', Arial, sans-serif" }}>
        {error || 'Signing you in...'}
      </span>
    </div>
  );
}
