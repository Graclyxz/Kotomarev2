'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
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
        <select
          ref={ref}
          className={`
            w-full rounded-lg
            px-4 py-2.5
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-all appearance-none cursor-pointer
            ${className}
          `}
          style={{
            backgroundColor: 'var(--background-secondary)',
            border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
            color: 'var(--foreground)',
            '--tw-ring-color': error ? 'var(--error)' : 'var(--primary)',
          } as React.CSSProperties}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm" style={{ color: 'var(--error)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
