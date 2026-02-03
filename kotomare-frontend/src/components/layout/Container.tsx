interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const sizeStyles = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[1600px]',
  full: 'max-w-full',
};

export function Container({ children, className = '', size = '2xl' }: ContainerProps) {
  return (
    <div className={`${sizeStyles[size]} mx-auto px-4 sm:px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}
