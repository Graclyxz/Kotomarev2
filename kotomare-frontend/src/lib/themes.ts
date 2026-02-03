// Definición de colores para los temas
export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Foregrounds
  foreground: string;
  foregroundSecondary: string;
  foregroundMuted: string;

  // Primary (accent color)
  primary: string;
  primaryHover: string;
  primaryForeground: string;

  // Secondary
  secondary: string;
  secondaryHover: string;
  secondaryForeground: string;

  // Borders
  border: string;
  borderHover: string;

  // States
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
}

// ==================== TEMAS OSCUROS ====================

export const darkDefault: Theme = {
  id: 'dark-default',
  name: 'Oscuro Clásico',
  mode: 'dark',
  colors: {
    background: '#09090b',
    backgroundSecondary: '#18181b',
    backgroundTertiary: '#27272a',
    foreground: '#fafafa',
    foregroundSecondary: '#a1a1aa',
    foregroundMuted: '#71717a',
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    primaryForeground: '#ffffff',
    secondary: '#3f3f46',
    secondaryHover: '#52525b',
    secondaryForeground: '#ffffff',
    border: '#27272a',
    borderHover: '#3f3f46',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export const darkPurple: Theme = {
  id: 'dark-purple',
  name: 'Morado Noche',
  mode: 'dark',
  colors: {
    background: '#0f0a1a',
    backgroundSecondary: '#1a1025',
    backgroundTertiary: '#2d1f42',
    foreground: '#f5f3ff',
    foregroundSecondary: '#c4b5fd',
    foregroundMuted: '#a78bfa',
    primary: '#a855f7',
    primaryHover: '#9333ea',
    primaryForeground: '#ffffff',
    secondary: '#4c1d95',
    secondaryHover: '#5b21b6',
    secondaryForeground: '#ffffff',
    border: '#2d1f42',
    borderHover: '#4c1d95',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#818cf8',
  },
};

export const darkBlue: Theme = {
  id: 'dark-blue',
  name: 'Azul Profundo',
  mode: 'dark',
  colors: {
    background: '#0a0f1a',
    backgroundSecondary: '#111827',
    backgroundTertiary: '#1e293b',
    foreground: '#f1f5f9',
    foregroundSecondary: '#94a3b8',
    foregroundMuted: '#64748b',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryForeground: '#ffffff',
    secondary: '#1e3a5f',
    secondaryHover: '#1e40af',
    secondaryForeground: '#ffffff',
    border: '#1e293b',
    borderHover: '#334155',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#60a5fa',
  },
};

export const darkRed: Theme = {
  id: 'dark-red',
  name: 'Rojo Sangre',
  mode: 'dark',
  colors: {
    background: '#0f0a0a',
    backgroundSecondary: '#1a1010',
    backgroundTertiary: '#2d1a1a',
    foreground: '#fef2f2',
    foregroundSecondary: '#fca5a5',
    foregroundMuted: '#f87171',
    primary: '#ef4444',
    primaryHover: '#dc2626',
    primaryForeground: '#ffffff',
    secondary: '#7f1d1d',
    secondaryHover: '#991b1b',
    secondaryForeground: '#ffffff',
    border: '#2d1a1a',
    borderHover: '#450a0a',
    success: '#22c55e',
    warning: '#eab308',
    error: '#f87171',
    info: '#3b82f6',
  },
};

export const darkGreen: Theme = {
  id: 'dark-green',
  name: 'Verde Esmeralda',
  mode: 'dark',
  colors: {
    background: '#0a0f0d',
    backgroundSecondary: '#0d1512',
    backgroundTertiary: '#14281f',
    foreground: '#ecfdf5',
    foregroundSecondary: '#6ee7b7',
    foregroundMuted: '#34d399',
    primary: '#10b981',
    primaryHover: '#059669',
    primaryForeground: '#ffffff',
    secondary: '#064e3b',
    secondaryHover: '#065f46',
    secondaryForeground: '#ffffff',
    border: '#14281f',
    borderHover: '#064e3b',
    success: '#34d399',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export const darkOrange: Theme = {
  id: 'dark-orange',
  name: 'Naranja Atardecer',
  mode: 'dark',
  colors: {
    background: '#0f0a05',
    backgroundSecondary: '#1a1008',
    backgroundTertiary: '#2d1f0d',
    foreground: '#fff7ed',
    foregroundSecondary: '#fdba74',
    foregroundMuted: '#fb923c',
    primary: '#f97316',
    primaryHover: '#ea580c',
    primaryForeground: '#ffffff',
    secondary: '#7c2d12',
    secondaryHover: '#9a3412',
    secondaryForeground: '#ffffff',
    border: '#2d1f0d',
    borderHover: '#431407',
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

// ==================== TEMAS CLAROS ====================

export const lightDefault: Theme = {
  id: 'light-default',
  name: 'Claro Clásico',
  mode: 'light',
  colors: {
    background: '#ffffff',
    backgroundSecondary: '#f4f4f5',
    backgroundTertiary: '#e4e4e7',
    foreground: '#09090b',
    foregroundSecondary: '#3f3f46',
    foregroundMuted: '#71717a',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryForeground: '#ffffff',
    secondary: '#e4e4e7',
    secondaryHover: '#d4d4d8',
    secondaryForeground: '#18181b',
    border: '#e4e4e7',
    borderHover: '#d4d4d8',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#2563eb',
  },
};

export const lightPurple: Theme = {
  id: 'light-purple',
  name: 'Lavanda',
  mode: 'light',
  colors: {
    background: '#faf5ff',
    backgroundSecondary: '#f3e8ff',
    backgroundTertiary: '#e9d5ff',
    foreground: '#1e1b4b',
    foregroundSecondary: '#4c1d95',
    foregroundMuted: '#6b21a8',
    primary: '#9333ea',
    primaryHover: '#7e22ce',
    primaryForeground: '#ffffff',
    secondary: '#e9d5ff',
    secondaryHover: '#d8b4fe',
    secondaryForeground: '#581c87',
    border: '#e9d5ff',
    borderHover: '#d8b4fe',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#2563eb',
  },
};

export const lightBlue: Theme = {
  id: 'light-blue',
  name: 'Cielo',
  mode: 'light',
  colors: {
    background: '#f0f9ff',
    backgroundSecondary: '#e0f2fe',
    backgroundTertiary: '#bae6fd',
    foreground: '#0c4a6e',
    foregroundSecondary: '#075985',
    foregroundMuted: '#0369a1',
    primary: '#0284c7',
    primaryHover: '#0369a1',
    primaryForeground: '#ffffff',
    secondary: '#bae6fd',
    secondaryHover: '#7dd3fc',
    secondaryForeground: '#0c4a6e',
    border: '#bae6fd',
    borderHover: '#7dd3fc',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#0284c7',
  },
};

export const lightGreen: Theme = {
  id: 'light-green',
  name: 'Menta',
  mode: 'light',
  colors: {
    background: '#f0fdf4',
    backgroundSecondary: '#dcfce7',
    backgroundTertiary: '#bbf7d0',
    foreground: '#14532d',
    foregroundSecondary: '#166534',
    foregroundMuted: '#15803d',
    primary: '#16a34a',
    primaryHover: '#15803d',
    primaryForeground: '#ffffff',
    secondary: '#bbf7d0',
    secondaryHover: '#86efac',
    secondaryForeground: '#14532d',
    border: '#bbf7d0',
    borderHover: '#86efac',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#2563eb',
  },
};

export const lightRose: Theme = {
  id: 'light-rose',
  name: 'Rosa',
  mode: 'light',
  colors: {
    background: '#fff1f2',
    backgroundSecondary: '#ffe4e6',
    backgroundTertiary: '#fecdd3',
    foreground: '#881337',
    foregroundSecondary: '#9f1239',
    foregroundMuted: '#be123c',
    primary: '#e11d48',
    primaryHover: '#be123c',
    primaryForeground: '#ffffff',
    secondary: '#fecdd3',
    secondaryHover: '#fda4af',
    secondaryForeground: '#881337',
    border: '#fecdd3',
    borderHover: '#fda4af',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#e11d48',
    info: '#2563eb',
  },
};

// ==================== COLECCIONES ====================

export const darkThemes: Theme[] = [
  darkDefault,
  darkPurple,
  darkBlue,
  darkRed,
  darkGreen,
  darkOrange,
];

export const lightThemes: Theme[] = [
  lightDefault,
  lightPurple,
  lightBlue,
  lightGreen,
  lightRose,
];

export const allThemes: Theme[] = [...darkThemes, ...lightThemes];

export const getThemeById = (id: string): Theme | undefined => {
  return allThemes.find((theme) => theme.id === id);
};

export const getDefaultTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'dark' ? darkDefault : lightDefault;
};

// Crear tema personalizado
export const createCustomTheme = (
  id: string,
  name: string,
  mode: 'light' | 'dark',
  colors: Partial<ThemeColors>
): Theme => {
  const baseTheme = getDefaultTheme(mode);
  return {
    id,
    name,
    mode,
    colors: { ...baseTheme.colors, ...colors },
  };
};
