'use client';

import { useState, useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { darkThemes, lightThemes, darkDefault, Theme, ThemeColors } from '@/lib/themes';
import { Button } from './Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

interface ThemeSelectorProps {
  onClose?: () => void;
}

// Colores editables para el tema personalizado
const editableColors: { key: keyof ThemeColors; label: string }[] = [
  { key: 'background', label: 'Fondo Principal' },
  { key: 'backgroundSecondary', label: 'Fondo Secundario' },
  { key: 'foreground', label: 'Texto Principal' },
  { key: 'foregroundSecondary', label: 'Texto Secundario' },
  { key: 'primary', label: 'Color Primario' },
  { key: 'primaryHover', label: 'Primario Hover' },
  { key: 'secondary', label: 'Color Secundario' },
  { key: 'border', label: 'Bordes' },
];

function ThemeCard({
  theme,
  isSelected,
  onClick,
}: {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 transition-all text-left w-full
        ${isSelected
          ? 'border-[var(--primary)] ring-2 ring-[var(--primary)] ring-opacity-50'
          : 'border-[var(--border)] hover:border-[var(--border-hover)]'
        }
      `}
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Preview */}
      <div className="flex gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: theme.colors.secondary }}
        />
        <div
          className="w-6 h-6 rounded-full border"
          style={{
            backgroundColor: theme.colors.backgroundSecondary,
            borderColor: theme.colors.border,
          }}
        />
      </div>

      {/* Name */}
      <p
        className="font-medium text-sm"
        style={{ color: theme.colors.foreground }}
      >
        {theme.name}
      </p>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <svg
            className="w-5 h-5"
            style={{ color: theme.colors.primary }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-[var(--foreground-secondary)]">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-xs rounded bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)]"
        />
      </div>
    </div>
  );
}

export function ThemeSelector({ onClose }: ThemeSelectorProps) {
  const context = useContext(ThemeContext);

  // Valores por defecto si no hay contexto
  const theme = context?.theme || darkDefault;
  const setTheme = context?.setTheme || (() => {});
  const customTheme = context?.customTheme || null;
  const setCustomTheme = context?.setCustomTheme || (() => {});
  const applyCustomTheme = context?.applyCustomTheme || (() => {});
  const isCustomTheme = context?.isCustomTheme || false;

  const [customMode, setCustomMode] = useState<'light' | 'dark'>(customTheme?.mode || 'dark');
  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>(
    customTheme?.colors || {}
  );

  const handleCustomColorChange = (key: keyof ThemeColors, value: string) => {
    const newColors = { ...customColors, [key]: value };
    setCustomColors(newColors);
    setCustomTheme({ mode: customMode, colors: newColors });
  };

  const handleCustomModeChange = (mode: 'light' | 'dark') => {
    setCustomMode(mode);
    setCustomTheme({ mode, colors: customColors });
  };

  const getDefaultColorValue = (key: keyof ThemeColors): string => {
    if (customColors[key]) return customColors[key]!;
    // Get from current theme or dark default
    return theme.colors[key];
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dark">
        <TabsList className="w-full justify-center">
          <TabsTrigger value="dark">Temas Oscuros</TabsTrigger>
          <TabsTrigger value="light">Temas Claros</TabsTrigger>
          <TabsTrigger value="custom">Personalizado</TabsTrigger>
        </TabsList>

        <TabsContent value="dark">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {darkThemes.map((t) => (
              <ThemeCard
                key={t.id}
                theme={t}
                isSelected={theme.id === t.id && !isCustomTheme}
                onClick={() => setTheme(t.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="light">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {lightThemes.map((t) => (
              <ThemeCard
                key={t.id}
                theme={t}
                isSelected={theme.id === t.id && !isCustomTheme}
                onClick={() => setTheme(t.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <div className="space-y-6">
            {/* Modo base */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Modo Base
              </label>
              <div className="flex gap-2">
                <Button
                  variant={customMode === 'dark' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleCustomModeChange('dark')}
                >
                  Oscuro
                </Button>
                <Button
                  variant={customMode === 'light' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleCustomModeChange('light')}
                >
                  Claro
                </Button>
              </div>
            </div>

            {/* Color pickers */}
            <div className="space-y-4 p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
              {editableColors.map(({ key, label }) => (
                <ColorPicker
                  key={key}
                  label={label}
                  value={getDefaultColorValue(key)}
                  onChange={(value) => handleCustomColorChange(key, value)}
                />
              ))}
            </div>

            {/* Preview & Apply */}
            <div className="flex items-center justify-between">
              <div
                className="flex-1 p-4 rounded-xl border mr-4"
                style={{
                  backgroundColor: customColors.background || theme.colors.background,
                  borderColor: customColors.border || theme.colors.border,
                }}
              >
                <p
                  className="font-medium mb-1"
                  style={{ color: customColors.foreground || theme.colors.foreground }}
                >
                  Vista Previa
                </p>
                <p
                  className="text-sm"
                  style={{ color: customColors.foregroundSecondary || theme.colors.foregroundSecondary }}
                >
                  Así se verá tu tema personalizado
                </p>
                <div
                  className="mt-3 px-4 py-2 rounded-lg text-sm font-medium inline-block"
                  style={{
                    backgroundColor: customColors.primary || theme.colors.primary,
                    color: '#ffffff',
                  }}
                >
                  Botón
                </div>
              </div>

              <Button onClick={applyCustomTheme}>
                Aplicar Tema
              </Button>
            </div>

            {isCustomTheme && (
              <p className="text-sm text-[var(--success)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Tema personalizado activo
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {onClose && (
        <div className="flex justify-end pt-4 border-t border-[var(--border)]">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      )}
    </div>
  );
}
