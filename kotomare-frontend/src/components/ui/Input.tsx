'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--foreground-muted)' }}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg
              px-4 py-2.5
              focus:outline-none focus:ring-2 focus:border-transparent
              transition-all
              ${icon ? 'pl-10' : ''}
              ${className}
            `}
            style={{
              backgroundColor: 'var(--background-secondary)',
              border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
              color: 'var(--foreground)',
              '--tw-ring-color': error ? 'var(--error)' : 'var(--primary)',
            } as React.CSSProperties}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm" style={{ color: 'var(--error)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
