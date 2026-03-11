import { RouterProvider } from 'react-router';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { router } from './routes';
import ShaderBackground from './components/ShaderBackground';
import ErrorBoundary from './components/ErrorBoundary';
import { useState, useEffect } from 'react';

function AppContent() {
  const { theme, shaderColors } = useTheme();
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });

  // Debounced resize handler to prevent rapid updates
  useEffect(() => {
    let timeoutId: number;

    const handleResize = () => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout - only update after 150ms of no resizing
      timeoutId = window.setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Dark theme colors - soft pastels
  const darkShaderColors: [string, string, string] = ['#B8A4C9', '#A5C4D4', '#FFD4B8'];

  // Light theme colors - lighter pastels
  const lightShaderColors: [string, string, string] = ['#E6D9F0', '#D4E6EE', '#FFF0E6'];

  // Determine active colors
  const activeShaderColors = shaderColors[0] === '#0000ff' && theme === 'dark'
    ? darkShaderColors
    : shaderColors[0] === '#0000ff' && theme === 'light'
    ? lightShaderColors
    : shaderColors;

  return (
    <div className="w-full h-screen overflow-hidden fixed inset-0">
      {/* Shader background layer with error boundary */}
      <ErrorBoundary fallback={<div className="fixed inset-0 bg-black" />}>
        <ShaderBackground
          width={dimensions.width}
          height={dimensions.height}
          colors={activeShaderColors}
          theme={theme}
        />
      </ErrorBoundary>

      {/* Content layer */}
      <div className="relative z-10 w-full h-full">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
