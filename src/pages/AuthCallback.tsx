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
        // Let Supabase handle the OAuth callback automatically
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
          return;
        }

        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, onboarding_complete')
          .eq('user_id', session.user.id)
          .single();

        if (!profile || !profile.onboarding_complete) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/chat', { replace: true });
        }
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
