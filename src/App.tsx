import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { router } from './routes';
import ShaderBackground from './components/ShaderBackground';
import ErrorBoundary from './components/ErrorBoundary';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

function AppContent() {
  const { theme, shaderConfig } = useTheme();
  const { user } = useAuth();
  const [atmosphereEnabled, setAtmosphereEnabled] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('atmosphere_enabled').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          const enabled = (data as any).atmosphere_enabled ?? true;
          setAtmosphereEnabled(enabled);
          if (!enabled) {
            document.body.style.background = theme === 'dark' ? '#080808' : '#f5f5f3';
          }
        }
      });
  }, [user]);

  // Listen for atmosphere changes from settings
  useEffect(() => {
    const handleStorage = () => {
      // Re-check by querying the shader canvas visibility
      const shaderCanvas = document.querySelector('canvas[style*="position: fixed"]') as HTMLElement | null;
      if (shaderCanvas) {
        setAtmosphereEnabled(shaderCanvas.style.display !== 'none');
      }
    };
    // Use a MutationObserver on the canvas to detect toggle changes from settings
    const observer = new MutationObserver(() => {
      const shaderCanvas = document.querySelector('canvas[style*="position: fixed"]') as HTMLElement | null;
      if (shaderCanvas) {
        const isHidden = shaderCanvas.style.display === 'none';
        setAtmosphereEnabled(!isHidden);
      }
    });
    const canvas = document.querySelector('canvas[style*="position: fixed"]');
    if (canvas) observer.observe(canvas, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, [atmosphereEnabled]);

  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Apply body background when atmosphere is off
  useEffect(() => {
    if (!atmosphereEnabled) {
      document.body.style.background = theme === 'dark' ? '#080808' : '#f5f5f3';
    } else {
      document.body.style.background = '';
    }
  }, [atmosphereEnabled, theme]);

  return (
    <div className="w-full h-screen overflow-hidden fixed inset-0">
      {atmosphereEnabled && (
        <ErrorBoundary fallback={<div className="fixed inset-0 bg-black pointer-events-none" />}>
          <ShaderBackground
            width={dimensions.width}
            height={dimensions.height}
            config={shaderConfig}
            theme={theme}
          />
        </ErrorBoundary>
      )}
      <div className="relative z-10 w-full h-full">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProfileProvider>
          <AppContent />
        </ProfileProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
