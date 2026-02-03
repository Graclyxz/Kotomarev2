'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) => {
    // Estilos basados en variables CSS del tema
    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
      },
      secondary: {
        backgroundColor: 'var(--secondary)',
        color: 'var(--secondary-foreground)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--foreground-secondary)',
      },
      danger: {
        backgroundColor: 'var(--error)',
        color: '#ffffff',
      },
    };

    const hoverClass = {
      primary: 'hover:brightness-110',
      secondary: 'hover:brightness-125',
      ghost: 'hover:bg-[var(--secondary)]',
      danger: 'hover:brightness-110',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-lg cursor-pointer
          transition-all duration-200 ease-out
          hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${hoverClass[variant]}
          ${className}
        `}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
