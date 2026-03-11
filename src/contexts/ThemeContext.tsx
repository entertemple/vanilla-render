import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Plan = 'free' | 'pro';

interface ThemeContextType {
  theme: Theme;
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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    const savedColors = localStorage.getItem('shaderColors');
    if (savedColors) {
      setShaderColorsState(JSON.parse(savedColors));
    }

    const savedPlan = localStorage.getItem('userPlan') as Plan;
    if (savedPlan) {
      setUserPlanState(savedPlan);
    }

    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImageState(savedProfileImage);
    }
  }, []);

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
      theme, 
      toggleTheme, 
      shaderColors, 
      setShaderColors,
      userPlan,
      setUserPlan,
      profileImage,
      setProfileImage
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