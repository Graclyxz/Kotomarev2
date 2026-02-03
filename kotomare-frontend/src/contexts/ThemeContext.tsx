'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Theme,
  ThemeColors,
  darkDefault,
  lightDefault,
  getThemeById,
  createCustomTheme,
} from '@/lib/themes';

interface CustomThemeConfig {
  mode: 'light' | 'dark';
  colors: Partial<ThemeColors>;
}

interface ThemeContextType {
  theme: Theme;
  mode: 'light' | 'dark';
  setTheme: (themeId: string) => void;
  setMode: (mode: 'light' | 'dark') => void;
  toggleMode: () => void;
  customTheme: CustomThemeConfig | null;
  setCustomTheme: (config: CustomThemeConfig | null) => void;
  applyCustomTheme: () => void;
  isCustomTheme: boolean;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = 'kotomare-theme';
const CUSTOM_THEME_STORAGE_KEY = 'kotomare-custom-theme';

// Aplicar las variables CSS del tema
function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  const { colors } = theme;

  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--background-secondary', colors.backgroundSecondary);
  root.style.setProperty('--background-tertiary', colors.backgroundTertiary);
  root.style.setProperty('--foreground', colors.foreground);
  root.style.setProperty('--foreground-secondary', colors.foregroundSecondary);
  root.style.setProperty('--foreground-muted', colors.foregroundMuted);
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-hover', colors.primaryHover);
  root.style.setProperty('--primary-foreground', colors.primaryForeground);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-hover', colors.secondaryHover);
  root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--border-hover', colors.borderHover);
  root.style.setProperty('--success', colors.success);
  root.style.setProperty('--warning', colors.warning);
  root.style.setProperty('--error', colors.error);
  root.style.setProperty('--info', colors.info);

  // Añadir clase al body para modo claro/oscuro
  root.classList.remove('light', 'dark');
  root.classList.add(theme.mode);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(darkDefault);
  const [customTheme, setCustomThemeState] = useState<CustomThemeConfig | null>(null);
  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar tema desde localStorage al montar
  useEffect(() => {
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    const savedCustomTheme = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);

    if (savedCustomTheme) {
      try {
        const customConfig = JSON.parse(savedCustomTheme) as CustomThemeConfig;
        setCustomThemeState(customConfig);

        if (savedThemeId === 'custom') {
          const custom = createCustomTheme('custom', 'Personalizado', customConfig.mode, customConfig.colors);
          setThemeState(custom);
          setIsCustomTheme(true);
          applyThemeToDocument(custom);
        }
      } catch (e) {
        console.error('Error parsing custom theme:', e);
      }
    }

    if (savedThemeId && savedThemeId !== 'custom') {
      const savedTheme = getThemeById(savedThemeId);
      if (savedTheme) {
        setThemeState(savedTheme);
        applyThemeToDocument(savedTheme);
      }
    } else if (!savedThemeId) {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? darkDefault : lightDefault;
      setThemeState(defaultTheme);
      applyThemeToDocument(defaultTheme);
    }

    setMounted(true);
  }, []);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      // Solo cambiar automáticamente si no hay tema guardado
      if (!savedThemeId) {
        const newTheme = e.matches ? darkDefault : lightDefault;
        setThemeState(newTheme);
        applyThemeToDocument(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((themeId: string) => {
    if (themeId === 'custom' && customTheme) {
      const custom = createCustomTheme('custom', 'Personalizado', customTheme.mode, customTheme.colors);
      setThemeState(custom);
      setIsCustomTheme(true);
      applyThemeToDocument(custom);
      localStorage.setItem(THEME_STORAGE_KEY, 'custom');
    } else {
      const newTheme = getThemeById(themeId);
      if (newTheme) {
        setThemeState(newTheme);
        setIsCustomTheme(false);
        applyThemeToDocument(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, themeId);
      }
    }
  }, [customTheme]);

  const setMode = useCallback((mode: 'light' | 'dark') => {
    // Cambiar al tema default del modo seleccionado
    const newTheme = mode === 'dark' ? darkDefault : lightDefault;
    setThemeState(newTheme);
    setIsCustomTheme(false);
    applyThemeToDocument(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme.id);
  }, []);

  const toggleMode = useCallback(() => {
    const newMode = theme.mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [theme.mode, setMode]);

  const setCustomTheme = useCallback((config: CustomThemeConfig | null) => {
    setCustomThemeState(config);
    if (config) {
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
    }
  }, []);

  const applyCustomTheme = useCallback(() => {
    if (customTheme) {
      const custom = createCustomTheme('custom', 'Personalizado', customTheme.mode, customTheme.colors);
      setThemeState(custom);
      setIsCustomTheme(true);
      applyThemeToDocument(custom);
      localStorage.setItem(THEME_STORAGE_KEY, 'custom');
    }
  }, [customTheme]);

  // Evitar flash de tema incorrecto
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode: theme.mode,
        setTheme,
        setMode,
        toggleMode,
        customTheme,
        setCustomTheme,
        applyCustomTheme,
        isCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
