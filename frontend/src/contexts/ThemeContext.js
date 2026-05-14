import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// styled-components 主题对象
const styledThemes = {
  dark: {
    mode: 'dark',
    bgPrimary: '#0a0a0a',
    bgSecondary: '#12121a',
    bgTertiary: '#1a1a25',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.7)',
    textMuted: 'rgba(255,255,255,0.5)',
    textFaint: 'rgba(255,255,255,0.4)',
    border: 'rgba(255,255,255,0.1)',
    borderLight: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.2)',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBgHover: 'rgba(255,255,255,0.08)',
    inputBg: 'rgba(255,255,255,0.05)',
    navBg: 'rgba(10, 10, 10, 0.9)',
    footerBg: 'rgba(10, 10, 10, 0.9)',
    canvasBg: '#0a0a0a',
    canvasFade: 'rgba(10, 10, 10, 0.1)',
    primary: '#00d4ff',
    secondary: '#7c3aed',
    accent: '#667eea',
  },
  light: {
    mode: 'light',
    bgPrimary: '#f8fafc',
    bgSecondary: '#ffffff',
    bgTertiary: '#f1f5f9',
    textPrimary: '#1e293b',
    textSecondary: 'rgba(51,65,85,0.7)',
    textMuted: 'rgba(100,116,139,0.7)',
    textFaint: 'rgba(100,116,139,0.5)',
    border: 'rgba(0,0,0,0.1)',
    borderLight: 'rgba(0,0,0,0.06)',
    borderStrong: 'rgba(0,0,0,0.15)',
    cardBg: 'rgba(0,0,0,0.03)',
    cardBgHover: 'rgba(0,0,0,0.05)',
    inputBg: 'rgba(0,0,0,0.03)',
    navBg: 'rgba(255,255,255,0.9)',
    footerBg: 'rgba(248,250,252,0.9)',
    canvasBg: '#f8fafc',
    canvasFade: 'rgba(248,250,252,0.1)',
    primary: '#0066cc',
    secondary: '#7c3aed',
    accent: '#667eea',
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // 供 styled-components 使用的主题对象
  const styledTheme = useMemo(() => styledThemes[theme], [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <StyledThemeProvider theme={styledTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
