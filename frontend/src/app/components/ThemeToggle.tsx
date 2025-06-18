// components/ThemeToggle.tsx
'use client';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button onClick={toggle} className="p-2">
      {resolvedTheme === 'dark' ? (
        <Sun data-testid="sun-icon" />
      ) : (
        <Moon data-testid="moon-icon" />
      )}
    </button>
  );
}
