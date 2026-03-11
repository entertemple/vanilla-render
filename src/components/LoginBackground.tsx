import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'motion/react';

interface Circle {
  id: number;
  x: number;
  y: number;
  size: number;
  color1: string;
  color2: string;
  color3: string;
  duration: number;
  delay: number;
}

export default function LoginBackground() {
  const { theme } = useTheme();
  const [circles, setCircles] = useState<Circle[]>([]);

  useEffect(() => {
    // Generate random circles
    const generateCircles = () => {
      const colorSets = theme === 'light' 
        ? [
            { c1: 'rgba(255, 154, 0, 0.5)', c2: 'rgba(255, 107, 129, 0.4)', c3: 'rgba(255, 193, 7, 0.3)' }, // Orange to pink to yellow
            { c1: 'rgba(255, 87, 34, 0.5)', c2: 'rgba(186, 104, 200, 0.4)', c3: 'rgba(255, 138, 101, 0.3)' }, // Deep orange to purple to coral
            { c1: 'rgba(255, 109, 194, 0.5)', c2: 'rgba(255, 183, 77, 0.4)', c3: 'rgba(171, 71, 188, 0.3)' }, // Magenta to gold to purple
            { c1: 'rgba(255, 152, 0, 0.5)', c2: 'rgba(236, 64, 122, 0.4)', c3: 'rgba(255, 202, 40, 0.3)' }, // Amber to pink to bright yellow
            { c1: 'rgba(244, 67, 54, 0.5)', c2: 'rgba(156, 39, 176, 0.4)', c3: 'rgba(255, 171, 145, 0.3)' }, // Red to purple to peach
          ]
        : [
            { c1: 'rgba(255, 154, 0, 0.7)', c2: 'rgba(255, 107, 129, 0.6)', c3: 'rgba(255, 193, 7, 0.4)' }, // Orange to pink to yellow
            { c1: 'rgba(255, 87, 34, 0.7)', c2: 'rgba(186, 104, 200, 0.6)', c3: 'rgba(255, 138, 101, 0.4)' }, // Deep orange to purple to coral
            { c1: 'rgba(255, 109, 194, 0.7)', c2: 'rgba(255, 183, 77, 0.6)', c3: 'rgba(171, 71, 188, 0.4)' }, // Magenta to gold to purple
            { c1: 'rgba(255, 152, 0, 0.7)', c2: 'rgba(236, 64, 122, 0.6)', c3: 'rgba(255, 202, 40, 0.4)' }, // Amber to pink to bright yellow
            { c1: 'rgba(244, 67, 54, 0.7)', c2: 'rgba(156, 39, 176, 0.6)', c3: 'rgba(255, 171, 145, 0.4)' }, // Red to purple to peach
          ];

      const newCircles: Circle[] = [];
      for (let i = 0; i < 6; i++) {
        const colorSet = colorSets[Math.floor(Math.random() * colorSets.length)];
        newCircles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 350 + Math.random() * 500,
          color1: colorSet.c1,
          color2: colorSet.c2,
          color3: colorSet.c3,
          duration: 10 + Math.random() * 8,
          delay: Math.random() * 3,
        });
      }
      setCircles(newCircles);
    };

    generateCircles();
  }, [theme]);

  const bgColor = theme === 'light' 
    ? 'bg-gradient-to-br from-gray-100 via-gray-50 to-white' 
    : 'bg-gradient-to-br from-gray-900 via-gray-800 to-black';

  return (
    <div className={`fixed inset-0 w-screen h-screen overflow-hidden ${bgColor}`}>
      {/* Animated Gradient Circles */}
      {circles.map((circle) => (
        <motion.div
          key={circle.id}
          className="absolute"
          style={{
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(80px)',
            background: `radial-gradient(circle at center, ${circle.color1} 0%, ${circle.color2} 40%, ${circle.color3} 70%, transparent 100%)`,
          }}
          animate={{
            scale: [1, 1.3, 1.1, 1],
            opacity: [0.5, 0.8, 0.6, 0.5],
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: circle.duration,
            delay: circle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Additional overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: theme === 'light'
            ? 'radial-gradient(circle at 30% 50%, rgba(255, 192, 203, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 70% 50%, rgba(147, 112, 219, 0.15) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}