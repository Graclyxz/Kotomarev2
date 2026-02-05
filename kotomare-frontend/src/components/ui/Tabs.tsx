'use client';

import { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      aria-label="Pestañas de filtros"
      className={`flex gap-1 p-1 rounded-lg ${className}`}
      style={{ backgroundColor: 'var(--background-secondary)' }}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  badge?: number | string;
  badgeVariant?: 'primary' | 'success' | 'warning';
}

export function TabsTrigger({
  value,
  children,
  className = '',
  icon,
  badge,
  badgeVariant = 'primary',
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  const badgeColors = {
    primary: { bg: 'var(--primary)', color: 'var(--primary-foreground)' },
    success: { bg: 'var(--success)', color: 'white' },
    warning: { bg: 'var(--warning)', color: 'black' },
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(value)}
      className={`
        group relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
        transition-all duration-200 cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${className}
      `}
      style={{
        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
        color: isActive ? 'var(--primary-foreground)' : 'var(--foreground-secondary)',
        // @ts-expect-error CSS custom properties
        '--tw-ring-color': 'var(--primary)',
        '--tw-ring-offset-color': 'var(--background)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
          e.currentTarget.style.color = 'var(--foreground)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--foreground-secondary)';
        }
      }}
    >
      {/* Icon */}
      {icon && (
        <span className={`shrink-0 transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`}>
          {icon}
        </span>
      )}

      {/* Label */}
      <span>{children}</span>

      {/* Badge */}
      {badge !== undefined && badge !== 0 && (
        <span
          className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full min-w-5 text-center transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : badgeColors[badgeVariant].bg,
            color: isActive ? 'inherit' : badgeColors[badgeVariant].color,
          }}
        >
          {badge}
        </span>
      )}

      {/* Hover indicator for non-active tabs */}
      {!isActive && (
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-200 group-hover:w-1/2"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      )}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={`mt-4 ${className}`}
    >
      {children}
    </div>
  );
}
