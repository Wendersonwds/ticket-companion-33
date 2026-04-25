import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeName = 'light' | 'dark' | 'ocean' | 'sunset';

export const themes: { id: ThemeName; label: string; description: string }[] = [
  { id: 'light', label: 'Claro', description: 'Tema padrão claro' },
  { id: 'dark', label: 'Escuro', description: 'Tema escuro suave' },
  { id: 'ocean', label: 'Ocean', description: 'Azul oceano profundo' },
  { id: 'sunset', label: 'Sunset', description: 'Roxo & rosa moderno' },
];

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', setTheme: () => {} });

const STORAGE_KEY = 'app-theme';

function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  root.classList.remove('dark', 'theme-ocean', 'theme-sunset');
  if (theme === 'dark') root.classList.add('dark');
  else if (theme === 'ocean') root.classList.add('theme-ocean');
  else if (theme === 'sunset') root.classList.add('theme-sunset');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    return saved && ['light', 'dark', 'ocean', 'sunset'].includes(saved) ? saved : 'light';
  });

  useEffect(() => { applyTheme(theme); }, [theme]);

  const setTheme = (t: ThemeName) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
