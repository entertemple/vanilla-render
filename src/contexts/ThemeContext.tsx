import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';
type Plan = 'free' | 'pro';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  shaderColors: [string, string, string];
  setShaderColors: (colors: [string, string, string]) => void;
  userPlan: Plan;
  setUserPlan: (plan: Plan) => void;
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [shaderColors, setShaderColorsState] = useState<[string, string, string]>(['#0000ff', '#ff00ff', '#ffffff']);
  const [userPlan, setUserPlanState] = useState<Plan>('free');
  const [profileImage, setProfileImageState] = useState<string | null>(null);

  // Load from localStorage first, then override with Supabase
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
    
    const savedColors = localStorage.getItem('shaderColors');
    if (savedColors) setShaderColorsState(JSON.parse(savedColors));

    const savedPlan = localStorage.getItem('userPlan') as Plan;
    if (savedPlan) setUserPlanState(savedPlan);

    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) setProfileImageState(savedProfileImage);

    // Load from Supabase profile
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        if (data.theme_preference) {
          setTheme(data.theme_preference as Theme);
          localStorage.setItem('theme', data.theme_preference);
        }
        const colors = (data as any).shader_colors;
        if (colors && Array.isArray(colors) && colors.length === 3) {
          setShaderColorsState(colors as [string, string, string]);
          localStorage.setItem('shaderColors', JSON.stringify(colors));
        }
      }
    };
    loadProfile();
  }, []);

  // Sync .dark class on document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setShaderColors = (colors: [string, string, string]) => {
    setShaderColorsState(colors);
    localStorage.setItem('shaderColors', JSON.stringify(colors));
  };

  const setUserPlan = (plan: Plan) => {
    setUserPlanState(plan);
    localStorage.setItem('userPlan', plan);
  };

  const setProfileImage = (image: string | null) => {
    setProfileImageState(image);
    if (image) {
      localStorage.setItem('profileImage', image);
    } else {
      localStorage.removeItem('profileImage');
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, toggleTheme, shaderColors, setShaderColors,
      userPlan, setUserPlan, profileImage, setProfileImage
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}