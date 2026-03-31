import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const THEME_KEY = 'hexora_theme';
const ACCENT_KEY = 'hexora_accent';

export const ACCENT_COLORS = {
  amber:   { name: 'Amber',   primary: '#f59e0b', hover: '#d97706', light: '#fbbf24', css: 'amber' },
  emerald: { name: 'Yeşil',   primary: '#10b981', hover: '#059669', light: '#34d399', css: 'emerald' },
  blue:    { name: 'Mavi',    primary: '#3b82f6', hover: '#2563eb', light: '#60a5fa', css: 'blue' },
  violet:  { name: 'Mor',     primary: '#8b5cf6', hover: '#7c3aed', light: '#a78bfa', css: 'violet' },
  rose:    { name: 'Pembe',   primary: '#f43f5e', hover: '#e11d48', light: '#fb7185', css: 'rose' },
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [accent, setAccent] = useState(() => {
    try {
      return localStorage.getItem(ACCENT_KEY) || 'amber';
    } catch {
      return 'amber';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const color = ACCENT_COLORS[accent] || ACCENT_COLORS.amber;
    root.style.setProperty('--accent-primary', color.primary);
    root.style.setProperty('--accent-hover', color.hover);
    root.style.setProperty('--accent-light', color.light);
    // Remove old accent classes, add new
    Object.keys(ACCENT_COLORS).forEach(k => root.classList.remove(`accent-${k}`));
    root.classList.add(`accent-${accent}`);
    try { localStorage.setItem(ACCENT_KEY, accent); } catch {}
  }, [accent]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const changeAccent = useCallback((newAccent) => {
    if (ACCENT_COLORS[newAccent]) setAccent(newAccent);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accent, changeAccent, accentColors: ACCENT_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
};
