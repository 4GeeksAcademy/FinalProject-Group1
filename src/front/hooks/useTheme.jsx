import { useState, useEffect } from 'react';
const STORAGE_KEY = 'color-theme';
const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme) {
        return savedTheme;
        }
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
    }
    return 'light';
};
const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-mode');
      localStorage.setItem(STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark-mode');
      localStorage.setItem(STORAGE_KEY, 'light');
    }
  }, [theme]);
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  return { theme, toggleTheme };
};

export default useTheme;