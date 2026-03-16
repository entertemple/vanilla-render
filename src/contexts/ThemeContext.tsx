import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';
type Plan = 'free' | 'pro';

export interface ShaderConfig {
  color1: string;
  color2: string;
  color3: string;
  intensity: number;
  speed: number;
  preset: string;
}

export const DARK_DEFAULT: ShaderConfig = {
  color1: '#B8A4C9',
  color2: '#A5C4D4',
  color3: '#FFD4B8',
  intensity: 0.6,
  speed: 0.4,
  preset: 'default',
};

export const LIGHT_DEFAULT: ShaderConfig = {
  color1: '#E6D9F0',
  color2: '#D4E6EE',
  color3: '#FFF0E6',
  intensity: 0.5,
  speed: 0.3,
  preset: 'default',
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  shaderConfig: ShaderConfig;
  setShaderConfig: (config: Partial<ShaderConfig>) => void;
  userPlan: Plan;
  setUserPlan: (plan: Plan) => void;
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function loadLocalConfig(theme: Theme): ShaderConfig | null {
  try {
    const raw = localStorage.getItem(`temple_shader_config_${theme}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveLocalConfig(theme: Theme, config: ShaderConfig) {
  localStorage.setItem(`temple_shader_config_${theme}`, JSON.stringify(config));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [darkConfig, setDarkConfig] = useState<ShaderConfig>(loadLocalConfig('dark') || DARK_DEFAULT);
  const [lightConfig, setLightConfig] = useState<ShaderConfig>(loadLocalConfig('light') || LIGHT_DEFAULT);
  const [userPlan, setUserPlanState] = useState<Plan>('free');
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const shaderConfig = theme === 'dark' ? darkConfig : lightConfig;

  // Load from localStorage then Supabase
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setThemeState(savedTheme);

    const savedPlan = localStorage.getItem('userPlan') as Plan;
    if (savedPlan) setUserPlanState(savedPlan);

    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) setProfileImageState(savedProfileImage);

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
          setThemeState(data.theme_preference as Theme);
          localStorage.setItem('theme', data.theme_preference);
        }
        const sc = (data as any).shader_config;
        if (sc && typeof sc === 'object') {
          if (sc.dark) {
            setDarkConfig(sc.dark);
            saveLocalConfig('dark', sc.dark);
          }
          if (sc.light) {
            setLightConfig(sc.light);
            saveLocalConfig('light', sc.light);
          }
        }
      }
    };
    loadProfile();
  }, []);

  // Sync .dark class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  const setShaderConfig = useCallback((partial: Partial<ShaderConfig>) => {
    const isDark = theme === 'dark';
    const current = isDark ? darkConfig : lightConfig;
    const next = { ...current, ...partial };

    if (isDark) {
      setDarkConfig(next);
    } else {
      setLightConfig(next);
    }
    saveLocalConfig(theme, next);

    // Debounced save to Supabase
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const fullConfig = {
        dark: isDark ? next : darkConfig,
        light: isDark ? lightConfig : next,
      };
      await supabase.from('profiles').update({ shader_config: fullConfig } as any).eq('user_id', user.id);
    }, 800);
  }, [theme, darkConfig, lightConfig]);

  const setUserPlan = (plan: Plan) => {
    setUserPlanState(plan);
    localStorage.setItem('userPlan', plan);
  };

  const setProfileImage = (image: string | null) => {
    setProfileImageState(image);
    if (image) localStorage.setItem('profileImage', image);
    else localStorage.removeItem('profileImage');
  };

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, toggleTheme,
      shaderConfig, setShaderConfig,
      userPlan, setUserPlan,
      profileImage, setProfileImage,
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
