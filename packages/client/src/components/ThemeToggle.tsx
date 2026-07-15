import { useEffect, useState } from 'react';
import { LuSun, LuMoon } from 'react-icons/lu';
import { Button } from './ui/button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dd:theme');
      if (saved === 'light') return 'light';
      if (saved === 'dark') return 'dark';
    }
    return 'dark'; // Dark mode is default
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('dd:theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      localStorage.setItem('dd:theme', 'dark');
    }
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="size-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
    >
      {theme === 'light' ? (
        <LuSun className="size-4.5 text-amber-500 transition-transform duration-300 hover:rotate-90" />
      ) : (
        <LuMoon className="size-4.5 text-blue-400 transition-transform duration-300 hover:-rotate-12" />
      )}
    </Button>
  );
}
