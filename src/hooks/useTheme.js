import { useEffect, useState } from 'react';

// UI-only theme switch: toggles the "dark" class on <html>. Nothing is persisted.
export default function useTheme(initial = 'system') {
  const [theme, setTheme] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
  return { theme, setTheme };
}
